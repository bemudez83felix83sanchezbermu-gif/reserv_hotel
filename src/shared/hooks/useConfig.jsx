import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import supabase from '../supabase.js';
import { useAuth } from './useAuth.jsx';

const ConfigContext = createContext(null);

async function fetchConfig() {
  const { data, error } = await supabase
    .schema('hotel')
    .from('config')
    .select('*')
    .eq('id', 1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export function ConfigProvider({ children }) {
  const { session, staff } = useAuth();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const row = await fetchConfig();
      setConfig(row);
      setError(null);
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const updateConfig = useCallback(async (patch) => {
    const { data, error: e } = await supabase
      .schema('hotel')
      .from('config')
      .update(patch)
      .eq('id', 1)
      .select()
      .single();
    if (e) throw e;
    setConfig(data);
    return data;
  }, []);

  useEffect(() => {
    if (!session || !staff) { setConfig(null); setLoading(false); return; }
    refresh();
  }, [session, staff, refresh]);

  useEffect(() => {
    if (config?.accent) {
      document.documentElement.style.setProperty('--ac', config.accent);
    }
  }, [config?.accent]);

  return (
    <ConfigContext.Provider value={{ config, loading, error, refresh, updateConfig }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error('useConfig debe usarse dentro de <ConfigProvider>');
  return ctx;
}
