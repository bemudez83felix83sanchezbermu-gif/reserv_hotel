import { useCallback, useMemo } from 'react';
import { useQuery, useMutation } from './useQuery.jsx';
import { listRatePeriods, listActiveRatePeriodsInRange, createRatePeriod, updateRatePeriod, deleteRatePeriod } from '../api/ratePeriods.js';

const KEY = 'hotel.rate_periods';

export function useRatePeriods() {
  const q = useQuery(KEY, listRatePeriods);
  const create = useMutation(createRatePeriod, { invalidate: [KEY] });
  const update = useMutation(({ id, patch }) => updateRatePeriod(id, patch), { invalidate: [KEY] });
  const remove = useMutation(deleteRatePeriod, { invalidate: [KEY] });

  const patchRatePeriod = useCallback((id, patch) => update.mutate({ id, patch }), [update]);

  return {
    ratePeriods: q.data || [],
    loading: q.loading,
    error: q.error,
    refresh: q.refresh,
    createRatePeriod: create.mutate,
    updateRatePeriod: patchRatePeriod,
    deleteRatePeriod: remove.mutate,
    saving: create.loading || update.loading || remove.loading,
  };
}

// Para el motor de precios al crear una reserva.
export function useRatePeriodsInRange(fromIso, toIso) {
  const key = fromIso && toIso ? `hotel.rate_periods.range:${fromIso}:${toIso}` : null;
  const fetcher = useMemo(() => () => listActiveRatePeriodsInRange(fromIso, toIso), [fromIso, toIso]);
  const q = useQuery(key, fetcher, { enabled: !!key });
  return { ratePeriods: q.data || [], loading: q.loading, error: q.error, refresh: q.refresh };
}
