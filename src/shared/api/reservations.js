import supabase from '../supabase.js';
import { generateReservationCode } from '../utils/pricing.js';

const table = () => supabase.schema('hotel').from('reservations');

const SELECT = `
  id, code, primary_guest_id, room_id, company_id, channel_id,
  check_in, check_out, guests_count, status, total,
  guests:primary_guest_id ( id, first_name, last_name ),
  rooms:room_id ( id, num, name ),
  reservation_packages ( qty, unit_price, packages ( id, name ) )
`;

export async function listReservations() {
  const { data, error } = await table().select(SELECT).order('check_in', { ascending: false });
  if (error) throw error;
  return (data || []).map(fromRow);
}

// Reservas que ocupan al menos un día del rango [from, to] (dates ISO YYYY-MM-DD).
export async function listReservationsInRange(from, to) {
  const { data, error } = await table()
    .select(SELECT)
    .lte('check_in', to)
    .gte('check_out', from)
    .order('check_in');
  if (error) throw error;
  return (data || []).map(fromRow);
}

// Reservas cuyo check-in cae en el día (llegadas de hoy).
export async function listArrivals(dateIso) {
  const { data, error } = await table()
    .select(SELECT)
    .eq('check_in', dateIso)
    .order('created_at');
  if (error) throw error;
  return (data || []).map(fromRow);
}

// Reservas activas (en-casa) al día indicado.
export async function listInHouse(dateIso) {
  const { data, error } = await table()
    .select(SELECT)
    .lte('check_in', dateIso)
    .gt('check_out', dateIso)
    .order('check_in');
  if (error) throw error;
  return (data || []).map(fromRow);
}

// Reservas cuyo check-out cae en el día (salidas de hoy).
export async function listDepartures(dateIso) {
  const { data, error } = await table()
    .select(SELECT)
    .eq('check_out', dateIso)
    .order('created_at');
  if (error) throw error;
  return (data || []).map(fromRow);
}

// Historial de estancias de un huésped (para la vista de Huéspedes).
export async function listReservationsByGuest(guestId) {
  const { data, error } = await table()
    .select(SELECT)
    .eq('primary_guest_id', guestId)
    .order('check_in', { ascending: false });
  if (error) throw error;
  return (data || []).map(fromRow);
}

// Crea la reserva y lo que depende de ella al confirmar: paquetes contratados y
// descuentos aplicados. Folio (balance = total) y cortesías (total_qty) los crea
// automáticamente el trigger hotel.tg_reservation_bootstrap (Fase 7) — no se insertan
// aquí para no chocar con la fila que el trigger ya generó (reservation_id es unique
// en ambas tablas). Inserciones secuenciales — no hay transacciones desde el cliente.
export async function createReservation(payload) {
  const prefix = payload.reservationPrefix || 'RES';
  let created = null;
  for (let attempt = 0; attempt < 5 && !created; attempt++) {
    const code = generateReservationCode(prefix);
    const { data, error } = await table().insert({
      code,
      primary_guest_id: payload.primaryGuestId,
      room_id: payload.roomId,
      company_id: payload.companyId || null,
      channel_id: payload.channelId,
      check_in: payload.checkIn,
      check_out: payload.checkOut,
      guests_count: payload.guestsCount,
      status: payload.status || 'confirmada',
      total_before_discount: payload.totalBeforeDiscount,
      discount_total: payload.discountTotal || 0,
      total: payload.total,
      notes: payload.notes || null,
      created_by: payload.createdBy || null,
    }).select(SELECT).single();
    if (error) {
      if (error.code === '23505' && attempt < 4) continue; // colisión de código, reintenta
      throw error;
    }
    created = data;
  }

  const reservationId = created.id;

  if (payload.packages?.length) {
    const { error } = await supabase.schema('hotel').from('reservation_packages').insert(
      payload.packages.map((p) => ({ reservation_id: reservationId, package_id: p.packageId, qty: p.qty, unit_price: p.unitPrice })),
    );
    if (error) throw error;
  }

  if (payload.discounts?.length) {
    const { error } = await supabase.schema('hotel').from('reservation_discounts').insert(
      payload.discounts.map((d) => ({ reservation_id: reservationId, discount_id: d.discountId, applied_amount: d.appliedAmount, applied_by: payload.createdBy || null })),
    );
    if (error) throw error;
  }

  const { data: full, error: refetchError } = await table().select(SELECT).eq('id', reservationId).single();
  if (refetchError) throw refetchError;
  return fromRow(full);
}

export async function updateReservationStatus(id, status) {
  const { data, error } = await table().update({ status }).eq('id', id).select(SELECT).single();
  if (error) throw error;
  return fromRow(data);
}

function fromRow(row) {
  const guest = row.guests
    ? [row.guests.first_name, row.guests.last_name].filter(Boolean).join(' ')
    : '';
  const packages = (row.reservation_packages || []).map((rp) => ({
    id: rp.packages?.id,
    name: rp.packages?.name || '',
    qty: rp.qty,
    unitPrice: Number(rp.unit_price),
  }));
  return {
    id: row.id,
    code: row.code,
    guest,
    guestId: row.primary_guest_id,
    roomId: row.room_id,
    roomNum: row.rooms?.num || '',
    roomName: row.rooms?.name || '',
    companyId: row.company_id,
    channelId: row.channel_id,
    checkIn: row.check_in,
    checkOut: row.check_out,
    guestsCount: row.guests_count,
    status: row.status,
    total: row.total != null ? Number(row.total) : null,
    packages,
  };
}
