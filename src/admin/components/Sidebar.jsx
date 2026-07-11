import { initials } from '../../shared/utils/helpers.js';
import { useNotifications } from '../../shared/hooks/useNotifications.jsx';
import { useFeatureFlags } from '../../shared/hooks/useFeatureFlags.jsx';

const NAV_ITEMS = [
  { key: 'dash',  label: 'Panel',
    icon: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.8" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.8" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.8" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.8" /></> },
  { key: 'res',   label: 'Reservaciones',
    icon: <><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M3.5 10h17M8 3v4M16 3v4" /></> },
  { key: 'guests', label: 'Huéspedes',
    icon: <><circle cx="12" cy="8" r="3.4" /><path d="M5 20c0-4 3-6.5 7-6.5s7 2.5 7 6.5" /></> },
  { key: 'tags',  label: 'Etiquetas de huésped',
    icon: <><path d="M3 11.5V5a2 2 0 0 1 2-2h6.5L20 11.5 11.5 20 3 11.5Z" /><circle cx="7.7" cy="7.7" r="1.4" /></> },
  { key: 'companies', label: 'Empresas', feature: 'corporate',
    icon: <><rect x="4" y="8" width="16" height="11" rx="2" /><path d="M9 8V6a3 3 0 0 1 3-3v0a3 3 0 0 1 3 3v2" /><path d="M4 13h16" /></> },
  { key: 'rooms', label: 'Habitaciones',
    icon: <><path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7" /><path d="M3 18h18M3 21v-3M21 21v-3M6 9V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" /></> },
  { key: 'pkgs',  label: 'Paquetes',
    icon: <><rect x="3.5" y="8" width="17" height="12.5" rx="2" /><path d="M3.5 12h17M12 8v12.5M12 8s-1-4.5-4.2-4.5a2.2 2.2 0 0 0 0 4.4M12 8s1-4.5 4.2-4.5a2.2 2.2 0 0 1 0 4.4" /></> },
  { key: 'channels', label: 'Canales',
    icon: <><circle cx="6" cy="6" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="12" cy="18" r="2.5" /><path d="M6 8.5V12a3 3 0 0 0 3 3h1M18 8.5V12a3 3 0 0 0-3 3h-1" /></> },
  { key: 'discounts', label: 'Descuentos',
    icon: <><path d="M3 12V5a2 2 0 0 1 2-2h7l9 9-9 9-9-9z" /><circle cx="8" cy="8" r="1.5" /></> },
  { key: 'seasons', label: 'Temporadas',
    icon: <><path d="M4 16l5-5 4 4 7-8" /><path d="M15 7h5v5" /></> },

  { divider: 'Operación diaria' },
  { key: 'chk',   label: 'Check-in · Tarjetas',
    icon: <><rect x="3" y="6" width="18" height="13" rx="2.5" /><path d="M3 10.5h18M7 15.5h4" /><path d="M16.5 14.2c.9.5 1.5 1 1.5 1.8" /></> },
  { key: 'hk',    label: 'Housekeeping', feature: 'housekeeping',
    icon: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></> },
  { key: 'blocks', label: 'Bloqueos',
    icon: <><circle cx="12" cy="12" r="9" /><path d="M5.8 5.8l12.4 12.4" /></> },
  { key: 'wait',  label: 'Lista de espera',
    icon: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></> },
  { key: 'cts',   label: 'Cortesías', feature: 'courtesies',
    icon: <><rect x="4" y="9" width="16" height="11" rx="1.5" /><path d="M4 9h16M12 9v11" /><path d="M8 9c0-2 1.5-3.5 3-2 .8.8 1 2 1 2M16 9c0-2-1.5-3.5-3-2-.8.8-1 2-1 2" /></> },
  { key: 'amen',  label: 'Amenidades', feature: 'amenity_inventory',
    icon: <><path d="M3 8l9-5 9 5-9 5-9-5z" /><path d="M3 8v9l9 5 9-5V8" /><path d="M12 13v9" /></> },
  { key: 'reqs',  label: 'Solicitudes',
    icon: <><path d="M4 5h16v11H8l-4 4V5Z" /><path d="M8 9h8M8 12.5h5" /></> },

  { divider: 'Servicios auxiliares' },
  { key: 'pool_cfg', label: 'Alberca · Config', feature: 'pool',
    icon: <><path d="M4 18c1.5-1.2 3-1.2 4.5 0s3 1.2 4.5 0 3-1.2 4.5 0 3-1.2 4.5 0" /><path d="M6 6l4 4M6 10l4-4" /><circle cx="16" cy="7" r="2.2" /></> },
  { key: 'pool_bkg', label: 'Alberca · Reservas', feature: 'pool',
    icon: <><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M3.5 10h17" /><path d="M6 15c1.2-.9 2.4-.9 3.6 0s2.4.9 3.6 0 2.4-.9 3.6 0" /></> },
  { key: 'surveys', label: 'Encuestas', feature: 'surveys',
    icon: <><path d="M6 4h9l3 3v13H6z" /><path d="M9 10h6M9 13.5h6M9 17h3" /></> },

  { divider: 'Administración' },
  { key: 'print_tmpl', label: 'Plantillas de impresión',
    icon: <><rect x="5" y="3" width="14" height="8" rx="1.5" /><rect x="5" y="13" width="14" height="8" rx="1.5" /><path d="M3 11h18v4H3z" /></> },
  { key: 'msg_tmpl', label: 'Plantillas de mensajes',
    icon: <><rect x="3.5" y="5" width="17" height="13" rx="2.5" /><path d="M3.5 6.5 12 13l8.5-6.5" /></> },
  { key: 'texts', label: 'Textos (i18n)',
    icon: <><path d="M5 5h14M12 5v15M8 20h8" /></> },
  { key: 'flags', label: 'Feature flags',
    icon: <><path d="M5 3v18" /><path d="M5 4h11l-2.5 3.5L16 11H5" /></> },
  { key: 'catalogs', label: 'Catálogos',
    icon: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></> },
  { key: 'roles', label: 'Roles',
    icon: <><path d="M12 3 4 6.5v5c0 5 3.4 8.4 8 9.5 4.6-1.1 8-4.5 8-9.5v-5L12 3Z" /></> },
  { key: 'staff', label: 'Staff',
    icon: <><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6" /><circle cx="17.5" cy="8.5" r="2.2" /><path d="M15.5 14c2.6.4 4.5 2.4 4.5 5" /></> },
  { key: 'closing', label: 'Cierre contable',
    icon: <><rect x="4" y="4" width="16" height="16" rx="2.5" /><path d="M8 13l2.5 2.5L16 9" /></> },
  { key: 'audit', label: 'Auditoría',
    icon: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.3 15.3 20 20" /></> },
  { key: 'cfg',   label: 'Configuración',
    icon: <><path d="M4 8h10M18 8h2M4 16h2M10 16h10" /><circle cx="16" cy="8" r="2.4" /><circle cx="8" cy="16" r="2.4" /></> },
];

export default function Sidebar({ tab, onNavigate, onGoGuest, config, staffName, onSignOut }) {
  const monogram = initials(config?.name || 'Casa');
  const staffInitial = (staffName || 'R')[0].toUpperCase();
  const { unreadCount } = useNotifications();
  const { flags } = useFeatureFlags();
  const disabledFeatures = new Set(flags.filter((f) => f.enabled === false).map((f) => f.feature));
  const visibleItems = NAV_ITEMS.filter((it) => it.divider || !it.feature || !disabledFeatures.has(it.feature));

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
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2.2, color: '#C99B4E' }}>ESTANCIA · PMS</div>
          <div style={{
            fontFamily: 'Marcellus, Georgia, serif', fontSize: 16, marginTop: 2,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{config?.name || 'Casa'}</div>
        </div>
        <button
          onClick={() => onNavigate('notifs')}
          title="Notificaciones"
          style={{
            position: 'relative', flex: 'none', width: 34, height: 34, borderRadius: '50%',
            border: '1px solid rgba(239,230,210,.16)', background: tab === 'notifs' ? 'rgba(239,230,210,.12)' : 'transparent',
            color: '#EFE6D2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6Z" />
            <path d="M10 20a2 2 0 0 0 4 0" />
          </svg>
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: -3, right: -3, minWidth: 16, height: 16, borderRadius: 99,
              background: 'var(--ac, #B8552F)', color: '#FBF6EA', fontSize: 9.5, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px',
            }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </button>
      </div>

      <div style={{ height: 1, background: 'rgba(239,230,210,.12)', margin: '18px 8px' }} />

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {visibleItems.map((it, i) => {
          if (it.divider) {
            return (
              <div key={'div-' + i} style={{
                fontSize: 9.5, fontWeight: 700, letterSpacing: 1.6, color: 'rgba(239,230,210,.42)',
                padding: '14px 12px 4px',
              }}>{it.divider.toUpperCase()}</div>
            );
          }
          const on = tab === it.key;
          return (
            <button
              key={it.key}
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
        })}
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
