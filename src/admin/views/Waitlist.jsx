import { useEffect, useState } from 'react';
import { useWaitlist } from '../../shared/hooks/useWaitlist.jsx';
import { searchGuests } from '../../shared/api/waitlist.js';
import { todayIso } from '../../shared/utils/helpers.js';

const CARD = { background: '#FFFDF7', border: '1px solid #EDE3CF', borderRadius: 18 };
const STATUS_META = {
  waiting:  { label: 'En espera', bg: '#F1E7D2', fg: '#6B5335' },
  notified: { label: 'Notificado', bg: '#E4D5B8', fg: '#5C4A2E' },
  booked:   { label: 'Reservado', bg: '#EAF2E6', fg: '#3F6E4C' },
  expired:  { label: 'Expirado', bg: '#F5E0DA', fg: '#7A3B2A' },
};
const inputStyle = {
  padding: '9px 11px', border: '1px solid #E4D8C0', borderRadius: 9,
  fontFamily: 'Karla, sans-serif', fontSize: 12.5, background: '#FFFDF7', color: '#2E2418',
};
const chipBtn = {
  padding: '6px 11px', border: '1px solid #DACBAE', borderRadius: 9,
  background: 'transparent', color: '#2E2418',
  fontFamily: 'Karla, sans-serif', fontSize: 11, fontWeight: 700, cursor: 'pointer',
};

function GuestPicker({ guest, onPick }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    if (!open) return undefined;
    searchGuests(query).then((r) => { if (alive) setResults(r); });
    return () => { alive = false; };
  }, [query, open]);

  if (guest) {
    return (
      <div style={{ ...chipBtn, cursor: 'default', display: 'flex', gap: 8, alignItems: 'center' }}>
        {guest.name}
        <span onClick={() => onPick(null)} style={{ cursor: 'pointer', color: '#93402D' }}>✕</span>
      </div>
    );
  }
  return (
    <div style={{ position: 'relative' }}>
      <input
        placeholder="Buscar huésped…"
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        style={inputStyle}
      />
      {open && results.length > 0 && (
        <div style={{
          position: 'absolute', top: '110%', left: 0, zIndex: 5, minWidth: 200,
          background: '#FFFDF7', border: '1px solid #EDE3CF', borderRadius: 10,
          boxShadow: '0 10px 24px rgba(62,44,22,.14)', overflow: 'hidden',
        }}>
          {results.map((g) => (
            <div key={g.id} onMouseDown={() => onPick(g)} style={{
              padding: '9px 12px', fontSize: 12.5, cursor: 'pointer',
            }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#F4EBD9'}
              onMouseLeave={(e) => e.currentTarget.style.background = ''}
            >{g.name}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Waitlist({ roomTypes }) {
  const { entries, createEntry, setStatus, deleteEntry, saving } = useWaitlist();
  const today = todayIso();
  const [guest, setGuest] = useState(null);
  const [form, setForm] = useState({ preferredRoomTypeId: '', dateFrom: today, dateTo: today, guestsCount: 1 });

  const submit = async (e) => {
    e.preventDefault();
    if (!guest) return;
    await createEntry({ guestId: guest.id, ...form });
    setGuest(null);
    setForm({ preferredRoomTypeId: '', dateFrom: today, dateTo: today, guestsCount: 1 });
  };

  return (
    <div style={{ padding: '30px 34px 44px', animation: 'fadeIn .35s ease both' }}>
      <div>
        <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 29 }}>Lista de espera</div>
        <div style={{ fontSize: 13.5, color: '#8A7A63', marginTop: 4 }}>
          Huéspedes esperando disponibilidad para fechas sin cupo
        </div>
      </div>

      <div style={{ ...CARD, padding: 18, marginTop: 20 }}>
        <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 18 }}>Agregar a la lista</div>
        <form onSubmit={submit} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12, alignItems: 'center' }}>
          <GuestPicker guest={guest} onPick={setGuest} />
          <select value={form.preferredRoomTypeId} onChange={(e) => setForm((f) => ({ ...f, preferredRoomTypeId: e.target.value }))} style={inputStyle}>
            <option value="">Cualquier tipo</option>
            {roomTypes.map((rt) => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
          </select>
          <input type="date" required value={form.dateFrom} onChange={(e) => setForm((f) => ({ ...f, dateFrom: e.target.value }))} style={inputStyle} />
          <input type="date" required value={form.dateTo} onChange={(e) => setForm((f) => ({ ...f, dateTo: e.target.value }))} style={inputStyle} />
          <input type="number" min="1" value={form.guestsCount} onChange={(e) => setForm((f) => ({ ...f, guestsCount: Number(e.target.value) || 1 }))} style={{ ...inputStyle, width: 70 }} />
          <button type="submit" disabled={saving || !guest} style={{
            padding: '10px 18px', border: 'none', borderRadius: 10,
            background: 'var(--ac, #B8552F)', color: '#FBF6EA',
            fontFamily: 'Karla, sans-serif', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
            opacity: guest ? 1 : 0.5,
          }}>+ Agregar</button>
        </form>
      </div>

      <div style={{ ...CARD, marginTop: 16, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1.1fr 0.9fr 0.9fr 0.7fr 1fr 1fr', gap: 10, padding: '12px 18px', fontSize: 10.5, fontWeight: 700, letterSpacing: 1, color: '#8A7A63', borderBottom: '1px solid #EDE3CF' }}>
          <div>HUÉSPED</div><div>TIPO PREFERIDO</div><div>DESDE</div><div>HASTA</div><div>PAX</div><div>ESTADO</div><div />
        </div>
        {entries.map((w) => (
          <div key={w.id} style={{
            display: 'grid', gridTemplateColumns: '1.3fr 1.1fr 0.9fr 0.9fr 0.7fr 1fr 1fr', gap: 10,
            padding: '12px 18px', fontSize: 12.5, alignItems: 'center', borderBottom: '1px solid #F2EADA',
          }}>
            <div style={{ fontWeight: 700 }}>{w.guestName}</div>
            <div>{w.preferredRoomTypeName || 'Cualquiera'}</div>
            <div>{w.dateFrom}</div>
            <div>{w.dateTo}</div>
            <div>{w.guestsCount}</div>
            <div>
              <span style={{
                fontSize: 10.5, fontWeight: 700, padding: '4px 10px', borderRadius: 999,
                background: STATUS_META[w.status].bg, color: STATUS_META[w.status].fg,
              }}>{STATUS_META[w.status].label}</span>
            </div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
              {w.status === 'waiting' && <button onClick={() => setStatus(w.id, 'notified')} style={chipBtn}>Notificar</button>}
              {w.status === 'notified' && <button onClick={() => setStatus(w.id, 'booked')} style={chipBtn}>Reservó</button>}
              {(w.status === 'waiting' || w.status === 'notified') && (
                <button onClick={() => setStatus(w.id, 'expired')} style={{ ...chipBtn, color: '#93402D', borderColor: '#D49B8B' }}>Expirar</button>
              )}
              <button onClick={() => deleteEntry(w.id)} style={{ ...chipBtn, border: 'none' }}>✕</button>
            </div>
          </div>
        ))}
        {entries.length === 0 && (
          <div style={{ padding: '18px', fontSize: 12.5, color: '#8A7A63' }}>No hay huéspedes en lista de espera.</div>
        )}
      </div>
    </div>
  );
}
