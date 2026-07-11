import supabase from '../supabase.js';

const table = () => supabase.schema('hotel').from('pool_config');

export async function getPoolConfig() {
  const { data, error } = await table().select('*').eq('id', 1).maybeSingle();
  if (error) throw error;
  return fromRow(data);
}

export async function updatePoolConfig(patch) {
  const { data, error } = await table().update(toRow(patch)).eq('id', 1).select().single();
  if (error) throw error;
  return fromRow(data);
}

function toRow(input) {
  const row = {};
  if (input.mode !== undefined) row.mode = input.mode;
  if (input.maxCapacity !== undefined) row.max_capacity = input.maxCapacity;
  if (input.openTime !== undefined) row.open_time = input.openTime;
  if (input.closeTime !== undefined) row.close_time = input.closeTime;
  if (input.eventLocksPool !== undefined) row.event_locks_pool = input.eventLocksPool;
  if (input.defaultEventPrice !== undefined) row.default_event_price = input.defaultEventPrice;
  if (input.defaultDayPassPrice !== undefined) row.default_day_pass_price = input.defaultDayPassPrice;
  return row;
}

function fromRow(row) {
  if (!row) return null;
  return {
    mode: row.mode,
    maxCapacity: row.max_capacity,
    openTime: row.open_time,
    closeTime: row.close_time,
    eventLocksPool: row.event_locks_pool,
    defaultEventPrice: Number(row.default_event_price),
    defaultDayPassPrice: Number(row.default_day_pass_price),
    updatedAt: row.updated_at,
  };
}
