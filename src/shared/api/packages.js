import supabase from '../supabase.js';

const table = () => supabase.schema('hotel').from('packages');

// Mapeo label visible ↔ enum hotel.pkg_unit
const LABEL_TO_ENUM = {
  'por persona / día': 'persona_dia',
  'por persona': 'persona',
  'por pareja': 'pareja',
  'por estancia': 'estancia',
};
const ENUM_TO_LABEL = Object.fromEntries(Object.entries(LABEL_TO_ENUM).map(([k, v]) => [v, k]));

export const UNIT_LABELS = Object.keys(LABEL_TO_ENUM);
export const labelForUnit = (u) => ENUM_TO_LABEL[u] || u;
export const enumForUnit = (label) => LABEL_TO_ENUM[label] || label;

export async function listPackages() {
  const { data, error } = await table()
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []).map(fromRow);
}

export async function createPackage(input) {
  const { data, error } = await table().insert(toRow(input)).select().single();
  if (error) throw error;
  return fromRow(data);
}

export async function updatePackage(id, patch) {
  const row = toRow(patch, true);
  const { data, error } = await table().update(row).eq('id', id).select().single();
  if (error) throw error;
  return fromRow(data);
}

export async function deletePackage(id) {
  const { error } = await table().delete().eq('id', id);
  if (error) throw error;
}

function toRow(input, partial = false) {
  const row = {};
  if (input.name !== undefined) row.name = input.name;
  if (input.price !== undefined) row.price = input.price;
  if (input.unit !== undefined) row.unit = LABEL_TO_ENUM[input.unit] || input.unit;
  if (input.desc !== undefined) row.description = input.desc;
  if (input.description !== undefined) row.description = input.description;
  if (input.active !== undefined) row.active = input.active;
  if (partial && Object.keys(row).length === 0) return {};
  return row;
}

function fromRow(row) {
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    unit: ENUM_TO_LABEL[row.unit] || row.unit,
    desc: row.description || '',
    active: row.active !== false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
