import supabase from '../supabase.js';

const table = () => supabase.schema('hotel').from('feature_flags');

export async function listFeatureFlags() {
  const { data, error } = await table().select('*').order('feature');
  if (error) throw error;
  return (data || []).map(fromRow);
}

export async function setFeatureFlagEnabled(feature, enabled) {
  const { data, error } = await table().update({ enabled }).eq('feature', feature).select().single();
  if (error) throw error;
  return fromRow(data);
}

function fromRow(row) {
  return { feature: row.feature, enabled: row.enabled, config: row.config || {}, updatedAt: row.updated_at };
}
