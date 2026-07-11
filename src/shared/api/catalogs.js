import supabase from '../supabase.js';

export async function listRoomTypes() {
  const { data, error } = await supabase
    .schema('hotel')
    .from('room_types')
    .select('id, name, description, base_capacity, bed_type_id, active')
    .order('name');
  if (error) throw error;
  return data || [];
}

export async function listBedTypes() {
  const { data, error } = await supabase
    .schema('hotel')
    .from('bed_types')
    .select('id, name, capacity_suggested, active')
    .order('name');
  if (error) throw error;
  return data || [];
}

export async function listAmenities() {
  const { data, error } = await supabase
    .schema('hotel')
    .from('amenities_catalog')
    .select('id, name, icon, category, active')
    .eq('active', true)
    .order('name');
  if (error) throw error;
  return data || [];
}

export async function listBuildingsFlat() {
  const { data, error } = await supabase
    .schema('hotel')
    .from('buildings')
    .select('id, name, num_from, num_to')
    .order('position');
  if (error) throw error;
  return data || [];
}

export async function listSalesChannels() {
  const { data, error } = await supabase
    .schema('hotel')
    .from('sales_channels')
    .select('id, name, slug, commission_percent, active')
    .eq('active', true)
    .order('name');
  if (error) throw error;
  return data || [];
}

export async function listIdentificationTypes() {
  const { data, error } = await supabase
    .schema('hotel')
    .from('identification_types')
    .select('id, name, requires_number, requires_file, active')
    .eq('active', true)
    .order('name');
  if (error) throw error;
  return data || [];
}

// ============================================================================
// Variantes "admin" (todas las filas, activas e inactivas) + CRUD — usadas por
// la vista de Catálogos. Los pickers de arriba se quedan filtrando solo activos.
// ============================================================================

export async function listAmenitiesAdmin() {
  const { data, error } = await supabase
    .schema('hotel').from('amenities_catalog')
    .select('id, name, icon, category, active').order('name');
  if (error) throw error;
  return data || [];
}

export async function listIdentificationTypesAdmin() {
  const { data, error } = await supabase
    .schema('hotel').from('identification_types')
    .select('id, name, requires_number, requires_file, active').order('name');
  if (error) throw error;
  return data || [];
}

function crudFor(tableName, columns) {
  const table = () => supabase.schema('hotel').from(tableName);
  return {
    create: async (input) => {
      const { data, error } = await table().insert(input).select(columns).single();
      if (error) throw error;
      return data;
    },
    update: async (id, patch) => {
      const { data, error } = await table().update(patch).eq('id', id).select(columns).single();
      if (error) throw error;
      return data;
    },
    remove: async (id) => {
      const { error } = await table().delete().eq('id', id);
      if (error) throw error;
    },
  };
}

const bedTypesCrud = crudFor('bed_types', 'id, name, capacity_suggested, active');
export const createBedType = bedTypesCrud.create;
export const updateBedType = bedTypesCrud.update;
export const deleteBedType = bedTypesCrud.remove;

const roomTypesCrud = crudFor('room_types', 'id, name, description, base_capacity, bed_type_id, active');
export const createRoomType = roomTypesCrud.create;
export const updateRoomType = roomTypesCrud.update;
export const deleteRoomType = roomTypesCrud.remove;

const amenitiesCrud = crudFor('amenities_catalog', 'id, name, icon, category, active');
export const createAmenity = amenitiesCrud.create;
export const updateAmenity = amenitiesCrud.update;
export const deleteAmenity = amenitiesCrud.remove;

const idTypesCrud = crudFor('identification_types', 'id, name, requires_number, requires_file, active');
export const createIdentificationType = idTypesCrud.create;
export const updateIdentificationType = idTypesCrud.update;
export const deleteIdentificationType = idTypesCrud.remove;
