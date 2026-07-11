import supabase from '../supabase.js';

const table = () => supabase.schema('hotel').from('key_cards');

export async function listKeyCardsForReservation(reservationId) {
  const { data, error } = await table()
    .select('id, reservation_id, room_id, card_uid, status, activated_at, deactivated_at, activated_by, notes')
    .eq('reservation_id', reservationId)
    .order('activated_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function activateKeyCard({ reservationId, roomId, activatedBy, cardUid }) {
  const { data, error } = await table()
    .insert({
      reservation_id: reservationId,
      room_id: roomId,
      activated_by: activatedBy,
      card_uid: cardUid || null,
      status: 'active',
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deactivateKeyCard(id) {
  const { data, error } = await table()
    .update({ status: 'deactivated', deactivated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function markKeyCardReplaced(id) {
  const { data, error } = await table()
    .update({ status: 'replaced', deactivated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
