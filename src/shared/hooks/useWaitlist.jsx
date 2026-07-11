import { useQuery, useMutation } from './useQuery.jsx';
import {
  listWaitlist,
  createWaitlistEntry,
  updateWaitlistStatus,
  deleteWaitlistEntry,
} from '../api/waitlist.js';

const KEY = 'hotel.waitlist';

export function useWaitlist() {
  const q = useQuery(KEY, listWaitlist);
  const create = useMutation(createWaitlistEntry, { invalidate: [KEY] });
  const updateStatus = useMutation(({ id, status }) => updateWaitlistStatus(id, status), { invalidate: [KEY] });
  const remove = useMutation(deleteWaitlistEntry, { invalidate: [KEY] });

  return {
    entries: q.data || [],
    loading: q.loading,
    error: q.error,
    refresh: q.refresh,
    createEntry: create.mutate,
    setStatus: (id, status) => updateStatus.mutate({ id, status }),
    deleteEntry: remove.mutate,
    saving: create.loading || updateStatus.loading || remove.loading,
  };
}
