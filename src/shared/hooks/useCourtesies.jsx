import { useMemo } from 'react';
import { useQuery } from './useQuery.jsx';
import { listCourtesies, listCourtesyRedemptions } from '../api/courtesies.js';

export function useCourtesies() {
  const q = useQuery('hotel.courtesies', listCourtesies);
  return { courtesies: q.data || [], loading: q.loading, error: q.error, refresh: q.refresh };
}

export function useCourtesyRedemptions(courtesyId) {
  const key = courtesyId ? `restaurante.ticket_payments.courtesy:${courtesyId}` : null;
  const fetcher = useMemo(() => () => listCourtesyRedemptions(courtesyId), [courtesyId]);
  const q = useQuery(key, fetcher, { enabled: !!key });
  return { redemptions: q.data || [], loading: q.loading, error: q.error };
}
