import supabase from '../supabase.js';

const table = () => supabase.schema('hotel').from('room_blocks');

const SELECT = `
  id, room_id, date_from, date_to, reason, notes, created_by, created_at,
  rooms:room_id ( id, num, name )
`;

export async function listRoomBlocks() {
  const { data, error } = await table().select(SELECT).order('date_from', { ascending: false });
  if (error) throw error;
  return (data || []).map(fromRow);
}

// Bloqueos que tocan al menos un día del rango [from, to].
export async function listRoomBlocksInRange(from, to) {
  const { data, error } = await table()
    .select(SELECT)
    .lte('date_from', to)
    .gte('date_to', from);
  if (error) throw error;
  return (data || []).map(fromRow);
}

export async function createRoomBlock(input) {
  const { data, error } = await table()
    .insert({
      room_id: input.roomId,
      date_from: input.dateFrom,
      date_to: input.dateTo,
      reason: input.reason,
      notes: input.notes || null,
      created_by: input.createdBy || null,
    })
    .select(SELECT)
    .single();
  if (error) throw error;
  return fromRow(data);
}

export async function deleteRoomBlock(id) {
  const { error } = await table().delete().eq('id', id);
  if (error) throw error;
}

function fromRow(row) {
  return {
    id: row.id,
    roomId: row.room_id,
    roomLabel: row.rooms ? `Hab. ${row.rooms.num} · ${row.rooms.name}` : '',
    dateFrom: row.date_from,
    dateTo: row.date_to,
    reason: row.reason,
    notes: row.notes || '',
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}
