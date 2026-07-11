import { useAuth } from '../shared/hooks/useAuth.jsx';
import LoginView from './LoginView.jsx';

const SHELL = {
  minHeight: '100vh',
  background: '#F3EDE0',
  color: '#2E2418',
  fontFamily: 'Karla, system-ui, sans-serif',
  display: 'grid',
  placeItems: 'center',
  padding: 24,
};

const CARD = {
  width: 'min(440px, 100%)',
  background: '#FFFDF7',
  border: '1px solid #EDE3CF',
  borderRadius: 18,
  padding: 28,
  textAlign: 'center',
};

function Loading() {
  return <div style={SHELL}><div style={{ ...CARD, opacity: 0.75 }}>Cargando…</div></div>;
}

function StaffMissing({ email, onSignOut }) {
  return (
    <div style={SHELL}>
      <div style={CARD}>
        <div style={{ fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase', opacity: 0.65 }}>Cuenta sin perfil</div>
        <h1 style={{ margin: '6px 0 12px', fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 24, fontWeight: 600 }}>
          Falta tu ficha de staff
        </h1>
        <p style={{ opacity: 0.75, fontSize: 14, lineHeight: 1.5 }}>
          El correo <strong>{email}</strong> existe en Auth pero no tiene fila en <code>public.staff</code>.
          Pide al administrador que corra el insert de staff con tu <code>auth.uid()</code>.
        </p>
        <button
          onClick={onSignOut}
          style={{ marginTop: 16, padding: '10px 16px', background: 'transparent', color: '#2E2418',
            border: '1px solid #EDE3CF', borderRadius: 10, cursor: 'pointer', font: 'inherit' }}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

export default function AuthGuard({ children }) {
  const { loading, session, staff, signOut } = useAuth();

  if (loading) return <Loading />;
  if (!session) return <LoginView />;
  if (!staff) return <StaffMissing email={session.user.email} onSignOut={signOut} />;
  return children;
}
