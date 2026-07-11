import { useCallback } from 'react';
import { useQuery, useMutation } from './useQuery.jsx';
import { listRoles, createRole, updateRole, deleteRole } from '../api/roles.js';

const KEY = 'public.roles';

export function useRoles() {
  const q = useQuery(KEY, listRoles);
  const create = useMutation(createRole, { invalidate: [KEY] });
  const update = useMutation(({ id, patch }) => updateRole(id, patch), { invalidate: [KEY] });
  const remove = useMutation(deleteRole, { invalidate: [KEY] });

  const patchRole = useCallback((id, patch) => update.mutate({ id, patch }), [update]);

  return {
    roles: q.data || [],
    loading: q.loading,
    error: q.error,
    refresh: q.refresh,
    createRole: create.mutate,
    updateRole: patchRole,
    deleteRole: remove.mutate,
    saving: create.loading || update.loading || remove.loading,
  };
}
