import supabase from '../supabase.js';

const table = () => supabase.schema('hotel').from('guest_tags');

export async function listGuestTags() {
  const { data, error } = await table().select('id, name, color, icon, created_at').order('name');
  if (error) throw error;
  return (data || []).map(fromRow);
}

export async function createGuestTag(input) {
  const { data, error } = await table().insert(toRow(input)).select().single();
  if (error) throw error;
  return fromRow(data);
}

export async function updateGuestTag(id, patch) {
  const { data, error } = await table().update(toRow(patch, true)).eq('id', id).select().single();
  if (error) throw error;
  return fromRow(data);
}

export async function deleteGuestTag(id) {
  const { error } = await table().delete().eq('id', id);
  if (error) throw error;
}

function toRow(input, partial = false) {
  const row = {};
  if (input.name !== undefined) row.name = input.name;
  if (input.color !== undefined) row.color = input.color || null;
  if (input.icon !== undefined) row.icon = input.icon || null;
  if (partial && Object.keys(row).length === 0) return {};
  return row;
}

function fromRow(row) {
  return {
    id: row.id,
    name: row.name,
    color: row.color || '',
    icon: row.icon || '',
    createdAt: row.created_at,
  };
}
