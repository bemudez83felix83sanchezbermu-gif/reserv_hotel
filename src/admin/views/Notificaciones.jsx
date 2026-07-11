import { useMemo, useState } from 'react';
import { useNotifications } from '../../shared/hooks/useNotifications.jsx';

const CARD = { background: '#FFFDF7', border: '1px solid #EDE3CF', borderRadius: 15 };
const inputStyle = {
  padding: '9px 11px', border: '1px solid #E4D8C0', borderRadius: 9,
  fontFamily: 'Karla, sans-serif', fontSize: 12.5, background: '#FFFDF7', color: '#2E2418',
};

const TYPES = ['reservation', 'key_card', 'housekeeping', 'pool', 'shift', 'inventory', 'corporate', 'survey'];
const TYPE_LABELS = {
  reservation: 'Reservación', key_card: 'Tarjeta-llave', housekeeping: 'Housekeeping', pool: 'Alberca',
  shift: 'Turno', inventory: 'Inventario', corporate: 'Corporativo', survey: 'Encuesta',
};

export default function Notificaciones() {
  const { notifications, loading, error, markRead, markAllRead, saving } = useNotifications();
  const [typeFilter, setTypeFilter] = useState('');

  const filtered = useMemo(
    () => (typeFilter ? notifications.filter((n) => n.type === typeFilter) : notifications),
    [notifications, typeFilter],
  );

  return (
    <div style={{ padding: '30px 34px 44px', animation: 'fadeIn .35s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 29 }}>Notificaciones</div>
          <div style={{ fontSize: 13.5, color: '#8A7A63', marginTop: 4 }}>Avisos dirigidos a tu usuario de staff</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={inputStyle}>
            <option value="">Todos los tipos</option>
            {TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
          </select>
          <button onClick={markAllRead} disabled={saving} style={{
            padding: '10px 16px', border: '1px solid #DACBAE', borderRadius: 10,
            background: 'transparent', color: '#2E2418',
            fontFamily: 'Karla, sans-serif', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
          }}>Marcar todas como leídas</button>
        </div>
      </div>

      {error && <div style={{ marginTop: 16, padding: 12, background: '#F5E0DA', color: '#7A3B2A', borderRadius: 12, fontSize: 13.5 }}>{error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 20 }}>
        {filtered.map((n) => (
          <div key={n.id} onClick={() => !n.readAt && markRead(n.id)} style={{
            ...CARD, padding: 14, display: 'flex', alignItems: 'flex-start', gap: 12,
            cursor: n.readAt ? 'default' : 'pointer',
            borderColor: n.readAt ? '#EDE3CF' : 'var(--ac, #B8552F)',
            background: n.readAt ? '#FFFDF7' : '#F8EDE4',
          }}>
            <span style={{ width: 8, height: 8, borderRadius: 99, marginTop: 5, flex: 'none', background: n.readAt ? 'transparent' : 'var(--ac, #B8552F)' }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13.5, fontWeight: 700 }}>{n.title}</span>
                <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: '#F1E7D2', color: '#6B5335' }}>{TYPE_LABELS[n.type] || n.type}</span>
              </div>
              {n.body && <div style={{ fontSize: 12.5, color: '#6B5D4A', marginTop: 3 }}>{n.body}</div>}
              <div style={{ fontSize: 11, color: '#9A8A70', marginTop: 4 }}>{new Date(n.createdAt).toLocaleString('es-MX')}</div>
            </div>
          </div>
        ))}
        {!loading && filtered.length === 0 && (
          <div style={{ ...CARD, padding: 24, textAlign: 'center', color: '#8A7A63', fontSize: 13.5 }}>Sin notificaciones.</div>
        )}
      </div>
    </div>
  );
}
