import { useMemo } from 'react';
import { useQuery, useMutation } from './useQuery.jsx';
import { listKeyCardsForReservation, activateKeyCard, deactivateKeyCard, markKeyCardReplaced } from '../api/keyCards.js';

export function useKeyCards(reservationId) {
  const key = reservationId ? `hotel.key_cards.res:${reservationId}` : null;
  const fetcher = useMemo(() => () => listKeyCardsForReservation(reservationId), [reservationId]);
  const q = useQuery(key, fetcher, { enabled: !!key });
  const activate = useMutation(activateKeyCard, { invalidate: key ? [key] : [] });
  const deactivate = useMutation(deactivateKeyCard, { invalidate: key ? [key] : [] });
  const markReplaced = useMutation(markKeyCardReplaced, { invalidate: key ? [key] : [] });

  return {
    cards: q.data || [],
    activeCount: (q.data || []).filter((c) => c.status === 'active').length,
    loading: q.loading,
    error: q.error,
    refresh: q.refresh,
    activateCard: activate.mutate,
    activating: activate.loading,
    deactivateCard: deactivate.mutate,
    markCardReplaced: markReplaced.mutate,
  };
}
