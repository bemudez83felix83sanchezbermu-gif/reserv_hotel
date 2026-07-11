import { useCallback } from 'react';
import { useQuery, useMutation } from './useQuery.jsx';
import { listSalesChannels, createSalesChannel, updateSalesChannel, deleteSalesChannel } from '../api/salesChannels.js';

const KEY = 'hotel.sales_channels.crud';

export function useSalesChannels() {
  const q = useQuery(KEY, listSalesChannels);
  const create = useMutation(createSalesChannel, { invalidate: [KEY, 'hotel.sales_channels'] });
  const update = useMutation(({ id, patch }) => updateSalesChannel(id, patch), { invalidate: [KEY, 'hotel.sales_channels'] });
  const remove = useMutation(deleteSalesChannel, { invalidate: [KEY, 'hotel.sales_channels'] });

  const patchChannel = useCallback((id, patch) => update.mutate({ id, patch }), [update]);

  return {
    channels: q.data || [],
    loading: q.loading,
    error: q.error,
    refresh: q.refresh,
    createChannel: create.mutate,
    updateChannel: patchChannel,
    deleteChannel: remove.mutate,
    saving: create.loading || update.loading || remove.loading,
  };
}
