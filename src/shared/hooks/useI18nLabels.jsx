import { useCallback } from 'react';
import { useQuery, useMutation } from './useQuery.jsx';
import { listI18nLabels, upsertI18nLabel, deleteI18nLabel } from '../api/i18nLabels.js';

const KEY = 'hotel.i18n_labels';

export function useI18nLabels() {
  const q = useQuery(KEY, listI18nLabels);
  const upsert = useMutation(upsertI18nLabel, { invalidate: [KEY] });
  const remove = useMutation(({ key, locale }) => deleteI18nLabel(key, locale), { invalidate: [KEY] });

  const saveLabel = useCallback((key, locale, value) => upsert.mutate({ key, locale, value }), [upsert]);
  const removeLabel = useCallback((key, locale) => remove.mutate({ key, locale }), [remove]);

  return {
    labels: q.data || [],
    loading: q.loading,
    error: q.error,
    refresh: q.refresh,
    saveLabel,
    deleteLabel: removeLabel,
    saving: upsert.loading || remove.loading,
  };
}

// Cae al propio key si no hay traducción cargada todavía o no existe para ese locale.
export function useLabel(key, locale = 'es') {
  const q = useQuery(KEY, listI18nLabels);
  const found = (q.data || []).find((l) => l.key === key && l.locale === locale);
  return found ? found.value : key;
}
