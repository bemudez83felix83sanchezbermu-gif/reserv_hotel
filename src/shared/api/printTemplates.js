import supabase from '../supabase.js';

const table = () => supabase.schema('hotel').from('print_templates');

export async function listPrintTemplates() {
  const { data, error } = await table().select('*').order('kind').order('name');
  if (error) throw error;
  return (data || []).map(fromRow);
}

export async function createPrintTemplate(input) {
  const { data, error } = await table()
    .insert({ kind: input.kind, name: input.name, html_body: input.htmlBody || '', variables: input.variables || {}, active: input.active ?? true })
    .select().single();
  if (error) throw error;
  return fromRow(data);
}

export async function updatePrintTemplate(id, patch) {
  const row = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.htmlBody !== undefined) row.html_body = patch.htmlBody;
  if (patch.active !== undefined) row.active = patch.active;
  const { data, error } = await table().update(row).eq('id', id).select().single();
  if (error) throw error;
  return fromRow(data);
}

export async function deletePrintTemplate(id) {
  const { error } = await table().delete().eq('id', id);
  if (error) throw error;
}

export async function getActivePrintTemplate(kind) {
  const { data, error } = await table().select('*').eq('kind', kind).eq('active', true).limit(1).maybeSingle();
  if (error) throw error;
  return data ? fromRow(data) : null;
}

// Sustituye {{variable}} en el HTML de la plantilla y abre una ventana lista para imprimir.
export function printWithTemplate(template, variables = {}) {
  if (!template) return false;
  const html = template.htmlBody.replace(/{{\s*(\w+)\s*}}/g, (_, key) => (variables[key] ?? ''));
  const win = window.open('', '_blank', 'width=720,height=900');
  if (!win) return false;
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
  return true;
}

function fromRow(row) {
  return {
    id: row.id,
    kind: row.kind,
    name: row.name,
    htmlBody: row.html_body,
    variables: row.variables || {},
    active: row.active !== false,
    createdAt: row.created_at,
  };
}
