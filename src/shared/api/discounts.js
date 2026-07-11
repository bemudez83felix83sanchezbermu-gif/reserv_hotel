import supabase from '../supabase.js';

const table = () => supabase.schema('hotel').from('discount_catalog');

export async function listDiscounts() {
  const { data, error } = await table().select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(fromRow);
}

export async function listActiveDiscounts() {
  const { data, error } = await table().select('*').eq('active', true).order('name');
  if (error) throw error;
  return (data || []).map(fromRow);
}

export async function createDiscount(input) {
  const { data, error } = await table().insert(toRow(input)).select().single();
  if (error) throw error;
  return fromRow(data);
}

export async function updateDiscount(id, patch) {
  const { data, error } = await table().update(toRow(patch, true)).eq('id', id).select().single();
  if (error) throw error;
  return fromRow(data);
}

export async function deleteDiscount(id) {
  const { error } = await table().delete().eq('id', id);
  if (error) throw error;
}

function toRow(input, partial = false) {
  const row = {};
  if (input.name !== undefined) row.name = input.name;
  if (input.code !== undefined) row.code = input.code || null;
  if (input.kind !== undefined) row.kind = input.kind;
  if (input.value !== undefined) row.value = input.value;
  if (input.validFrom !== undefined) row.valid_from = input.validFrom || null;
  if (input.validUntil !== undefined) row.valid_until = input.validUntil || null;
  if (input.maxUses !== undefined) row.max_uses = input.maxUses || null;
  if (input.active !== undefined) row.active = input.active;
  if (partial && Object.keys(row).length === 0) return {};
  return row;
}

function fromRow(row) {
  return {
    id: row.id,
    name: row.name,
    code: row.code || '',
    kind: row.kind,
    value: Number(row.value),
    validFrom: row.valid_from,
    validUntil: row.valid_until,
    maxUses: row.max_uses,
    usedCount: row.used_count || 0,
    active: row.active !== false,
    createdAt: row.created_at,
  };
}
