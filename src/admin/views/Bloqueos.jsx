import { useState } from 'react';
import { useRoomBlocks } from '../../shared/hooks/useRoomBlocks.jsx';
import { todayIso } from '../../shared/utils/helpers.js';

const CARD = { background: '#FFFDF7', border: '1px solid #EDE3CF', borderRadius: 18 };
const REASONS = ['maintenance', 'private', 'seasonal', 'staff'];
const REASON_LABELS = { maintenance: 'Mantenimiento', private: 'Uso privado', seasonal: 'Temporada', staff: 'Personal' };
const inputStyle = {
  padding: '9px 11px', border: '1px solid #E4D8C0', borderRadius: 9,
  fontFamily: 'Karla, sans-serif', fontSize: 12.5, background: '#FFFDF7', color: '#2E2418',
};

export default function Bloqueos({ rooms }) {
  const { blocks, createBlock, deleteBlock, saving } = useRoomBlocks();
  const today = todayIso();
  const [form, setForm] = useState({ roomId: '', dateFrom: today, dateTo: today, reason: 'maintenance', notes: '' });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.roomId || !form.dateFrom || !form.dateTo) return;
    await createBlock(form);
    setForm({ roomId: '', dateFrom: today, dateTo: today, reason: 'maintenance', notes: '' });
  };

  return (
    <div style={{ padding: '30px 34px 44px', animation: 'fadeIn .35s ease both' }}>
      <div>
        <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 29 }}>Bloqueos de habitación</div>
        <div style={{ fontSize: 13.5, color: '#8A7A63', marginTop: 4 }}>
          Rangos de fechas en los que una habitación no está disponible para reservar
        </div>
      </div>

      <div style={{ ...CARD, padding: 18, marginTop: 20 }}>
        <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 18 }}>Nuevo bloqueo</div>
        <form onSubmit={submit} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12, alignItems: 'center' }}>
          <select required value={form.roomId} onChange={(e) => setForm((f) => ({ ...f, roomId: e.target.value }))} style={inputStyle}>
            <option value="">Habitación…</option>
            {rooms.map((r) => <option key={r.id} value={r.id}>Hab. {r.num} · {r.name}</option>)}
          </select>
          <input type="date" required value={form.dateFrom} onChange={(e) => setForm((f) => ({ ...f, dateFrom: e.target.value }))} style={inputStyle} />
          <input type="date" required value={form.dateTo} onChange={(e) => setForm((f) => ({ ...f, dateTo: e.target.value }))} style={inputStyle} />
          <select value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} style={inputStyle}>
            {REASONS.map((r) => <option key={r} value={r}>{REASON_LABELS[r]}</option>)}
          </select>
          <input
            placeholder="Notas (opcional)"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            style={{ ...inputStyle, flex: '1 1 180px' }}
          />
          <button type="submit" disabled={saving} style={{
            padding: '10px 18px', border: 'none', borderRadius: 10,
            background: 'var(--ac, #B8552F)', color: '#FBF6EA',
            fontFamily: 'Karla, sans-serif', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
          }}>+ Bloquear</button>
        </form>
      </div>

      <div style={{ ...CARD, marginTop: 16, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 0.9fr 1.4fr 70px', gap: 10, padding: '12px 18px', fontSize: 10.5, fontWeight: 700, letterSpacing: 1, color: '#8A7A63', borderBottom: '1px solid #EDE3CF' }}>
          <div>HABITACIÓN</div><div>DESDE</div><div>HASTA</div><div>MOTIVO</div><div>NOTAS</div><div />
        </div>
        {blocks.map((b) => {
          const active = b.dateFrom <= today && b.dateTo >= today;
          return (
            <div key={b.id} style={{
              display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 0.9fr 1.4fr 70px', gap: 10,
              padding: '12px 18px', fontSize: 12.5, alignItems: 'center', borderBottom: '1px solid #F2EADA',
            }}>
              <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                {active && <span title="Vigente hoy" style={{ width: 8, height: 8, borderRadius: 99, background: '#C0503C', flex: 'none' }} />}
                {b.roomLabel}
              </div>
              <div>{b.dateFrom}</div>
              <div>{b.dateTo}</div>
              <div>{REASON_LABELS[b.reason] || b.reason}</div>
              <div style={{ color: '#6B5D4A' }}>{b.notes || '—'}</div>
              <button onClick={() => deleteBlock(b.id)} style={{
                border: 'none', background: 'transparent', color: '#93402D',
                fontFamily: 'Karla, sans-serif', fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
              }}>Quitar</button>
            </div>
          );
        })}
        {blocks.length === 0 && (
          <div style={{ padding: '18px', fontSize: 12.5, color: '#8A7A63' }}>No hay bloqueos registrados.</div>
        )}
      </div>
    </div>
  );
}
