import { useQuery } from './useQuery.jsx';
import {
  listRoomTypes,
  listBedTypes,
  listAmenities,
  listBuildingsFlat,
  listSalesChannels,
  listIdentificationTypes,
} from '../api/catalogs.js';

export const CATALOG_KEYS = {
  roomTypes: 'hotel.room_types',
  bedTypes: 'hotel.bed_types',
  amenities: 'hotel.amenities_catalog',
  buildings: 'hotel.buildings.flat',
  salesChannels: 'hotel.sales_channels',
  identificationTypes: 'hotel.identification_types',
};

export function useRoomTypes() {
  return useQuery(CATALOG_KEYS.roomTypes, listRoomTypes);
}
export function useBedTypes() {
  return useQuery(CATALOG_KEYS.bedTypes, listBedTypes);
}
export function useAmenitiesCatalog() {
  return useQuery(CATALOG_KEYS.amenities, listAmenities);
}
export function useBuildingsFlat() {
  return useQuery(CATALOG_KEYS.buildings, listBuildingsFlat);
}
export function useSalesChannelsActive() {
  return useQuery(CATALOG_KEYS.salesChannels, listSalesChannels);
}
export function useIdentificationTypes() {
  return useQuery(CATALOG_KEYS.identificationTypes, listIdentificationTypes);
}
