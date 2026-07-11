import supabase from '../supabase.js';

const table = () => supabase.schema('hotel').from('rate_periods');
const SELECT = 'id, name, date_from, date_to, kind, value, applies_to_room_type_id, active, created_at, room_types:applies_to_room_type_id ( id, name )';

export async function listRatePeriods() {
  const { data, error } = await table().select(SELECT).order('date_from', { ascending: false });
  if (error) throw error;
  return (data || []).map(fromRow);
}

// Periodos activos que tocan el rango [from, to) — para el cálculo de precio de una reserva.
export async function listActiveRatePeriodsInRange(from, to) {
  const { data, error } = await table()
    .select(SELECT)
    .eq('active', true)
    .lt('date_from', to)
    .gte('date_to', from);
  if (error) throw error;
  return (data || []).map(fromRow);
}

export async function createRatePeriod(input) {
  const { data, error } = await table().insert(toRow(input)).select(SELECT).single();
  if (error) throw error;
  return fromRow(data);
}

export async function updateRatePeriod(id, patch) {
  const { data, error } = await table().update(toRow(patch, true)).eq('id', id).select(SELECT).single();
  if (error) throw error;
  return fromRow(data);
}

export async function deleteRatePeriod(id) {
  const { error } = await table().delete().eq('id', id);
  if (error) throw error;
}

function toRow(input, partial = false) {
  const row = {};
  if (input.name !== undefined) row.name = input.name;
  if (input.dateFrom !== undefined) row.date_from = input.dateFrom;
  if (input.dateTo !== undefined) row.date_to = input.dateTo;
  if (input.kind !== undefined) row.kind = input.kind;
  if (input.value !== undefined) row.value = input.value;
  if (input.appliesToRoomTypeId !== undefined) row.applies_to_room_type_id = input.appliesToRoomTypeId || null;
  if (input.active !== undefined) row.active = input.active;
  if (partial && Object.keys(row).length === 0) return {};
  return row;
}

function fromRow(row) {
  return {
    id: row.id,
    name: row.name,
    dateFrom: row.date_from,
    dateTo: row.date_to,
    kind: row.kind,
    value: Number(row.value),
    appliesToRoomTypeId: row.applies_to_room_type_id,
    roomTypeName: row.room_types?.name || '',
    active: row.active !== false,
    createdAt: row.created_at,
  };
}
