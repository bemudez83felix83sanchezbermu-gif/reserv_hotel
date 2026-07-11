import { useCallback } from 'react';
import { useQuery, useMutation } from './useQuery.jsx';
import { listRooms, createRoom, updateRoom, deleteRoom } from '../api/rooms.js';

const KEY = 'hotel.rooms';

export function useRooms() {
  const q = useQuery(KEY, listRooms);
  const create = useMutation(createRoom, { invalidate: [KEY] });
  const update = useMutation(({ id, patch }) => updateRoom(id, patch), { invalidate: [KEY] });
  const remove = useMutation(deleteRoom, { invalidate: [KEY] });

  const saveRoom = useCallback(async (draft) => {
    if (draft.id && (q.data || []).some((r) => r.id === draft.id)) {
      return update.mutate({ id: draft.id, patch: draft });
    }
    const { id: _drop, type: _t, bed: _b, buildingName: _bn, ...payload } = draft;
    return create.mutate(payload);
  }, [q.data, create, update]);

  const patchRoom = useCallback((id, patch) => update.mutate({ id, patch }), [update]);

  return {
    rooms: q.data || [],
    loading: q.loading,
    error: q.error,
    refresh: q.refresh,
    saveRoom,
    updateRoom: patchRoom,
    deleteRoom: remove.mutate,
    saving: create.loading || update.loading || remove.loading,
  };
}
