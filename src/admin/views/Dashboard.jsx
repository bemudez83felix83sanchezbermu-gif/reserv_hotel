import { initials, roomLabel, fmt, todayIso, addDaysIso, dAbsOf, capitalize } from '../../shared/utils/helpers.js';
import { useArrivals, useDepartures, useInHouse, useReservationsInRange } from '../../shared/hooks/useReservations.jsx';

const WD_LETTERS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
const ACTIVE_STATUSES = new Set(['confirmada', 'llega-hoy', 'en-casa']);

const CARD = {
  background: '#FFFDF7', border: '1px solid #EDE3CF', borderRadius: 18, padding: 18,
};
const KPI_LABEL = {
  fontSize: 11, fontWeight: 700, letterSpacing: 1.4, color: '#8A7A63',
};

// Ocupación (%) de una fecha dada, a partir de reservas que se solapan con el rango [from,to].
function occupancyOn(dateIso, reservations, totalRooms) {
  if (!totalRooms) return 0;
  const roomIds = new Set();
  reservations.forEach((r) => {
    if (ACTIVE_STATUSES.has(r.status) && r.checkIn <= dateIso && r.checkOut > dateIso) roomIds.add(r.roomId);
  });
  return Math.round((roomIds.size / totalRooms) * 100);
}

export default function Dashboard({ config, staffName, rooms, onCheckIn }) {
  const today = todayIso();
  const weekStart = addDaysIso(today, -6);
  const monthStart = new Date(); monthStart.setDate(1);
  const monthStartIso = monthStart.toISOString().slice(0, 10);
  const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
  const monthEndIso = new Date(monthStart.getFullYear(), monthStart.getMonth(), daysInMonth).toISOString().slice(0, 10);

  const { arrivals } = useArrivals(today);
  const { departures } = useDepartures(today);
  const { reservations: weekRes } = useReservationsInRange(weekStart, today);
  const { reservations: monthRes } = useReservationsInRange(monthStartIso, monthEndIso);

  const activeArrivals = arrivals.filter((r) => ACTIVE_STATUSES.has(r.status));
  const activeDepartures = departures.filter((r) => ACTIVE_STATUSES.has(r.status));
  const activeRooms = rooms.filter((r) => r.active);

  const occupancyToday = occupancyOn(today, weekRes, activeRooms.length);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDaysIso(today, i - 6));
  const weekOcc = weekDays.map((d) => occupancyOn(d, weekRes, activeRooms.length));

  const monthRevenue = monthRes
    .filter((r) => ACTIVE_STATUSES.has(r.status) && r.checkIn >= monthStartIso && r.checkIn <= monthEndIso)
    .reduce((sum, r) => sum + (r.total || 0), 0);

  const occupiedTodayCount = new Set(
    weekRes.filter((r) => ACTIVE_STATUSES.has(r.status) && r.checkIn <= today && r.checkOut > today).map((r) => r.roomId)
  ).size;

  const monthLabel = capitalize(monthStart.toLocaleDateString('es-MX', { month: 'long' }));

  return (
    <div style={{ padding: '30px 34px 44px', animation: 'fadeIn .4s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 29 }}>Buenos días, {staffName}</div>
          <div style={{ fontSize: 13.5, color: '#8A7A63', marginTop: 4 }}>
            {capitalize(new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))} · {config?.name}
          </div>
        </div>
        <div style={{
          background: '#FFFDF7', border: '1px solid #EDE3CF', borderRadius: 999,
          padding: '8px 16px', fontSize: 12.5, fontWeight: 700, color: '#6B5335', flex: 'none',
        }}>{occupiedTodayCount} habitaciones ocupadas hoy · {occupiedTodayCount} de {activeRooms.length}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(205px, 1fr))', gap: 14, marginTop: 22 }}>
        <div style={{ ...CARD, display: 'flex', alignItems: 'center', gap: 14, animation: 'fadeUp .5s .05s both' }}>
          <svg width="72" height="72" viewBox="0 0 72 72" style={{ flex: 'none' }}>
            <circle cx="36" cy="36" r="30" fill="none" stroke="#EFE6D2" strokeWidth="7" />
            <circle
              cx="36" cy="36" r="30" fill="none"
              stroke="var(--ac, #B8552F)" strokeWidth="7" strokeLinecap="round"
              strokeDasharray={188.5}
              strokeDashoffset={188.5 * (1 - occupancyToday / 100)}
              transform="rotate(-90 36 36)"
            />
            <text x="36" y="41" textAnchor="middle" style={{ fontFamily: 'Karla, sans-serif', fontSize: 16, fontWeight: 700, fill: '#2E2418' }}>{occupancyToday}%</text>
          </svg>
          <div>
            <div style={KPI_LABEL}>OCUPACIÓN</div>
            <div style={{ fontSize: 13, color: '#4A3D2C', marginTop: 4, lineHeight: 1.4 }}>
              {monthLabel}<br />
              <span style={{ color: '#6B5D4A' }}>Hoy</span>
            </div>
          </div>
        </div>
        <div style={{ ...CARD, animation: 'fadeUp .5s .12s both' }}>
          <div style={KPI_LABEL}>LLEGADAS HOY</div>
          <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 38, marginTop: 6 }}>{activeArrivals.length}</div>
          <div style={{ fontSize: 12, color: '#6B5D4A', marginTop: 2 }}>
            {activeArrivals.filter((r) => r.packages.length > 0).length} con paquetes
          </div>
        </div>
        <div style={{ ...CARD, animation: 'fadeUp .5s .19s both' }}>
          <div style={KPI_LABEL}>SALIDAS HOY</div>
          <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 38, marginTop: 6 }}>{activeDepartures.length}</div>
          <div style={{ fontSize: 12, color: '#6B5D4A', marginTop: 2 }}>
            {activeDepartures[0]?.guest || 'Sin salidas'}
          </div>
        </div>
        <div style={{ ...CARD, background: '#2E2418', border: 'none', color: '#FBF6EA', animation: 'fadeUp .5s .26s both' }}>
          <div style={{ ...KPI_LABEL, color: '#C99B4E' }}>INGRESOS DE {monthLabel.toUpperCase()}</div>
          <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 32, marginTop: 6 }}>{fmt(monthRevenue)}</div>
          <div style={{ fontSize: 12, marginTop: 2, color: 'rgba(251,246,234,.7)' }}>MXN · reservas confirmadas o en curso</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.35fr) minmax(0,1fr)', gap: 14, marginTop: 14 }}>
        <div style={{ ...CARD, padding: 20, animation: 'fadeUp .5s .3s both' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 17 }}>Ocupación de la semana</div>
            <div style={{ fontSize: 11.5, color: '#8A7A63' }}>{weekDays[0]} – {weekDays[6]}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12, alignItems: 'end', height: 150, marginTop: 18 }}>
            {weekOcc.map((v, i) => {
              const isToday = i === 6;
              const wd = WD_LETTERS[new Date(weekDays[i] + 'T12:00:00').getDay()];
              return (
                <div key={i} title={'Ocupación ' + v + '%'} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 7, height: '100%', justifyContent: 'flex-end',
                }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: '#8A7A63' }}>{v}%</div>
                  <div style={{
                    width: '100%', maxWidth: 38,
                    height: Math.max(2, v) * 1.05 + 'px',
                    borderRadius: '8px 8px 3px 3px',
                    background: isToday ? 'var(--ac, #B8552F)' : '#E4D5B8',
                    transformOrigin: 'bottom',
                  }} />
                  <div style={{ fontSize: 11, fontWeight: 700, color: isToday ? 'var(--ac, #B8552F)' : '#8A7A63' }}>
                    {wd}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ ...CARD, padding: 20, animation: 'fadeUp .5s .36s both' }}>
          <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 17 }}>Llegadas de hoy</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
            {activeArrivals.map((a) => (
              <div key={a.id} style={{
                display: 'flex', alignItems: 'center', gap: 11,
                padding: '10px 12px', border: '1px solid #EDE3CF', borderRadius: 14,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: '#F1E7D2', color: '#7A5A38',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, flex: 'none',
                }}>{initials(a.guest)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 700,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{a.guest}</div>
                  <div style={{ fontSize: 11.5, color: '#8A7A63' }}>
                    {roomLabel(rooms, a.roomId)} · {dAbsOf(a.checkOut) - dAbsOf(a.checkIn)} noches
                  </div>
                </div>
                <button
                  onClick={() => onCheckIn(a.code)}
                  style={{
                    flex: 'none', padding: '7px 12px', border: 'none', borderRadius: 9,
                    background: 'var(--ac, #B8552F)', color: '#FBF6EA',
                    fontFamily: 'Karla, sans-serif', fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.filter = ''}
                >Check-in →</button>
              </div>
            ))}
            {activeArrivals.length === 0 && (
              <div style={{ fontSize: 12.5, color: '#8A7A63' }}>No hay llegadas programadas para hoy.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
