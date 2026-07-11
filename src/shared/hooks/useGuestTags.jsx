import { useCallback } from 'react';
import { useQuery, useMutation } from './useQuery.jsx';
import { listGuestTags, createGuestTag, updateGuestTag, deleteGuestTag } from '../api/guestTags.js';

export const GUEST_TAGS_KEY = 'hotel.guest_tags';

export function useGuestTags() {
  const q = useQuery(GUEST_TAGS_KEY, listGuestTags);
  const create = useMutation(createGuestTag, { invalidate: [GUEST_TAGS_KEY] });
  const update = useMutation(({ id, patch }) => updateGuestTag(id, patch), { invalidate: [GUEST_TAGS_KEY] });
  const remove = useMutation(deleteGuestTag, { invalidate: [GUEST_TAGS_KEY, 'hotel.guests'] });

  const patchTag = useCallback((id, patch) => update.mutate({ id, patch }), [update]);

  return {
    tags: q.data || [],
    loading: q.loading,
    error: q.error,
    refresh: q.refresh,
    createTag: create.mutate,
    updateTag: patchTag,
    deleteTag: remove.mutate,
    saving: create.loading || update.loading || remove.loading,
  };
}
