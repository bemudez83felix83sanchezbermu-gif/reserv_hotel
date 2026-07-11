import { useCallback } from 'react';
import { useQuery, useMutation } from './useQuery.jsx';
import { listBuildings, createBuilding, updateBuilding, deleteBuilding } from '../api/buildings.js';

const KEY = 'hotel.buildings';

export function useBuildings() {
  const q = useQuery(KEY, listBuildings);
  const create = useMutation(createBuilding, { invalidate: [KEY] });
  const update = useMutation(({ id, patch }) => updateBuilding(id, patch), { invalidate: [KEY] });
  const remove = useMutation(deleteBuilding, { invalidate: [KEY] });

  const patchBuilding = useCallback((id, patch) => update.mutate({ id, patch }), [update]);

  return {
    buildings: q.data || [],
    loading: q.loading,
    error: q.error,
    refresh: q.refresh,
    createBuilding: create.mutate,
    updateBuilding: patchBuilding,
    deleteBuilding: remove.mutate,
    saving: create.loading || update.loading || remove.loading,
  };
}
