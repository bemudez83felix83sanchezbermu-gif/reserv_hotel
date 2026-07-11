import supabase from '../supabase.js';

const table = () => supabase.schema('hotel').from('sales_channels');

export async function listSalesChannels() {
  const { data, error } = await table().select('*').order('name');
  if (error) throw error;
  return (data || []).map(fromRow);
}

export async function createSalesChannel(input) {
  const { data, error } = await table().insert(toRow(input)).select().single();
  if (error) throw error;
  return fromRow(data);
}

export async function updateSalesChannel(id, patch) {
  const { data, error } = await table().update(toRow(patch, true)).eq('id', id).select().single();
  if (error) throw error;
  return fromRow(data);
}

export async function deleteSalesChannel(id) {
  const { error } = await table().delete().eq('id', id);
  if (error) throw error;
}

function slugify(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function toRow(input, partial = false) {
  const row = {};
  if (input.name !== undefined) row.name = input.name;
  if (input.slug !== undefined) row.slug = input.slug || slugify(input.name);
  else if (!partial && input.name !== undefined) row.slug = slugify(input.name);
  if (input.commissionPercent !== undefined) row.commission_percent = input.commissionPercent;
  if (input.active !== undefined) row.active = input.active;
  if (partial && Object.keys(row).length === 0) return {};
  return row;
}

function fromRow(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    commissionPercent: Number(row.commission_percent) || 0,
    active: row.active !== false,
    createdAt: row.created_at,
  };
}
