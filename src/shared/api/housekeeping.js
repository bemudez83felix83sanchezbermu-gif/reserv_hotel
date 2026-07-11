import supabase from '../supabase.js';

const rooms = () => supabase.schema('hotel').from('rooms');
const tasks = () => supabase.schema('hotel').from('housekeeping_tasks');

const TASK_SELECT = `
  id, room_id, assigned_to, task_type, status, scheduled_at, completed_at, notes, created_at,
  rooms:room_id ( id, num, name ),
  staff:assigned_to ( id, full_name )
`;

export async function setHousekeepingStatus(roomId, status) {
  const { data, error } = await rooms()
    .update({ housekeeping_status: status })
    .eq('id', roomId)
    .select('id, housekeeping_status')
    .single();
  if (error) throw error;
  return data;
}

export async function listHousekeepingTasks() {
  const { data, error } = await tasks().select(TASK_SELECT).order('scheduled_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(fromTaskRow);
}

export async function createHousekeepingTask(input) {
  const { data, error } = await tasks()
    .insert({
      room_id: input.roomId,
      assigned_to: input.assignedTo || null,
      task_type: input.taskType,
      notes: input.notes || null,
    })
    .select(TASK_SELECT)
    .single();
  if (error) throw error;
  return fromTaskRow(data);
}

export async function updateHousekeepingTaskStatus(id, status) {
  const patch = { status };
  if (status === 'done') patch.completed_at = new Date().toISOString();
  const { data, error } = await tasks().update(patch).eq('id', id).select(TASK_SELECT).single();
  if (error) throw error;
  return fromTaskRow(data);
}

export async function listCamaristas() {
  const { data, error } = await supabase
    .from('staff')
    .select('id, full_name, active, roles(name)')
    .eq('active', true)
    .eq('roles.name', 'camarista');
  if (error) throw error;
  return (data || []).filter((s) => s.roles).map((s) => ({ id: s.id, name: s.full_name }));
}

function fromTaskRow(row) {
  return {
    id: row.id,
    roomId: row.room_id,
    roomLabel: row.rooms ? `Hab. ${row.rooms.num} · ${row.rooms.name}` : '',
    assignedTo: row.assigned_to,
    assignedName: row.staff?.full_name || '',
    taskType: row.task_type,
    status: row.status,
    scheduledAt: row.scheduled_at,
    completedAt: row.completed_at,
    notes: row.notes || '',
    createdAt: row.created_at,
  };
}
