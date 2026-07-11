import { useCallback } from 'react';
import { useQuery, useMutation } from './useQuery.jsx';
import {
  listBedTypes, createBedType, updateBedType, deleteBedType,
  listRoomTypes, createRoomType, updateRoomType, deleteRoomType,
  listAmenitiesAdmin, createAmenity, updateAmenity, deleteAmenity,
  listIdentificationTypesAdmin, createIdentificationType, updateIdentificationType, deleteIdentificationType,
} from '../api/catalogs.js';
import { CATALOG_KEYS } from './useCatalog.jsx';

function useCrudCatalog(key, list, create, update, remove, extraInvalidate = []) {
  const q = useQuery(key, list);
  const invalidate = [key, ...extraInvalidate];
  const createM = useMutation(create, { invalidate });
  const updateM = useMutation(({ id, patch }) => update(id, patch), { invalidate });
  const removeM = useMutation(remove, { invalidate });
  const patch = useCallback((id, p) => updateM.mutate({ id, patch: p }), [updateM]);

  return {
    items: q.data || [],
    loading: q.loading,
    error: q.error,
    refresh: q.refresh,
    create: createM.mutate,
    update: patch,
    remove: removeM.mutate,
    saving: createM.loading || updateM.loading || removeM.loading,
  };
}

export function useBedTypesAdmin() {
  return useCrudCatalog(CATALOG_KEYS.bedTypes, listBedTypes, createBedType, updateBedType, deleteBedType);
}

export function useRoomTypesAdmin() {
  return useCrudCatalog(CATALOG_KEYS.roomTypes, listRoomTypes, createRoomType, updateRoomType, deleteRoomType);
}

export function useAmenitiesAdmin() {
  return useCrudCatalog('hotel.amenities_catalog.admin', listAmenitiesAdmin, createAmenity, updateAmenity, deleteAmenity, [CATALOG_KEYS.amenities]);
}

export function useIdentificationTypesAdmin() {
  return useCrudCatalog('hotel.identification_types.admin', listIdentificationTypesAdmin, createIdentificationType, updateIdentificationType, deleteIdentificationType, [CATALOG_KEYS.identificationTypes]);
}
