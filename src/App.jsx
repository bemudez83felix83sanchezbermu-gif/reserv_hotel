import { useEffect, useState } from 'react';
import AdminApp from './admin/AdminApp.jsx';
import GuestApp from './guest/GuestApp.jsx';
import AuthGuard from './auth/AuthGuard.jsx';
import { AuthProvider } from './shared/hooks/useAuth.jsx';
import { ConfigProvider } from './shared/hooks/useConfig.jsx';
import { QueryProvider } from './shared/hooks/useQuery.jsx';

const isGuestHash = () => typeof window !== 'undefined' && window.location.hash === '#huesped';

export default function App() {
  const [route, setRoute] = useState(isGuestHash() ? 'guest' : 'admin');

  useEffect(() => {
    const onHash = () => setRoute(isGuestHash() ? 'guest' : 'admin');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const goGuest = () => { window.location.hash = 'huesped'; };
  const goAdmin = () => { window.location.hash = ''; };

  // La app del huésped es pública — no requiere login.
  if (route === 'guest') return <GuestApp onGoAdmin={goAdmin} />;

  return (
    <QueryProvider>
      <AuthProvider>
        <ConfigProvider>
          <AuthGuard>
            <AdminApp onGoGuest={goGuest} />
          </AuthGuard>
        </ConfigProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
