import supabase from '../supabase.js';

const table = () => supabase.schema('hotel').from('i18n_labels');

export async function listI18nLabels() {
  const { data, error } = await table().select('*').order('key').order('locale');
  if (error) throw error;
  return (data || []).map(fromRow);
}

export async function upsertI18nLabel(input) {
  const { data, error } = await table()
    .upsert({ key: input.key, locale: input.locale, value: input.value }, { onConflict: 'key,locale' })
    .select().single();
  if (error) throw error;
  return fromRow(data);
}

export async function deleteI18nLabel(key, locale) {
  const { error } = await table().delete().eq('key', key).eq('locale', locale);
  if (error) throw error;
}

function fromRow(row) {
  return { key: row.key, locale: row.locale, value: row.value, updatedAt: row.updated_at };
}
