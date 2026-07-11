import supabase from '../supabase.js';

const changes = () => supabase.schema('hotel').from('room_changes');
const reservations = () => supabase.schema('hotel').from('reservations');

const SELECT = `
  id, reservation_id, from_room_id, to_room_id, reason, changed_by, changed_at,
  from_room:from_room_id ( id, num, name ),
  to_room:to_room_id ( id, num, name )
`;

export async function listRoomChanges(reservationId) {
  const { data, error } = await changes()
    .select(SELECT)
    .eq('reservation_id', reservationId)
    .order('changed_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(fromRow);
}

export async function changeReservationRoom({ reservationId, fromRoomId, toRoomId, reason, changedBy }) {
  const { data, error } = await changes()
    .insert({
      reservation_id: reservationId,
      from_room_id: fromRoomId,
      to_room_id: toRoomId,
      reason: reason || null,
      changed_by: changedBy || null,
    })
    .select(SELECT)
    .single();
  if (error) throw error;

  const { error: resError } = await reservations().update({ room_id: toRoomId }).eq('id', reservationId);
  if (resError) throw resError;

  return fromRow(data);
}

function fromRow(row) {
  return {
    id: row.id,
    reservationId: row.reservation_id,
    fromRoomId: row.from_room_id,
    fromRoomLabel: row.from_room ? `Hab. ${row.from_room.num} · ${row.from_room.name}` : '',
    toRoomId: row.to_room_id,
    toRoomLabel: row.to_room ? `Hab. ${row.to_room.num} · ${row.to_room.name}` : '',
    reason: row.reason || '',
    changedBy: row.changed_by,
    changedAt: row.changed_at,
  };
}
