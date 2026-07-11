import supabase from '../supabase.js';

const templates = () => supabase.schema('hotel').from('message_templates');
const log = () => supabase.schema('hotel').from('messages_log');

export async function listMessageTemplates() {
  const { data, error } = await templates().select('*').order('channel').order('trigger');
  if (error) throw error;
  return (data || []).map(fromTemplateRow);
}

export async function createMessageTemplate(input) {
  const { data, error } = await templates()
    .insert({
      channel: input.channel, trigger: input.trigger, subject: input.subject || null,
      body: input.body || '', variables: input.variables || {}, active: input.active ?? true,
    })
    .select().single();
  if (error) throw error;
  return fromTemplateRow(data);
}

export async function updateMessageTemplate(id, patch) {
  const row = {};
  if (patch.trigger !== undefined) row.trigger = patch.trigger;
  if (patch.subject !== undefined) row.subject = patch.subject || null;
  if (patch.body !== undefined) row.body = patch.body;
  if (patch.active !== undefined) row.active = patch.active;
  const { data, error } = await templates().update(row).eq('id', id).select().single();
  if (error) throw error;
  return fromTemplateRow(data);
}

export async function deleteMessageTemplate(id) {
  const { error } = await templates().delete().eq('id', id);
  if (error) throw error;
}

const LOG_SELECT = `
  id, reservation_id, guest_id, template_id, channel, to_address, subject, body, status,
  sent_at, delivered_at, opened_at, error, created_at,
  message_templates:template_id ( id, trigger )
`;

export async function listMessagesLog() {
  const { data, error } = await log().select(LOG_SELECT).order('created_at', { ascending: false }).limit(200);
  if (error) throw error;
  return (data || []).map(fromLogRow);
}

// No hay proveedor de email/SMS conectado todavía — "enviar de prueba" registra el intento
// en messages_log como enviado, para poder auditar la plantilla y el flujo sin fabricar un envío real.
export async function sendTestMessage(template, toAddress) {
  const { data, error } = await log()
    .insert({
      template_id: template.id,
      channel: template.channel,
      to_address: toAddress,
      subject: template.subject,
      body: template.body,
      status: 'sent',
      sent_at: new Date().toISOString(),
    })
    .select(LOG_SELECT)
    .single();
  if (error) throw error;
  return fromLogRow(data);
}

function fromTemplateRow(row) {
  return {
    id: row.id,
    channel: row.channel,
    trigger: row.trigger,
    subject: row.subject || '',
    body: row.body,
    variables: row.variables || {},
    active: row.active !== false,
    createdAt: row.created_at,
  };
}

function fromLogRow(row) {
  return {
    id: row.id,
    reservationId: row.reservation_id,
    guestId: row.guest_id,
    templateId: row.template_id,
    templateTrigger: row.message_templates?.trigger || '',
    channel: row.channel,
    toAddress: row.to_address,
    subject: row.subject || '',
    status: row.status,
    sentAt: row.sent_at,
    deliveredAt: row.delivered_at,
    openedAt: row.opened_at,
    error: row.error,
    createdAt: row.created_at,
  };
}
