import supabase from '../supabase.js';

const table = () => supabase.schema('hotel').from('rooms');

const SELECT = `
  id, num, name, cap, m2, price, description, active, housekeeping_status,
  amenities, photos, room_type_id, bed_type_id, building_id,
  room_types(id, name), bed_types(id, name), buildings(id, name)
`;

export async function listRooms() {
  const { data, error } = await table()
    .select(SELECT)
    .order('num');
  if (error) throw error;
  return (data || []).map(fromRow);
}

export async function createRoom(input) {
  const { data, error } = await table().insert(toRow(input)).select(SELECT).single();
  if (error) throw error;
  return fromRow(data);
}

export async function updateRoom(id, patch) {
  const { data, error } = await table().update(toRow(patch, true)).eq('id', id).select(SELECT).single();
  if (error) throw error;
  return fromRow(data);
}

export async function deleteRoom(id) {
  const { error } = await table().delete().eq('id', id);
  if (error) throw error;
}

function toRow(input, partial = false) {
  const row = {};
  if (input.num !== undefined) row.num = String(input.num);
  if (input.name !== undefined) row.name = input.name;
  if (input.cap !== undefined) row.cap = input.cap;
  if (input.m2 !== undefined) row.m2 = input.m2;
  if (input.price !== undefined) row.price = input.price;
  if (input.desc !== undefined) row.description = input.desc;
  if (input.description !== undefined) row.description = input.description;
  if (input.active !== undefined) row.active = input.active;
  if (input.housekeepingStatus !== undefined) row.housekeeping_status = input.housekeepingStatus;
  if (input.amenities !== undefined) row.amenities = input.amenities;
  if (input.photos !== undefined) row.photos = input.photos;
  if (input.room_type_id !== undefined) row.room_type_id = input.room_type_id;
  if (input.bed_type_id !== undefined) row.bed_type_id = input.bed_type_id;
  if (input.building_id !== undefined) row.building_id = input.building_id;
  if (partial && Object.keys(row).length === 0) return {};
  return row;
}

function fromRow(row) {
  return {
    id: row.id,
    num: row.num,
    name: row.name,
    cap: row.cap,
    m2: row.m2,
    price: Number(row.price),
    desc: row.description || '',
    active: row.active !== false,
    housekeepingStatus: row.housekeeping_status,
    amenities: row.amenities || [],
    photos: row.photos || [],
    room_type_id: row.room_type_id,
    bed_type_id: row.bed_type_id,
    building_id: row.building_id,
    type: row.room_types?.name || '',
    bed: row.bed_types?.name || '',
    buildingName: row.buildings?.name || '',
  };
}
