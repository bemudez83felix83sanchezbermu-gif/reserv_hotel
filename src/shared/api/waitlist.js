import supabase from '../supabase.js';

const table = () => supabase.schema('hotel').from('waitlist');

const SELECT = `
  id, guest_id, preferred_room_type_id, date_from, date_to, guests_count, status, notified_at, created_at,
  guests:guest_id ( id, first_name, last_name ),
  room_types:preferred_room_type_id ( id, name )
`;

export async function listWaitlist() {
  const { data, error } = await table().select(SELECT).order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(fromRow);
}

export async function createWaitlistEntry(input) {
  const { data, error } = await table()
    .insert({
      guest_id: input.guestId,
      preferred_room_type_id: input.preferredRoomTypeId || null,
      date_from: input.dateFrom,
      date_to: input.dateTo,
      guests_count: input.guestsCount || 1,
    })
    .select(SELECT)
    .single();
  if (error) throw error;
  return fromRow(data);
}

export async function updateWaitlistStatus(id, status) {
  const patch = { status };
  if (status === 'notified') patch.notified_at = new Date().toISOString();
  const { data, error } = await table().update(patch).eq('id', id).select(SELECT).single();
  if (error) throw error;
  return fromRow(data);
}

export async function deleteWaitlistEntry(id) {
  const { error } = await table().delete().eq('id', id);
  if (error) throw error;
}

export async function searchGuests(query) {
  let q = supabase.schema('hotel').from('guests').select('id, first_name, last_name').order('first_name').limit(20);
  if (query) q = q.or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []).map((g) => ({ id: g.id, name: [g.first_name, g.last_name].filter(Boolean).join(' ') }));
}

function fromRow(row) {
  return {
    id: row.id,
    guestId: row.guest_id,
    guestName: row.guests ? [row.guests.first_name, row.guests.last_name].filter(Boolean).join(' ') : '',
    preferredRoomTypeId: row.preferred_room_type_id,
    preferredRoomTypeName: row.room_types?.name || '',
    dateFrom: row.date_from,
    dateTo: row.date_to,
    guestsCount: row.guests_count,
    status: row.status,
    notifiedAt: row.notified_at,
    createdAt: row.created_at,
  };
}
