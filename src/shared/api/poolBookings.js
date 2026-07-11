import supabase from '../supabase.js';

const table = () => supabase.schema('hotel').from('pool_bookings');

const SELECT = `
  id, kind, date, start_time, end_time, guests_count, price,
  contact_name, contact_phone, reservation_id, status, notes, created_by, created_at,
  reservations:reservation_id ( id, code )
`;

const ACTIVE_STATUSES = ['reserved', 'confirmed', 'in_progress'];

export async function listPoolBookings() {
  const { data, error } = await table().select(SELECT).order('date', { ascending: false }).order('start_time');
  if (error) throw error;
  return (data || []).map(fromRow);
}

export async function listPoolBookingsForDate(date) {
  const { data, error } = await table().select(SELECT).eq('date', date).order('start_time');
  if (error) throw error;
  return (data || []).map(fromRow);
}

export async function createPoolBooking(input) {
  const { data, error } = await table()
    .insert({
      kind: input.kind,
      date: input.date,
      start_time: input.startTime,
      end_time: input.endTime || null,
      guests_count: input.guestsCount || 1,
      price: input.price || 0,
      contact_name: input.contactName,
      contact_phone: input.contactPhone || null,
      reservation_id: input.reservationId || null,
      notes: input.notes || null,
      created_by: input.createdBy || null,
    })
    .select(SELECT)
    .single();
  if (error) throw error;
  return fromRow(data);
}

export async function updatePoolBookingStatus(id, status) {
  const { data, error } = await table().update({ status }).eq('id', id).select(SELECT).single();
  if (error) throw error;
  return fromRow(data);
}

export async function deletePoolBooking(id) {
  const { error } = await table().delete().eq('id', id);
  if (error) throw error;
}

// true si [aStart,aEnd) se traslapa con [bStart,bEnd) — end null se trata como fin del día.
function overlaps(aStart, aEnd, bStart, bEnd) {
  const aE = aEnd || '23:59:59';
  const bE = bEnd || '23:59:59';
  return aStart < bE && bStart < aE;
}

// Revisa conflictos contra las reservas activas del mismo día antes de crear.
// - Un evento no puede traslaparse con otro evento.
// - Si eventLocksPool, un day_pass no puede traslaparse con un evento.
export async function findPoolBookingConflict({ date, kind, startTime, endTime, eventLocksPool }) {
  const existing = (await listPoolBookingsForDate(date)).filter((b) => ACTIVE_STATUSES.includes(b.status));
  return existing.find((b) => {
    if (!overlaps(startTime, endTime, b.startTime, b.endTime)) return false;
    if (kind === 'event' && b.kind === 'event') return true;
    if (kind === 'day_pass' && b.kind === 'event' && eventLocksPool) return true;
    if (kind === 'event' && b.kind === 'day_pass' && eventLocksPool) return true;
    return false;
  }) || null;
}

function fromRow(row) {
  return {
    id: row.id,
    kind: row.kind,
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time,
    guestsCount: row.guests_count,
    price: Number(row.price),
    contactName: row.contact_name,
    contactPhone: row.contact_phone || '',
    reservationId: row.reservation_id,
    reservationCode: row.reservations?.code || '',
    status: row.status,
    notes: row.notes || '',
    createdAt: row.created_at,
  };
}
