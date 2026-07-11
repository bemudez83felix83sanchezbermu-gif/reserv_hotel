import { useMemo } from 'react';
import { useQuery, useMutation } from './useQuery.jsx';
import { listRoomBlocks, listRoomBlocksInRange, createRoomBlock, deleteRoomBlock } from '../api/roomBlocks.js';

const KEY = 'hotel.room_blocks';

export function useRoomBlocks() {
  const q = useQuery(KEY, listRoomBlocks);
  const create = useMutation(createRoomBlock, { invalidate: [KEY] });
  const remove = useMutation(deleteRoomBlock, { invalidate: [KEY] });

  return {
    blocks: q.data || [],
    loading: q.loading,
    error: q.error,
    refresh: q.refresh,
    createBlock: create.mutate,
    deleteBlock: remove.mutate,
    saving: create.loading || remove.loading,
  };
}

export function useRoomBlocksInRange(fromIso, toIso) {
  const key = fromIso && toIso ? `hotel.room_blocks.range:${fromIso}:${toIso}` : null;
  const fetcher = useMemo(() => () => listRoomBlocksInRange(fromIso, toIso), [fromIso, toIso]);
  const q = useQuery(key, fetcher, { enabled: !!key });
  return { blocks: q.data || [], loading: q.loading, error: q.error, refresh: q.refresh };
}
