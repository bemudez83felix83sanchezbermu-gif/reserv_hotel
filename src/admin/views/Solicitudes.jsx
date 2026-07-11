import { useMemo, useState } from 'react';
import { useGuestRequests } from '../../shared/hooks/useGuestRequests.jsx';
import { useInHouse } from '../../shared/hooks/useReservations.jsx';
import { useAuth } from '../../shared/hooks/useAuth.jsx';
import { todayIso } from '../../shared/utils/helpers.js';

const CARD = { background: '#FFFDF7', border: '1px solid #EDE3CF', borderRadius: 18 };
const inputStyle = {
  padding: '9px 11px', border: '1px solid #E4D8C0', borderRadius: 9,
  fontFamily: 'Karla, sans-serif', fontSize: 12.5, background: '#FFFDF7', color: '#2E2418',
};

const STATUSES = ['pending', 'in_progress', 'done'];
const STATUS_META = {
  pending:     { label: 'Pendiente', bg: '#F1E7D2', fg: '#6B5335' },
  in_progress: { label: 'En curso',  bg: '#F7ECD8', fg: '#8A6420' },
  done:        { label: 'Atendida',  bg: '#EAF2E6', fg: '#3F6E4C' },
  cancelled:   { label: 'Cancelada', bg: '#F5E0DA', fg: '#7A3B2A' },
};
const NEXT_STATUS = { pending: 'in_progress', in_progress: 'done' };

export default function Solicitudes() {
  const { requests, createRequest, setRequestStatus, saving } = useGuestRequests();
  const { inHouse } = useInHouse(todayIso());
  const { staff } = useAuth();

  const [form, setForm] = useState({ reservationId: '', request: '' });

  const byStatus = useMemo(() => {
    const map = { pending: [], in_progress: [], done: [] };
    requests.forEach((r) => { if (r.status !== 'cancelled') (map[r.status] || map.pending).push(r); });
    return map;
  }, [requests]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.reservationId || !form.request.trim()) return;
    await createRequest(form);
    setForm({ reservationId: '', request: '' });
  };

  return (
    <div style={{ padding: '30px 34px 44px', animation: 'fadeIn .35s ease both' }}>
      <div>
        <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 29 }}>Solicitudes de huéspedes</div>
        <div style={{ fontSize: 13.5, color: '#8A7A63', marginTop: 4 }}>
          Bandeja de pedidos de huéspedes que están hoy en casa
        </div>
      </div>

      <div style={{ ...CARD, padding: 18, marginTop: 20 }}>
        <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 18 }}>Nueva solicitud</div>
        <form onSubmit={submit} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12, alignItems: 'center' }}>
          <select required value={form.reservationId} onChange={(e) => setForm((f) => ({ ...f, reservationId: e.target.value }))} style={{ ...inputStyle, flex: '1 1 220px' }}>
            <option value="">Huésped en casa…</option>
            {inHouse.map((r) => <option key={r.id} value={r.id}>Hab. {r.roomNum} · {r.guest} ({r.code})</option>)}
          </select>
          <input
            placeholder="Descripción de la solicitud"
            required value={form.request}
            onChange={(e) => setForm((f) => ({ ...f, request: e.target.value }))}
            style={{ ...inputStyle, flex: '2 1 260px' }}
          />
          <button type="submit" disabled={saving} style={{
            padding: '10px 18px', border: 'none', borderRadius: 10,
            background: 'var(--ac, #B8552F)', color: '#FBF6EA',
            fontFamily: 'Karla, sans-serif', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
          }}>+ Registrar</button>
        </form>
        {inHouse.length === 0 && (
          <div style={{ marginTop: 10, fontSize: 12, color: '#8A7A63' }}>No hay huéspedes en casa hoy.</div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14, marginTop: 20 }}>
        {STATUSES.map((st) => (
          <div key={st} style={{ ...CARD, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999,
                background: STATUS_META[st].bg, color: STATUS_META[st].fg,
              }}>{STATUS_META[st].label}</span>
              <span style={{ marginLeft: 'auto', fontSize: 11.5, color: '#8A7A63', fontWeight: 700 }}>{byStatus[st].length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
              {byStatus[st].map((r) => (
                <div key={r.id} style={{ border: '1px solid #EDE3CF', borderRadius: 12, padding: 11 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700 }}>{r.roomLabel} · {r.guest}</div>
                  <div style={{ fontSize: 12, color: '#6B5D4A', marginTop: 4 }}>{r.request}</div>
                  {r.fulfilledByName && <div style={{ fontSize: 11, color: '#8A7A63', marginTop: 4 }}>Atendida por {r.fulfilledByName}</div>}
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    {NEXT_STATUS[r.status] && (
                      <button onClick={() => setRequestStatus(r.id, NEXT_STATUS[r.status], staff?.id)} style={{
                        padding: '6px 10px', border: '1px solid #DACBAE', borderRadius: 8,
                        background: 'transparent', fontFamily: 'Karla, sans-serif', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                      }}>{r.status === 'pending' ? 'Atender →' : 'Completar →'}</button>
                    )}
                    {r.status !== 'done' && (
                      <button onClick={() => setRequestStatus(r.id, 'cancelled', staff?.id)} style={{
                        padding: '6px 10px', border: '1px solid #E3B8AC', borderRadius: 8,
                        background: 'transparent', color: '#93402D', fontFamily: 'Karla, sans-serif', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                      }}>Cancelar</button>
                    )}
                  </div>
                </div>
              ))}
              {byStatus[st].length === 0 && <div style={{ fontSize: 11.5, color: '#B3A386' }}>Sin solicitudes</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
