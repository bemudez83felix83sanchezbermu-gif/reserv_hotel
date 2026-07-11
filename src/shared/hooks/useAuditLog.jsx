import { useMemo } from 'react';
import { useQuery } from './useQuery.jsx';
import { listAuditLog } from '../api/auditLog.js';

export function useAuditLog(filters) {
  const key = 'public.audit_log.filter:' + JSON.stringify(filters || {});
  const fetcher = useMemo(() => () => listAuditLog(filters), [JSON.stringify(filters)]);
  const q = useQuery(key, fetcher);
  return { entries: q.data || [], loading: q.loading, error: q.error, refresh: q.refresh };
}
