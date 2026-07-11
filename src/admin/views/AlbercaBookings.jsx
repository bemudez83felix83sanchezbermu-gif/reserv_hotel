import { useMemo, useState } from 'react';
import { usePoolBookings } from '../../shared/hooks/usePoolBookings.jsx';
import { usePoolConfig } from '../../shared/hooks/usePoolConfig.jsx';
import { todayIso, fmt } from '../../shared/utils/helpers.js';

const CARD = { background: '#FFFDF7', border: '1px solid #EDE3CF', borderRadius: 18 };
const inputStyle = {
  padding: '9px 11px', border: '1px solid #E4D8C0', borderRadius: 9,
  fontFamily: 'Karla, sans-serif', fontSize: 12.5, background: '#FFFDF7', color: '#2E2418',
};

const KIND_LABELS = { event: 'Evento privado', day_pass: 'Day-pass' };
const STATUS_META = {
  reserved:    { label: 'Reservado',  bg: '#F1E7D2', fg: '#6B5335' },
  confirmed:   { label: 'Confirmado', bg: '#E4D5B8', fg: '#5C4A2E' },
  in_progress: { label: 'En curso',   bg: '#F7ECD8', fg: '#8A6420' },
  done:        { label: 'Terminado',  bg: '#EAF2E6', fg: '#3F6E4C' },
  cancelled:   { label: 'Cancelado',  bg: '#F5E0DA', fg: '#7A3B2A' },
};
const NEXT_STATUS = { reserved: 'confirmed', confirmed: 'in_progress', in_progress: 'done' };

function emptyForm(date, cfg) {
  return {
    kind: 'day_pass', date, startTime: '11:00', endTime: '13:00',
    guestsCount: 1, price: cfg?.defaultDayPassPrice ?? 0,
    contactName: '', contactPhone: '', notes: '',
  };
}

export default function AlbercaBookings() {
  const { bookings, createBooking, setBookingStatus, deleteBooking, checkConflict, saving } = usePoolBookings();
  const { config: poolCfg } = usePoolConfig();
  const today = todayIso();
  const [dateFilter, setDateFilter] = useState(today);
  const [form, setForm] = useState(() => emptyForm(today, poolCfg));
  const [conflictMsg, setConflictMsg] = useState('');

  const setKind = (kind) => setForm((f) => ({
    ...f, kind,
    price: kind === 'event' ? (poolCfg?.defaultEventPrice ?? 0) : (poolCfg?.defaultDayPassPrice ?? 0),
  }));

  const filtered = useMemo(
    () => bookings.filter((b) => !dateFilter || b.date === dateFilter),
    [bookings, dateFilter],
  );

  const submit = async (e) => {
    e.preventDefault();
    setConflictMsg('');
    if (!form.contactName.trim() || !form.date || !form.startTime) return;
    const conflict = await checkConflict({
      date: form.date, kind: form.kind, startTime: form.startTime, endTime: form.endTime,
      eventLocksPool: poolCfg?.eventLocksPool,
    });
    if (conflict) {
      setConflictMsg(`Conflicto con "${KIND_LABELS[conflict.kind]}" de ${conflict.contactName} (${conflict.startTime}${conflict.endTime ? '–' + conflict.endTime : ''}).`);
      return;
    }
    await createBooking(form);
    setForm(emptyForm(form.date, poolCfg));
  };

  return (
    <div style={{ padding: '30px 34px 44px', animation: 'fadeIn .35s ease both' }}>
      <div>
        <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 29 }}>Alberca — Reservas</div>
        <div style={{ fontSize: 13.5, color: '#8A7A63', marginTop: 4 }}>
          Eventos privados y day-pass; {poolCfg?.eventLocksPool ? 'un evento bloquea el day-pass en su horario' : 'eventos y day-pass pueden coincidir en horario'}
        </div>
      </div>

      <div style={{ ...CARD, padding: 18, marginTop: 20 }}>
        <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 18 }}>Nueva reserva</div>
        <form onSubmit={submit} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12, alignItems: 'center' }}>
          <select value={form.kind} onChange={(e) => setKind(e.target.value)} style={inputStyle}>
            <option value="day_pass">{KIND_LABELS.day_pass}</option>
            <option value="event">{KIND_LABELS.event}</option>
          </select>
          <input type="date" required value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} style={inputStyle} />
          <input type="time" required value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))} style={inputStyle} />
          <input type="time" value={form.endTime} onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))} style={inputStyle} />
          <input type="number" min={1} value={form.guestsCount} onChange={(e) => setForm((f) => ({ ...f, guestsCount: Math.max(1, Number(e.target.value) || 1) }))}
            style={{ ...inputStyle, width: 70 }} title="Huéspedes" />
          <input type="number" min={0} step="0.01" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) || 0 }))}
            style={{ ...inputStyle, width: 100 }} title="Precio" />
          <input placeholder="Contacto" required value={form.contactName} onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))}
            style={{ ...inputStyle, flex: '1 1 150px' }} />
          <input placeholder="Teléfono (opcional)" value={form.contactPhone} onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
            style={{ ...inputStyle, flex: '1 1 130px' }} />
          <button type="submit" disabled={saving} style={{
            padding: '10px 18px', border: 'none', borderRadius: 10,
            background: 'var(--ac, #B8552F)', color: '#FBF6EA',
            fontFamily: 'Karla, sans-serif', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
          }}>+ Crear</button>
        </form>
        {conflictMsg && (
          <div style={{ marginTop: 10, padding: 10, background: '#F5E0DA', color: '#7A3B2A', borderRadius: 10, fontSize: 12.5 }}>
            ⚠ {conflictMsg}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 20 }}>
        <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 18 }}>Agenda</div>
        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} style={{ ...inputStyle, marginLeft: 8 }} />
        <button onClick={() => setDateFilter('')} style={{
          border: 'none', background: 'transparent', color: '#8A7A63',
          fontFamily: 'Karla, sans-serif', fontSize: 12, fontWeight: 700, cursor: 'pointer',
        }}>Ver todas</button>
      </div>

      <div style={{ ...CARD, marginTop: 12, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.4fr 0.8fr 1fr 0.9fr 1.4fr', gap: 10, padding: '12px 18px', fontSize: 10.5, fontWeight: 700, letterSpacing: 1, color: '#8A7A63', borderBottom: '1px solid #EDE3CF' }}>
          <div>FECHA</div><div>HORARIO</div><div>CONTACTO</div><div>TIPO</div><div>PRECIO</div><div>ESTADO</div><div>ACCIONES</div>
        </div>
        {filtered.map((b) => (
          <div key={b.id} style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1.4fr 0.8fr 1fr 0.9fr 1.4fr', gap: 10,
            padding: '12px 18px', fontSize: 12.5, alignItems: 'center', borderBottom: '1px solid #F2EADA',
          }}>
            <div>{b.date}</div>
            <div>{b.startTime}{b.endTime ? '–' + b.endTime : ''}</div>
            <div>
              <div style={{ fontWeight: 700 }}>{b.contactName}</div>
              {b.reservationCode && <div style={{ fontSize: 11, color: '#8A7A63' }}>Reserva {b.reservationCode}</div>}
            </div>
            <div>{KIND_LABELS[b.kind]}</div>
            <div>{fmt(b.price)}</div>
            <div>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999,
                background: STATUS_META[b.status].bg, color: STATUS_META[b.status].fg,
              }}>{STATUS_META[b.status].label}</span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {NEXT_STATUS[b.status] && (
                <button onClick={() => setBookingStatus(b.id, NEXT_STATUS[b.status])} style={{
                  border: '1px solid #DACBAE', background: 'transparent', borderRadius: 8,
                  padding: '6px 10px', fontFamily: 'Karla, sans-serif', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                }}>{STATUS_META[NEXT_STATUS[b.status]].label} →</button>
              )}
              {b.status !== 'done' && b.status !== 'cancelled' && (
                <button onClick={() => setBookingStatus(b.id, 'cancelled')} style={{
                  border: '1px solid #E3B8AC', background: 'transparent', color: '#A8442C', borderRadius: 8,
                  padding: '6px 10px', fontFamily: 'Karla, sans-serif', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                }}>Cancelar</button>
              )}
              <button onClick={() => deleteBooking(b.id)} style={{
                border: 'none', background: 'transparent', color: '#93402D',
                fontFamily: 'Karla, sans-serif', fontSize: 11, fontWeight: 700, cursor: 'pointer',
              }}>Quitar</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: 18, fontSize: 12.5, color: '#8A7A63' }}>Sin reservas de alberca{dateFilter ? ' para esta fecha' : ''}.</div>
        )}
      </div>
    </div>
  );
}
