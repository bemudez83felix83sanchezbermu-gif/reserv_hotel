import supabase from '../supabase.js';

const table = () => supabase.schema('hotel').from('courtesies');

const SELECT = `
  id, reservation_id, total_qty, used_qty, remaining_qty, created_at,
  reservations:reservation_id ( id, code, status, check_in, check_out,
    guests:primary_guest_id ( first_name, last_name ),
    rooms:room_id ( num, name )
  )
`;

export async function listCourtesies() {
  const { data, error } = await table().select(SELECT).order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(fromRow);
}

// Historial de canjes vía restaurante.ticket_payments (method = 'courtesy').
// Puede volver [] hasta que el módulo del restaurante esté operativo.
export async function listCourtesyRedemptions(courtesyId) {
  const { data, error } = await supabase
    .schema('restaurante')
    .from('ticket_payments')
    .select('id, amount, created_at, ticket_id')
    .eq('courtesy_id', courtesyId)
    .eq('method', 'courtesy')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

function fromRow(row) {
  const res = row.reservations;
  const guest = res?.guests ? [res.guests.first_name, res.guests.last_name].filter(Boolean).join(' ') : '';
  return {
    id: row.id,
    reservationId: row.reservation_id,
    reservationCode: res?.code || '',
    reservationStatus: res?.status || '',
    checkIn: res?.check_in,
    checkOut: res?.check_out,
    guest,
    roomLabel: res?.rooms ? `Hab. ${res.rooms.num} · ${res.rooms.name}` : '',
    totalQty: row.total_qty,
    usedQty: row.used_qty,
    remainingQty: row.remaining_qty,
    createdAt: row.created_at,
  };
}
