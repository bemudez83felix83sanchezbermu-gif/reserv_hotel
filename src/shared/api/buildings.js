import supabase from '../supabase.js';

const table = () => supabase.schema('hotel').from('buildings');

export async function listBuildings() {
  const { data, error } = await table()
    .select('*')
    .order('position', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []).map(fromRow);
}

export async function createBuilding(input) {
  const payload = toRow(input);
  const { data, error } = await table().insert(payload).select().single();
  if (error) throw error;
  return fromRow(data);
}

export async function updateBuilding(id, patch) {
  const { data, error } = await table().update(toRow(patch, true)).eq('id', id).select().single();
  if (error) throw error;
  return fromRow(data);
}

export async function deleteBuilding(id) {
  const { error } = await table().delete().eq('id', id);
  if (error) throw error;
}

function toRow(input, partial = false) {
  const row = {};
  if (input.name !== undefined) row.name = input.name;
  if (input.start !== undefined) row.num_from = input.start;
  if (input.end !== undefined) row.num_to = input.end;
  if (input.position !== undefined) row.position = input.position;
  if (input.letter !== undefined || input.letterPos !== undefined) {
    const letter = (input.letter ?? '').trim() || null;
    const pos = input.letterPos ?? 'pre';
    row.letra_pre = pos === 'pre' ? letter : null;
    row.letra_suf = pos === 'suf' ? letter : null;
  }
  if (partial && Object.keys(row).length === 0) return {};
  return row;
}

function fromRow(row) {
  const letter = row.letra_pre || row.letra_suf || '';
  const letterPos = row.letra_suf ? 'suf' : 'pre';
  return {
    id: row.id,
    name: row.name,
    start: row.num_from,
    end: row.num_to,
    position: row.position,
    letter,
    letterPos,
    createdAt: row.created_at,
  };
}
