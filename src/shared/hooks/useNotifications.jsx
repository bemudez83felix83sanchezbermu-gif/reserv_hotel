import { useMemo } from 'react';
import { useQuery, useMutation } from './useQuery.jsx';
import { useAuth } from './useAuth.jsx';
import { listNotifications, markNotificationRead, markAllNotificationsRead } from '../api/notifications.js';

export function useNotifications() {
  const { staff } = useAuth();
  const recipientId = staff?.id || null;
  const key = recipientId ? `public.notifications.recipient:${recipientId}` : null;
  const fetcher = useMemo(() => () => listNotifications(recipientId), [recipientId]);
  const q = useQuery(key, fetcher, { enabled: !!key });
  const markRead = useMutation(markNotificationRead, { invalidate: key ? [key] : [] });
  const markAllRead = useMutation(() => markAllNotificationsRead(recipientId), { invalidate: key ? [key] : [] });

  const notifications = q.data || [];
  return {
    notifications,
    unreadCount: notifications.filter((n) => !n.readAt).length,
    loading: q.loading,
    error: q.error,
    refresh: q.refresh,
    markRead: markRead.mutate,
    markAllRead: markAllRead.mutate,
    saving: markRead.loading || markAllRead.loading,
  };
}
