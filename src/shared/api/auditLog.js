import supabase from '../supabase.js';

const SELECT = `
  id, actor_id, action, target_schema, target_table, target_id, before, after, at,
  staff:actor_id ( id, full_name )
`;

export async function listAuditLog(filters = {}) {
  let q = supabase.from('audit_log').select(SELECT).order('at', { ascending: false }).limit(200);
  if (filters.actorId) q = q.eq('actor_id', filters.actorId);
  if (filters.targetTable) q = q.eq('target_table', filters.targetTable);
  if (filters.action) q = q.eq('action', filters.action);
  if (filters.dateFrom) q = q.gte('at', `${filters.dateFrom}T00:00:00`);
  if (filters.dateTo) q = q.lte('at', `${filters.dateTo}T23:59:59.999`);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []).map(fromRow);
}

function fromRow(row) {
  return {
    id: row.id,
    actorId: row.actor_id,
    actorName: row.staff?.full_name || '',
    action: row.action,
    targetSchema: row.target_schema,
    targetTable: row.target_table,
    targetId: row.target_id,
    before: row.before,
    after: row.after,
    at: row.at,
  };
}
