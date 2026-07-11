import { useCallback } from 'react';
import { useQuery, useMutation } from './useQuery.jsx';
import { listFeatureFlags, setFeatureFlagEnabled } from '../api/featureFlags.js';

const KEY = 'hotel.feature_flags';

export function useFeatureFlags() {
  const q = useQuery(KEY, listFeatureFlags);
  const toggle = useMutation(({ feature, enabled }) => setFeatureFlagEnabled(feature, enabled), { invalidate: [KEY] });

  const setEnabled = useCallback((feature, enabled) => toggle.mutate({ feature, enabled }), [toggle]);

  return {
    flags: q.data || [],
    loading: q.loading,
    error: q.error,
    refresh: q.refresh,
    setFlagEnabled: setEnabled,
    saving: toggle.loading,
  };
}

// true si el flag está explícitamente deshabilitado; mientras carga o si no existe, no oculta nada.
export function useIsFeatureDisabled(feature) {
  const q = useQuery(KEY, listFeatureFlags);
  if (!q.data) return false;
  const row = q.data.find((f) => f.feature === feature);
  return row ? row.enabled === false : false;
}
