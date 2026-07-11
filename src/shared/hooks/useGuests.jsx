import { useCallback } from 'react';
import { useQuery, useMutation } from './useQuery.jsx';
import { listGuests, createGuest, updateGuest, deleteGuest, assignGuestTag, unassignGuestTag } from '../api/guests.js';

const KEY = 'hotel.guests';

export function useGuests() {
  const q = useQuery(KEY, listGuests);
  const create = useMutation(createGuest, { invalidate: [KEY] });
  const update = useMutation(({ id, patch }) => updateGuest(id, patch), { invalidate: [KEY] });
  const remove = useMutation(deleteGuest, { invalidate: [KEY] });
  const assignTag = useMutation(({ guestId, tagId }) => assignGuestTag(guestId, tagId), { invalidate: [KEY] });
  const unassignTag = useMutation(({ guestId, tagId }) => unassignGuestTag(guestId, tagId), { invalidate: [KEY] });

  const patchGuest = useCallback((id, patch) => update.mutate({ id, patch }), [update]);
  const toggleTag = useCallback((guest, tagId) => {
    const has = (guest.tags || []).some((t) => t.id === tagId);
    return has ? unassignTag.mutate({ guestId: guest.id, tagId }) : assignTag.mutate({ guestId: guest.id, tagId });
  }, [assignTag, unassignTag]);

  const guests = q.data || [];
  const bulkAssignTag = useCallback(async (guestIds, tagId) => {
    const targets = guestIds.filter((id) => {
      const g = guests.find((x) => x.id === id);
      return g && !(g.tags || []).some((t) => t.id === tagId);
    });
    for (const guestId of targets) await assignTag.mutate({ guestId, tagId });
  }, [guests, assignTag]);

  return {
    guests,
    loading: q.loading,
    error: q.error,
    refresh: q.refresh,
    createGuest: create.mutate,
    updateGuest: patchGuest,
    deleteGuest: remove.mutate,
    toggleGuestTag: toggleTag,
    bulkAssignTag,
    saving: create.loading || update.loading || remove.loading || assignTag.loading || unassignTag.loading,
  };
}
