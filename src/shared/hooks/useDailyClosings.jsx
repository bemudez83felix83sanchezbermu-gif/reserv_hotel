import { useCallback, useMemo, useState } from 'react';
import { useQuery, useMutation } from './useQuery.jsx';
import { listDailyClosings, getDailyClosing, computeDailyPreview, closeDay } from '../api/dailyClosings.js';

const KEY = 'hotel.daily_closings';

export function useDailyClosings() {
  const q = useQuery(KEY, listDailyClosings);
  return { closings: q.data || [], loading: q.loading, error: q.error, refresh: q.refresh };
}

export function useDailyClosing(date) {
  const key = date ? `hotel.daily_closings.date:${date}` : null;
  const fetcher = useMemo(() => () => getDailyClosing(date), [date]);
  const q = useQuery(key, fetcher, { enabled: !!key });
  return { closing: q.data, loading: q.loading, error: q.error, refresh: q.refresh };
}

export function useDailyPreview(date, taxRate) {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!date) return;
    setLoading(true);
    try {
      const p = await computeDailyPreview(date, taxRate);
      setPreview(p);
      setError(null);
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }, [date, taxRate]);

  const close = useMutation(closeDay, { invalidate: [KEY, date ? `hotel.daily_closings.date:${date}` : null].filter(Boolean) });

  return { preview, loading, error, load, closeDay: close.mutate, closing: close.loading };
}
