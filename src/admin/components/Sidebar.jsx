import { initials } from '../../shared/utils/helpers.js';

const NAV_ITEMS = [
  { key: 'dash',  label: 'Panel',
    icon: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.8" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.8" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.8" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.8" /></> },
  { key: 'res',   label: 'Reservaciones',
    icon: <><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M3.5 10h17M8 3v4M16 3v4" /></> },
  { key: 'rooms', label: 'Habitaciones',
    icon: <><path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7" /><path d="M3 18h18M3 21v-3M21 21v-3M6 9V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" /></> },
  { key: 'pkgs',  label: 'Paquetes',
    icon: <><rect x="3.5" y="8" width="17" height="12.5" rx="2" /><path d="M3.5 12h17M12 8v12.5M12 8s-1-4.5-4.2-4.5a2.2 2.2 0 0 0 0 4.4M12 8s1-4.5 4.2-4.5a2.2 2.2 0 0 1 0 4.4" /></> },
  { key: 'chk',   label: 'Check-in · Tarjetas',
    icon: <><rect x="3" y="6" width="18" height="13" rx="2.5" /><path d="M3 10.5h18M7 15.5h4" /><path d="M16.5 14.2c.9.5 1.5 1 1.5 1.8" /></> },
  { key: 'cfg',   label: 'Configuración',
    icon: <><path d="M4 8h10M18 8h2M4 16h2M10 16h10" /><circle cx="16" cy="8" r="2.4" /><circle cx="8" cy="16" r="2.4" /></> },
];

const REST_ITEMS = [
  { key: 'rest-vender', label: 'Vender',
    icon: <><circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" /><path d="M2.5 3h2.2l2.1 12.2a1.5 1.5 0 0 0 1.5 1.3h8.7a1.5 1.5 0 0 0 1.5-1.2L21.5 7H6" /></> },
  { key: 'rest-panel', label: 'Panel',
    icon: <><path d="M4 13a8 8 0 0 1 16 0" /><path d="M12 13l4-4M4 13h16" /></> },
  { key: 'rest-menu', label: 'Menú',
    icon: <><path d="M4 3v18M4 8h6M7 3v5" /><path d="M17 3c-1.5 0-2.5 1.5-2.5 4S15.5 11 17 11s2.5-1.5 2.5-4S18.5 3 17 3zM17 11v10" /></> },
  { key: 'rest-inv', label: 'Inventario',
    icon: <><rect x="3.5" y="7" width="17" height="13" rx="2" /><path d="M3.5 11h17M8 7V4.5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2V7" /></> },
  { key: 'rest-cajas', label: 'Cajas y cortes',
    icon: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 9h18M7 14h4" /><circle cx="16.5" cy="14" r="1.2" /></> },
  { key: 'rest-ventas', label: 'Ventas',
    icon: <><path d="M4 19V5M4 19h16M8 16v-4M12 16V8M16 16v-6" /></> },
  { key: 'rest-users', label: 'Usuarios',
    icon: <><circle cx="9" cy="8" r="3" /><path d="M4 20a5 5 0 0 1 10 0M16 5.5a3 3 0 0 1 0 5.6M15 20a5 5 0 0 0-1.5-3.6" /></> },
];

function NavButton({ it, on, onNavigate }) {
  return (
    <button
      onClick={() => onNavigate(it.key)}
      style={{
        display: 'flex', alignItems: 'center', gap: 11,
        padding: '10px 12px', border: 'none', borderRadius: 11,
        background: on ? 'var(--ac, #B8552F)' : 'transparent',
        color: on ? '#FBF6EA' : 'rgba(239,230,210,.78)',
        fontFamily: 'Karla, sans-serif', fontSize: 13.5, fontWeight: 700,
        cursor: 'pointer', textAlign: 'left',
        transition: 'background .15s ease',
      }}
      onMouseEnter={(e) => { if (!on) e.currentTarget.style.background = 'rgba(239,230,210,.06)'; }}
      onMouseLeave={(e) => { if (!on) e.currentTarget.style.background = 'transparent'; }}
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">{it.icon}</svg>
      {it.label}
    </button>
  );
}

export default function Sidebar({ tab, onNavigate, onGoGuest, config, staffName, onSignOut }) {
  const monogram = initials(config.name || 'Casa');
  const staffInitial = (staffName || 'R')[0].toUpperCase();

  return (
    <div style={{
      background: '#261D12', color: '#EFE6D2',
      display: 'flex', flexDirection: 'column',
      padding: '22px 14px 18px', overflowY: 'auto',
    }}>
      <div style={{ display: 'flex', gap: 11, alignItems: 'center', padding: '0 8px' }}>
        <div style={{
          width: 42, height: 42, borderRadius: '50%', background: 'var(--ac, #B8552F)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Marcellus, Georgia, serif', fontSize: 17, color: '#FBF6EA', flex: 'none',
        }}>{monogram}</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2.2, color: '#C99B4E' }}>ESTANCIA · PMS</div>
          <div style={{
            fontFamily: 'Marcellus, Georgia, serif', fontSize: 16, marginTop: 2,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{config.name}</div>
        </div>
      </div>

      <div style={{ height: 1, background: 'rgba(239,230,210,.12)', margin: '18px 8px' }} />

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.8, color: 'rgba(239,230,210,.4)', padding: '2px 12px 6px' }}>HOTEL</div>
        {NAV_ITEMS.map((it) => <NavButton key={it.key} it={it} on={tab === it.key} onNavigate={onNavigate} />)}

        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.8, color: '#C99B4E', padding: '16px 12px 6px' }}>LA PARADITA · RESTAURANTE</div>
        {REST_ITEMS.map((it) => <NavButton key={it.key} it={it} on={tab === it.key} onNavigate={onNavigate} />)}
      </nav>

      <div style={{ flex: 1 }} />

      <button onClick={onGoGuest} style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '11px 12px', borderRadius: 11,
        background: 'rgba(239,230,210,.07)', color: '#EFE6D2',
        fontSize: 12.5, fontWeight: 700, fontFamily: 'Karla, sans-serif',
        border: '1px solid rgba(239,230,210,.14)', cursor: 'pointer',
        textAlign: 'left',
      }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,230,210,.12)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239,230,210,.07)'}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
          <path d="M11 18.5h2" />
        </svg>
        Ver app del huésped
        <span style={{ marginLeft: 'auto' }}>↗</span>
      </button>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 14, padding: '0 6px' }}>
        <div style={{
          width: 34, height: 34, borderRadius: '50%', background: '#4A3323',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, color: '#EFCFA9', flex: 'none',
        }}>{staffInitial}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{staffName}</div>
          <div style={{ fontSize: 10.5, color: 'rgba(239,230,210,.55)' }}>Recepción · turno AM</div>
        </div>
        {onSignOut && (
          <button
            onClick={onSignOut}
            title="Cerrar sesión"
            style={{
              background: 'transparent', border: 'none', color: 'rgba(239,230,210,.55)',
              cursor: 'pointer', padding: 4, borderRadius: 6, flex: 'none',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#EFE6D2'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(239,230,210,.55)'}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <path d="M10 17l-5-5 5-5M15 12H4" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
