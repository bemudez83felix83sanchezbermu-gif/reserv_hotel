import { useCallback } from 'react';
import { useQuery, useMutation } from './useQuery.jsx';
import { listPackages, createPackage, updatePackage, deletePackage } from '../api/packages.js';

const KEY = 'hotel.packages';

export function usePackages() {
  const q = useQuery(KEY, listPackages);
  const create = useMutation(createPackage, { invalidate: [KEY] });
  const update = useMutation(({ id, patch }) => updatePackage(id, patch), { invalidate: [KEY] });
  const remove = useMutation(deletePackage, { invalidate: [KEY] });

  const savePackage = useCallback(async (draft) => {
    if (draft.id && (q.data || []).some((p) => p.id === draft.id)) {
      return update.mutate({ id: draft.id, patch: draft });
    }
    const { id: _drop, ...payload } = draft;
    return create.mutate(payload);
  }, [q.data, create, update]);

  const patchPackage = useCallback((id, patch) => update.mutate({ id, patch }), [update]);

  return {
    packages: q.data || [],
    loading: q.loading,
    error: q.error,
    refresh: q.refresh,
    createPackage: create.mutate,
    updatePackage: patchPackage,
    savePackage,
    deletePackage: remove.mutate,
    saving: create.loading || update.loading || remove.loading,
  };
}
