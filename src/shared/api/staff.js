import supabase from '../supabase.js';

const table = () => supabase.from('staff');

const SELECT = `id, role_id, full_name, phone, active, created_at, roles ( id, name )`;

export async function listStaff() {
  const { data, error } = await table().select(SELECT).order('full_name');
  if (error) throw error;
  return (data || []).map(fromRow);
}

// El usuario en auth.users se crea manualmente en el dashboard de Supabase (Auth → Users →
// Add user) porque el frontend usa la anon key y no puede invitar usuarios sin una Edge
// Function con service role. Aquí solo se crea la fila espejo en public.staff con ese id.
export async function createStaffMirror(input) {
  const { data, error } = await table()
    .insert({ id: input.authUserId, role_id: input.roleId, full_name: input.fullName, phone: input.phone || null })
    .select(SELECT).single();
  if (error) throw error;
  return fromRow(data);
}

export async function updateStaff(id, patch) {
  const row = {};
  if (patch.roleId !== undefined) row.role_id = patch.roleId;
  if (patch.fullName !== undefined) row.full_name = patch.fullName;
  if (patch.phone !== undefined) row.phone = patch.phone || null;
  if (patch.active !== undefined) row.active = patch.active;
  const { data, error } = await table().update(row).eq('id', id).select(SELECT).single();
  if (error) throw error;
  return fromRow(data);
}

export async function deleteStaff(id) {
  const { error } = await table().delete().eq('id', id);
  if (error) throw error;
}

function fromRow(row) {
  return {
    id: row.id,
    roleId: row.role_id,
    roleName: row.roles?.name || '',
    fullName: row.full_name,
    phone: row.phone || '',
    active: row.active !== false,
    createdAt: row.created_at,
  };
}
