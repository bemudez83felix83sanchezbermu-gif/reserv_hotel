import { useMemo } from 'react';
import { useQuery, useMutation } from './useQuery.jsx';
import { listRoomChanges, changeReservationRoom } from '../api/roomChanges.js';

export function useRoomChanges(reservationId) {
  const key = reservationId ? `hotel.room_changes.res:${reservationId}` : null;
  const fetcher = useMemo(() => () => listRoomChanges(reservationId), [reservationId]);
  const q = useQuery(key, fetcher, { enabled: !!key });
  const change = useMutation(changeReservationRoom, {
    invalidate: [key, 'hotel.reservations'].filter(Boolean),
  });

  return {
    changes: q.data || [],
    loading: q.loading,
    error: q.error,
    refresh: q.refresh,
    changeRoom: change.mutate,
    changing: change.loading,
  };
}
