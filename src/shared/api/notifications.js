import supabase from '../supabase.js';

const table = () => supabase.from('notifications');

export async function listNotifications(recipientId) {
  const { data, error } = await table()
    .select('*')
    .eq('recipient_id', recipientId)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data || []).map(fromRow);
}

export async function markNotificationRead(id) {
  const { data, error } = await table().update({ read_at: new Date().toISOString() }).eq('id', id).select().single();
  if (error) throw error;
  return fromRow(data);
}

export async function markAllNotificationsRead(recipientId) {
  const { error } = await table().update({ read_at: new Date().toISOString() }).eq('recipient_id', recipientId).is('read_at', null);
  if (error) throw error;
}

function fromRow(row) {
  return {
    id: row.id,
    recipientId: row.recipient_id,
    type: row.type,
    title: row.title,
    body: row.body || '',
    link: row.link || '',
    readAt: row.read_at,
    createdAt: row.created_at,
  };
}
