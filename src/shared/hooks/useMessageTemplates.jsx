import { useCallback } from 'react';
import { useQuery, useMutation } from './useQuery.jsx';
import {
  listMessageTemplates,
  createMessageTemplate,
  updateMessageTemplate,
  deleteMessageTemplate,
  listMessagesLog,
  sendTestMessage,
} from '../api/messageTemplates.js';

const KEY = 'hotel.message_templates';
const LOG_KEY = 'hotel.messages_log';

export function useMessageTemplates() {
  const q = useQuery(KEY, listMessageTemplates);
  const create = useMutation(createMessageTemplate, { invalidate: [KEY] });
  const update = useMutation(({ id, patch }) => updateMessageTemplate(id, patch), { invalidate: [KEY] });
  const remove = useMutation(deleteMessageTemplate, { invalidate: [KEY] });
  const send = useMutation(({ template, toAddress }) => sendTestMessage(template, toAddress), { invalidate: [LOG_KEY] });

  const patchTemplate = useCallback((id, patch) => update.mutate({ id, patch }), [update]);
  const sendTest = useCallback((template, toAddress) => send.mutate({ template, toAddress }), [send]);

  return {
    templates: q.data || [],
    loading: q.loading,
    error: q.error,
    refresh: q.refresh,
    createTemplate: create.mutate,
    updateTemplate: patchTemplate,
    deleteTemplate: remove.mutate,
    sendTest,
    saving: create.loading || update.loading || remove.loading || send.loading,
  };
}

export function useMessagesLog() {
  const q = useQuery(LOG_KEY, listMessagesLog);
  return { log: q.data || [], loading: q.loading, error: q.error, refresh: q.refresh };
}
