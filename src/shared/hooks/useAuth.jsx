import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import supabase from '../supabase.js';

const AuthContext = createContext(null);

async function loadStaff(userId) {
  const { data, error } = await supabase
    .from('staff')
    .select('id, full_name, phone, active, role_id, roles(id, name, permissions, hotel_access, restaurant_access)')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const hydrateStaff = useCallback(async (userId) => {
    if (!userId) { setStaff(null); return; }
    try {
      const row = await loadStaff(userId);
      setStaff(row);
      if (!row) setError('Tu usuario existe en Auth pero no tiene fila en public.staff. Contacta al administrador.');
    } catch (e) {
      setError(e.message || String(e));
      setStaff(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      await hydrateStaff(data.session?.user?.id);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange(async (_evt, next) => {
      if (!mounted) return;
      setSession(next ?? null);
      await hydrateStaff(next?.user?.id);
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, [hydrateStaff]);

  const signIn = useCallback(async (email, password) => {
    setError(null);
    const { error: e } = await supabase.auth.signInWithPassword({ email, password });
    if (e) { setError(e.message); throw e; }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setStaff(null);
  }, []);

  const value = {
    session,
    user: session?.user ?? null,
    staff,
    role: staff?.roles ?? null,
    loading,
    error,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
