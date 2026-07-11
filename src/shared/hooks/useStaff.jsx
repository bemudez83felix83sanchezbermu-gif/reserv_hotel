import { useCallback } from 'react';
import { useQuery, useMutation } from './useQuery.jsx';
import { listStaff, createStaffMirror, updateStaff, deleteStaff } from '../api/staff.js';

const KEY = 'public.staff.all';

export function useStaff() {
  const q = useQuery(KEY, listStaff);
  const create = useMutation(createStaffMirror, { invalidate: [KEY] });
  const update = useMutation(({ id, patch }) => updateStaff(id, patch), { invalidate: [KEY] });
  const remove = useMutation(deleteStaff, { invalidate: [KEY] });

  const patchStaff = useCallback((id, patch) => update.mutate({ id, patch }), [update]);

  return {
    staff: q.data || [],
    loading: q.loading,
    error: q.error,
    refresh: q.refresh,
    createStaffMirror: create.mutate,
    updateStaff: patchStaff,
    deleteStaff: remove.mutate,
    saving: create.loading || update.loading || remove.loading,
  };
}
