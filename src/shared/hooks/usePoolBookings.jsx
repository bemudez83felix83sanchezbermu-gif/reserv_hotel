import { useCallback } from 'react';
import { useQuery, useMutation } from './useQuery.jsx';
import {
  listPoolBookings,
  createPoolBooking,
  updatePoolBookingStatus,
  deletePoolBooking,
  findPoolBookingConflict,
} from '../api/poolBookings.js';

const KEY = 'hotel.pool_bookings';

export function usePoolBookings() {
  const q = useQuery(KEY, listPoolBookings);
  const create = useMutation(createPoolBooking, { invalidate: [KEY] });
  const updateStatus = useMutation(({ id, status }) => updatePoolBookingStatus(id, status), { invalidate: [KEY] });
  const remove = useMutation(deletePoolBooking, { invalidate: [KEY] });

  const setStatus = useCallback((id, status) => updateStatus.mutate({ id, status }), [updateStatus]);

  return {
    bookings: q.data || [],
    loading: q.loading,
    error: q.error,
    refresh: q.refresh,
    createBooking: create.mutate,
    setBookingStatus: setStatus,
    deleteBooking: remove.mutate,
    checkConflict: findPoolBookingConflict,
    saving: create.loading || updateStatus.loading || remove.loading,
  };
}
