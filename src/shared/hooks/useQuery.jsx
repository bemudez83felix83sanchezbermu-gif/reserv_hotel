import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const QueryContext = createContext(null);

export function QueryProvider({ children }) {
  const cacheRef = useRef(new Map());   // key -> { data, error, updatedAt }
  const subsRef = useRef(new Map());    // key -> Set<setState>

  const getEntry = useCallback((key) => cacheRef.current.get(key) ?? null, []);

  const setEntry = useCallback((key, entry) => {
    cacheRef.current.set(key, entry);
    const subs = subsRef.current.get(key);
    if (subs) subs.forEach((fn) => fn(entry));
  }, []);

  const subscribe = useCallback((key, fn) => {
    if (!subsRef.current.has(key)) subsRef.current.set(key, new Set());
    subsRef.current.get(key).add(fn);
    return () => {
      const set = subsRef.current.get(key);
      if (set) {
        set.delete(fn);
        if (set.size === 0) subsRef.current.delete(key);
      }
    };
  }, []);

  const invalidate = useCallback((keyOrKeys) => {
    const keys = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys];
    keys.forEach((k) => {
      const subs = subsRef.current.get(k);
      if (subs) subs.forEach((fn) => fn({ type: 'invalidate' }));
    });
  }, []);

  return (
    <QueryContext.Provider value={{ getEntry, setEntry, subscribe, invalidate }}>
      {children}
    </QueryContext.Provider>
  );
}

function useQueryCtx() {
  const ctx = useContext(QueryContext);
  if (!ctx) throw new Error('useQuery/useMutation deben usarse dentro de <QueryProvider>');
  return ctx;
}

export function useQuery(key, fetcher, opts = {}) {
  const { enabled = true, revalidateOnFocus = true } = opts;
  const { getEntry, setEntry, subscribe } = useQueryCtx();
  const cached = getEntry(key);
  const [data, setData] = useState(cached?.data ?? null);
  const [error, setError] = useState(cached?.error ?? null);
  const [loading, setLoading] = useState(!cached && enabled);
  const fetcherRef = useRef(fetcher);
  useEffect(() => { fetcherRef.current = fetcher; }, [fetcher]);

  const run = useCallback(async () => {
    if (!enabled || !key) return;
    setLoading(true);
    try {
      const result = await fetcherRef.current();
      const entry = { data: result, error: null, updatedAt: Date.now() };
      setEntry(key, entry);
      setError(null);
      setData(result);
    } catch (e) {
      const msg = e?.message || String(e);
      setEntry(key, { data: null, error: msg, updatedAt: Date.now() });
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [enabled, key, setEntry]);

  useEffect(() => {
    if (!key || !enabled) return undefined;
    const unsubscribe = subscribe(key, (evt) => {
      if (evt?.type === 'invalidate') { run(); return; }
      if (evt?.data !== undefined) setData(evt.data);
      if (evt?.error !== undefined) setError(evt.error);
    });
    if (!getEntry(key)) run();
    return unsubscribe;
  }, [key, enabled, subscribe, getEntry, run]);

  useEffect(() => {
    if (!revalidateOnFocus) return undefined;
    const onFocus = () => run();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [revalidateOnFocus, run]);

  return { data, error, loading, refresh: run };
}

export function useMutation(mutator, opts = {}) {
  const { invalidate } = useQueryCtx();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (input) => {
    setLoading(true);
    setError(null);
    try {
      const data = await mutator(input);
      if (opts.invalidate) invalidate(opts.invalidate);
      if (opts.onSuccess) opts.onSuccess(data, input);
      return data;
    } catch (e) {
      const msg = e?.message || String(e);
      setError(msg);
      if (opts.onError) opts.onError(msg, input);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [mutator, opts, invalidate]);

  return { mutate, loading, error };
}
