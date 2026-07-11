import supabase from '../supabase.js';

const table = () => supabase.schema('hotel').from('guests');
const SELECT = `
  id, first_name, last_name, email, phone, birthday,
  identification_type_id, identification_number, notes, created_at,
  identification_types:identification_type_id ( id, name ),
  guest_tag_assignments ( tag_id, guest_tags ( id, name, color, icon ) )
`;

export async function listGuests() {
  const { data, error } = await table().select(SELECT).order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(fromRow);
}

export async function createGuest(input) {
  const { data, error } = await table().insert(toRow(input)).select(SELECT).single();
  if (error) throw error;
  return fromRow(data);
}

export async function updateGuest(id, patch) {
  const { data, error } = await table().update(toRow(patch, true)).eq('id', id).select(SELECT).single();
  if (error) throw error;
  return fromRow(data);
}

export async function deleteGuest(id) {
  const { error } = await table().delete().eq('id', id);
  if (error) throw error;
}

export async function assignGuestTag(guestId, tagId) {
  const { error } = await supabase.schema('hotel').from('guest_tag_assignments').insert({ guest_id: guestId, tag_id: tagId });
  if (error) throw error;
}

export async function unassignGuestTag(guestId, tagId) {
  const { error } = await supabase.schema('hotel').from('guest_tag_assignments')
    .delete().eq('guest_id', guestId).eq('tag_id', tagId);
  if (error) throw error;
}

function toRow(input, partial = false) {
  const row = {};
  if (input.firstName !== undefined) row.first_name = input.firstName;
  if (input.lastName !== undefined) row.last_name = input.lastName;
  if (input.email !== undefined) row.email = input.email || null;
  if (input.phone !== undefined) row.phone = input.phone || null;
  if (input.birthday !== undefined) row.birthday = input.birthday || null;
  if (input.identificationTypeId !== undefined) row.identification_type_id = input.identificationTypeId || null;
  if (input.identificationNumber !== undefined) row.identification_number = input.identificationNumber || null;
  if (input.notes !== undefined) row.notes = input.notes || null;
  if (partial && Object.keys(row).length === 0) return {};
  return row;
}

function fromRow(row) {
  const tags = (row.guest_tag_assignments || []).map((a) => a.guest_tags).filter(Boolean);
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    fullName: [row.first_name, row.last_name].filter(Boolean).join(' '),
    email: row.email || '',
    phone: row.phone || '',
    birthday: row.birthday,
    identificationTypeId: row.identification_type_id,
    identificationTypeName: row.identification_types?.name || '',
    identificationNumber: row.identification_number || '',
    notes: row.notes || '',
    tags,
    createdAt: row.created_at,
  };
}
