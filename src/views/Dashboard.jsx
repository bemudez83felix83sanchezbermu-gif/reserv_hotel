import { RESERVATIONS } from '../data/mockData.js';
import { initials, roomLabel } from '../utils/helpers.js';

const WEEK_OCC = [62, 58, 71, 78, 88, 96, 84];
const WEEK_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const CARD = {
  background: '#FFFDF7', border: '1px solid #EDE3CF', borderRadius: 18, padding: 18,
};
const KPI_LABEL = {
  fontSize: 11, fontWeight: 700, letterSpacing: 1.4, color: '#8A7A63',
};

export default function Dashboard({ config, staffName, rooms, onCheckIn }) {
  const arrivals = RESERVATIONS.filter((r) => r.status === 'llega-hoy');

  return (
    <div style={{ padding: '30px 34px 44px', animation: 'fadeIn .4s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 29 }}>Buenos días, {staffName}</div>
          <div style={{ fontSize: 13.5, color: '#8A7A63', marginTop: 4 }}>
            Domingo 5 de julio de 2026 · {config.name}
          </div>
        </div>
        <div style={{
          background: '#FFFDF7', border: '1px solid #EDE3CF', borderRadius: 999,
          padding: '8px 16px', fontSize: 12.5, fontWeight: 700, color: '#6B5335', flex: 'none',
        }}>5 habitaciones ocupadas hoy · 5 de 5</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(205px, 1fr))', gap: 14, marginTop: 22 }}>
        <div style={{ ...CARD, display: 'flex', alignItems: 'center', gap: 14, animation: 'fadeUp .5s .05s both' }}>
          <svg width="72" height="72" viewBox="0 0 72 72" style={{ flex: 'none' }}>
            <circle cx="36" cy="36" r="30" fill="none" stroke="#EFE6D2" strokeWidth="7" />
            <circle
              cx="36" cy="36" r="30" fill="none"
              stroke="var(--ac, #B8552F)" strokeWidth="7" strokeLinecap="round"
              strokeDasharray="188.5" strokeDashoffset="188.5"
              transform="rotate(-90 36 36)"
              style={{ animation: 'ring78 1.1s cubic-bezier(.2,.7,.2,1) .3s forwards' }}
            />
            <text x="36" y="41" textAnchor="middle" style={{ fontFamily: 'Karla, sans-serif', fontSize: 16, fontWeight: 700, fill: '#2E2418' }}>78%</text>
          </svg>
          <div>
            <div style={KPI_LABEL}>OCUPACIÓN</div>
            <div style={{ fontSize: 13, color: '#4A3D2C', marginTop: 4, lineHeight: 1.4 }}>
              Julio 2026<br />
              <span style={{ color: '#6F7D5C', fontWeight: 700 }}>+9 pts</span> vs junio
            </div>
          </div>
        </div>
        <div style={{ ...CARD, animation: 'fadeUp .5s .12s both' }}>
          <div style={KPI_LABEL}>LLEGADAS HOY</div>
          <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 38, marginTop: 6 }}>3</div>
          <div style={{ fontSize: 12, color: '#6B5D4A', marginTop: 2 }}>2 con paquetes</div>
        </div>
        <div style={{ ...CARD, animation: 'fadeUp .5s .19s both' }}>
          <div style={KPI_LABEL}>SALIDAS HOY</div>
          <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 38, marginTop: 6 }}>1</div>
          <div style={{ fontSize: 12, color: '#6B5D4A', marginTop: 2 }}>Familia Hernández · 12:00</div>
        </div>
        <div style={{ ...CARD, background: '#2E2418', border: 'none', color: '#FBF6EA', animation: 'fadeUp .5s .26s both' }}>
          <div style={{ ...KPI_LABEL, color: '#C99B4E' }}>INGRESOS DE JULIO</div>
          <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 32, marginTop: 6 }}>$412,900</div>
          <div style={{ fontSize: 12, marginTop: 2, color: 'rgba(251,246,234,.7)' }}>
            <span style={{ color: '#9DB380', fontWeight: 700 }}>▲ 12%</span> vs junio · MXN
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.35fr) minmax(0,1fr)', gap: 14, marginTop: 14 }}>
        <div style={{ ...CARD, padding: 20, animation: 'fadeUp .5s .3s both' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 17 }}>Ocupación de la semana</div>
            <div style={{ fontSize: 11.5, color: '#8A7A63' }}>29 jun – 5 jul</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12, alignItems: 'end', height: 150, marginTop: 18 }}>
            {WEEK_OCC.map((v, i) => {
              const today = i === 6;
              return (
                <div key={i} title={'Ocupación ' + v + '%'} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 7, height: '100%', justifyContent: 'flex-end',
                }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: '#8A7A63' }}>{v}%</div>
                  <div style={{
                    width: '100%', maxWidth: 38,
                    height: v * 1.05 + 'px',
                    borderRadius: '8px 8px 3px 3px',
                    background: today ? 'var(--ac, #B8552F)' : '#E4D5B8',
                    transformOrigin: 'bottom',
                    animation: `growH .7s cubic-bezier(.2,.7,.2,1) ${(0.15 + i * 0.07).toFixed(2)}s both`,
                  }} />
                  <div style={{ fontSize: 11, fontWeight: 700, color: today ? 'var(--ac, #B8552F)' : '#8A7A63' }}>
                    {WEEK_LABELS[i]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ ...CARD, padding: 20, animation: 'fadeUp .5s .36s both' }}>
          <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 17 }}>Llegadas de hoy</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
            {arrivals.map((a) => (
              <div key={a.code} style={{
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
                    {roomLabel(rooms, a.roomId)} · {a.end - a.start} noches
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
          </div>
        </div>
      </div>
    </div>
  );
}
