import supabase from '../supabase.js';

const table = () => supabase.from('roles');

export async function listRoles() {
  const { data, error } = await table().select('*').order('name');
  if (error) throw error;
  return (data || []).map(fromRow);
}

export async function createRole(input) {
  const { data, error } = await table()
    .insert({
      name: input.name, description: input.description || null,
      permissions: input.permissions || {},
      hotel_access: input.hotelAccess ?? true,
      restaurant_access: input.restaurantAccess ?? false,
    })
    .select().single();
  if (error) throw error;
  return fromRow(data);
}

export async function updateRole(id, patch) {
  const row = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.description !== undefined) row.description = patch.description || null;
  if (patch.permissions !== undefined) row.permissions = patch.permissions;
  if (patch.hotelAccess !== undefined) row.hotel_access = patch.hotelAccess;
  if (patch.restaurantAccess !== undefined) row.restaurant_access = patch.restaurantAccess;
  const { data, error } = await table().update(row).eq('id', id).select().single();
  if (error) throw error;
  return fromRow(data);
}

export async function deleteRole(id) {
  const { error } = await table().delete().eq('id', id);
  if (error) throw error;
}

function fromRow(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    permissions: row.permissions || {},
    hotelAccess: row.hotel_access,
    restaurantAccess: row.restaurant_access,
    createdAt: row.created_at,
  };
}
