import supabase from '../supabase.js';

const table = () => supabase.schema('hotel').from('guest_requests');

const SELECT = `
  id, reservation_id, request, status, fulfilled_by, fulfilled_at, created_at,
  reservations:reservation_id ( id, code,
    guests:primary_guest_id ( first_name, last_name ),
    rooms:room_id ( num, name )
  ),
  staff:fulfilled_by ( id, full_name )
`;

export async function listGuestRequests() {
  const { data, error } = await table().select(SELECT).order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(fromRow);
}

export async function createGuestRequest(input) {
  const { data, error } = await table()
    .insert({ reservation_id: input.reservationId, request: input.request })
    .select(SELECT)
    .single();
  if (error) throw error;
  return fromRow(data);
}

export async function updateGuestRequestStatus(id, status, fulfilledBy) {
  const patch = { status };
  if (status === 'done' || status === 'cancelled') {
    patch.fulfilled_by = fulfilledBy || null;
    patch.fulfilled_at = new Date().toISOString();
  }
  const { data, error } = await table().update(patch).eq('id', id).select(SELECT).single();
  if (error) throw error;
  return fromRow(data);
}

export async function deleteGuestRequest(id) {
  const { error } = await table().delete().eq('id', id);
  if (error) throw error;
}

function fromRow(row) {
  const res = row.reservations;
  const guest = res?.guests ? [res.guests.first_name, res.guests.last_name].filter(Boolean).join(' ') : '';
  return {
    id: row.id,
    reservationId: row.reservation_id,
    reservationCode: res?.code || '',
    guest,
    roomLabel: res?.rooms ? `Hab. ${res.rooms.num} · ${res.rooms.name}` : '',
    request: row.request,
    status: row.status,
    fulfilledBy: row.fulfilled_by,
    fulfilledByName: row.staff?.full_name || '',
    fulfilledAt: row.fulfilled_at,
    createdAt: row.created_at,
  };
}
