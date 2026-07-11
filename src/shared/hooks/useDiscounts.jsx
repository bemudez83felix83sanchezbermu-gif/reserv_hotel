import { useCallback } from 'react';
import { useQuery, useMutation } from './useQuery.jsx';
import { listDiscounts, listActiveDiscounts, createDiscount, updateDiscount, deleteDiscount } from '../api/discounts.js';

const KEY = 'hotel.discount_catalog';
const KEY_ACTIVE = 'hotel.discount_catalog.active';

export function useDiscounts() {
  const q = useQuery(KEY, listDiscounts);
  const create = useMutation(createDiscount, { invalidate: [KEY, KEY_ACTIVE] });
  const update = useMutation(({ id, patch }) => updateDiscount(id, patch), { invalidate: [KEY, KEY_ACTIVE] });
  const remove = useMutation(deleteDiscount, { invalidate: [KEY, KEY_ACTIVE] });

  const patchDiscount = useCallback((id, patch) => update.mutate({ id, patch }), [update]);

  return {
    discounts: q.data || [],
    loading: q.loading,
    error: q.error,
    refresh: q.refresh,
    createDiscount: create.mutate,
    updateDiscount: patchDiscount,
    deleteDiscount: remove.mutate,
    saving: create.loading || update.loading || remove.loading,
  };
}

// Para el selector de descuentos al crear una reserva.
export function useActiveDiscounts() {
  const q = useQuery(KEY_ACTIVE, listActiveDiscounts);
  return { discounts: q.data || [], loading: q.loading, error: q.error, refresh: q.refresh };
}
