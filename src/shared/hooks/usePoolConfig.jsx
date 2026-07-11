import { useQuery, useMutation } from './useQuery.jsx';
import { getPoolConfig, updatePoolConfig } from '../api/poolConfig.js';

const KEY = 'hotel.pool_config';

export function usePoolConfig() {
  const q = useQuery(KEY, getPoolConfig);
  const update = useMutation(updatePoolConfig, { invalidate: [KEY] });

  return {
    config: q.data,
    loading: q.loading,
    error: q.error,
    refresh: q.refresh,
    updateConfig: update.mutate,
    saving: update.loading,
  };
}
