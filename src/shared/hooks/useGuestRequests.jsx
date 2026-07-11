import { useCallback } from 'react';
import { useQuery, useMutation } from './useQuery.jsx';
import {
  listGuestRequests,
  createGuestRequest,
  updateGuestRequestStatus,
  deleteGuestRequest,
} from '../api/guestRequests.js';

const KEY = 'hotel.guest_requests';

export function useGuestRequests() {
  const q = useQuery(KEY, listGuestRequests);
  const create = useMutation(createGuestRequest, { invalidate: [KEY] });
  const updateStatus = useMutation(
    ({ id, status, fulfilledBy }) => updateGuestRequestStatus(id, status, fulfilledBy),
    { invalidate: [KEY] },
  );
  const remove = useMutation(deleteGuestRequest, { invalidate: [KEY] });

  const setStatus = useCallback(
    (id, status, fulfilledBy) => updateStatus.mutate({ id, status, fulfilledBy }),
    [updateStatus],
  );

  return {
    requests: q.data || [],
    loading: q.loading,
    error: q.error,
    refresh: q.refresh,
    createRequest: create.mutate,
    setRequestStatus: setStatus,
    deleteRequest: remove.mutate,
    saving: create.loading || updateStatus.loading || remove.loading,
  };
}
