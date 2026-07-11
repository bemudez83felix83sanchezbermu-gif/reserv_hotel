import { useState } from 'react';
import { useAuth } from '../shared/hooks/useAuth.jsx';

const SHELL = {
  minHeight: '100vh',
  background: '#F3EDE0',
  color: '#2E2418',
  fontFamily: 'Karla, system-ui, sans-serif',
  WebkitFontSmoothing: 'antialiased',
  display: 'grid',
  placeItems: 'center',
  padding: 24,
};

const CARD = {
  width: 'min(420px, 100%)',
  background: '#FFFDF7',
  border: '1px solid #EDE3CF',
  borderRadius: 18,
  padding: 32,
  boxShadow: '0 20px 60px rgba(46,36,24,0.08)',
};

const LABEL = { display: 'block', fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase', opacity: 0.7, marginBottom: 6 };
const INPUT = {
  width: '100%', boxSizing: 'border-box', padding: '11px 13px',
  background: '#F8F1E1', border: '1px solid #EDE3CF', borderRadius: 12,
  font: 'inherit', color: 'inherit', outline: 'none',
};
const BTN = {
  width: '100%', padding: '12px 16px', marginTop: 6,
  background: 'var(--ac, #B8552F)', color: '#FFFDF7',
  border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer',
};

export default function LoginView() {
  const { signIn, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [localErr, setLocalErr] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setLocalErr(null);
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setLocalErr(err?.message || 'No se pudo iniciar sesión');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={SHELL}>
      <form style={CARD} onSubmit={submit}>
        <div style={{ fontSize: 12, letterSpacing: 1.4, textTransform: 'uppercase', opacity: 0.7 }}>Estancia · PMS</div>
        <h1 style={{ margin: '6px 0 24px', fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 30, fontWeight: 600 }}>
          Iniciar sesión
        </h1>

        <div style={{ marginBottom: 14 }}>
          <label style={LABEL} htmlFor="email">Correo</label>
          <input
            id="email" type="email" required autoComplete="username"
            value={email} onChange={(e) => setEmail(e.target.value)}
            style={INPUT} placeholder="tu@correo.com"
          />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={LABEL} htmlFor="password">Contraseña</label>
          <input
            id="password" type="password" required autoComplete="current-password"
            value={password} onChange={(e) => setPassword(e.target.value)}
            style={INPUT} placeholder="••••••••"
          />
        </div>

        {(localErr || error) && (
          <div style={{ background: '#F5E0DA', color: '#7A3B2A', padding: '10px 12px', borderRadius: 10, marginBottom: 12, fontSize: 14 }}>
            {localErr || error}
          </div>
        )}

        <button type="submit" disabled={busy || !email || !password} style={{ ...BTN, opacity: busy ? 0.7 : 1 }}>
          {busy ? 'Entrando…' : 'Entrar'}
        </button>

        <div style={{ marginTop: 18, fontSize: 12, opacity: 0.65, lineHeight: 1.5 }}>
          Acceso solo para personal del hotel. Contacta a administración si necesitas una cuenta.
        </div>
      </form>
    </div>
  );
}
