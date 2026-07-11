import { useCallback } from 'react';
import { useQuery, useMutation } from './useQuery.jsx';
import {
  listAmenityProducts,
  createAmenityProduct,
  updateAmenityProduct,
  deleteAmenityProduct,
  listAmenityMovements,
  createAmenityMovement,
} from '../api/amenities.js';

const PRODUCTS_KEY = 'hotel.amenity_products';
const MOVEMENTS_KEY = 'hotel.amenity_movements';

export function useAmenityProducts() {
  const q = useQuery(PRODUCTS_KEY, listAmenityProducts);
  const create = useMutation(createAmenityProduct, { invalidate: [PRODUCTS_KEY] });
  const update = useMutation(({ id, patch }) => updateAmenityProduct(id, patch), { invalidate: [PRODUCTS_KEY] });
  const remove = useMutation(deleteAmenityProduct, { invalidate: [PRODUCTS_KEY] });

  const saveProduct = useCallback(async (draft) => {
    if (draft.id && (q.data || []).some((p) => p.id === draft.id)) {
      return update.mutate({ id: draft.id, patch: draft });
    }
    const { id: _drop, ...payload } = draft;
    return create.mutate(payload);
  }, [q.data, create, update]);

  return {
    products: q.data || [],
    loading: q.loading,
    error: q.error,
    refresh: q.refresh,
    saveProduct,
    updateProduct: (id, patch) => update.mutate({ id, patch }),
    deleteProduct: remove.mutate,
    saving: create.loading || update.loading || remove.loading,
  };
}

export function useAmenityMovements() {
  const q = useQuery(MOVEMENTS_KEY, () => listAmenityMovements());
  const create = useMutation(createAmenityMovement, { invalidate: [MOVEMENTS_KEY, PRODUCTS_KEY] });

  return {
    movements: q.data || [],
    loading: q.loading,
    error: q.error,
    refresh: q.refresh,
    createMovement: create.mutate,
    saving: create.loading,
  };
}
