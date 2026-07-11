import { useEffect, useRef, useState } from 'react';
import ImageSlot from '../components/ImageSlot.jsx';
import { usePersistentState } from '../hooks/usePersistentState.js';
import { DEF_ROOMS, DEF_PKGS, DEF_CONFIG, REVIEWS } from '../data/mockData.js';
import { fmt } from '../utils/helpers.js';

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const fd = (iso) => {
  const d = new Date(iso + 'T12:00:00');
  return d.getDate() + ' ' + MONTHS[d.getMonth()];
};

const CHIP_DEFS = [
  ['all', 'Todas'],
  ['dos', 'Para dos'],
  ['fam', 'Familiares'],
  ['ter', 'Terraza y alberca'],
];
const FILTERS = {
  all: () => true,
  dos: (r) => r.cap <= 2,
  fam: (r) => r.cap >= 4,
  ter: (r) => (r.amenities || []).some((a) => /terraza|alberca/i.test(a)),
};

export default function GuestApp({ onGoAdmin }) {
  const rootRef = useRef(null);
  const [rooms] = usePersistentState('estancia-rooms', DEF_ROOMS);
  const [pkgs] = usePersistentState('estancia-pkgs', DEF_PKGS);
  const [config] = usePersistentState('estancia-config', DEF_CONFIG);

  const [screen, setScreen] = useState('home');
  const [roomId, setRoomId] = useState('r2');
  const [checkIn, setCheckIn] = useState('2026-07-10');
  const [checkOut, setCheckOut] = useState('2026-07-13');
  const [guests, setGuests] = useState(2);
  const [filter, setFilter] = useState('all');
  const [sel, setSel] = useState({});
  const [code, setCode] = useState('');

  useEffect(() => {
    if (rootRef.current) rootRef.current.style.setProperty('--ac', config.accent || '#B8552F');
  }, [config.accent]);

  const activeRooms = rooms.filter((r) => r.active !== false);
  const activePkgs = pkgs.filter((p) => p.active !== false);
  const nights = Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000) || 1);
  const room = activeRooms.find((r) => r.id === roomId) || activeRooms[0] || DEF_ROOMS[0];

  const guestsLabel = guests + (guests === 1 ? ' huésped' : ' huéspedes');
  const datesLabel = fd(checkIn) + ' – ' + fd(checkOut);
  const stayLabel = datesLabel + ' · ' + guestsLabel;
  const staySummary = datesLabel + ' · ' + nights + (nights === 1 ? ' noche' : ' noches') + ' · ' + guestsLabel;

  const pkgCost = (p) =>
    /persona \/ d[ií]a/i.test(p.unit) ? p.price * guests * nights
      : /persona/i.test(p.unit) ? p.price * guests
        : p.price;

  const base = room.price * nights;
  const totalLines = [{ l: nights + (nights === 1 ? ' noche × ' : ' noches × ') + fmt(room.price), v: fmt(base) }];
  let total = base;
  activePkgs.forEach((p) => {
    if (sel[p.id]) { const c = pkgCost(p); total += c; totalLines.push({ l: p.name, v: fmt(c) }); }
  });

  const goHome = () => { setScreen('home'); setSel({}); };
  const goRooms = () => setScreen('rooms');
  const openRoom = (id) => { setRoomId(id); setScreen('detail'); };
  const goPackages = () => setScreen('packages');
  const confirmBooking = () => {
    setCode('CA-' + Math.floor(1000 + Math.random() * 9000));
    setScreen('confirm');
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '48px 24px',
      background: 'radial-gradient(120% 90% at 50% 0%, #F4ECDD 0%, #EAE0CC 55%, #E2D5BC 100%)',
    }}>
      {/* iPhone-shaped frame */}
      <div style={{
        position: 'relative', width: 402, height: 874, maxWidth: '100%', maxHeight: 'calc(100vh - 96px)',
        borderRadius: 46, background: '#1a1108', padding: 10,
        boxShadow: '0 40px 80px rgba(30,20,10,.35), 0 0 0 1px rgba(0,0,0,.4)',
      }}>
        {/* Screen area */}
        <div ref={rootRef} style={{
          position: 'relative', width: '100%', height: '100%', overflow: 'hidden',
          borderRadius: 38, background: '#F7F1E6', color: '#2E2418',
          fontFamily: 'Karla, system-ui, sans-serif', WebkitFontSmoothing: 'antialiased',
        }}>
          {/* Notch (Dynamic Island style) */}
          <div style={{
            position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
            width: 108, height: 32, borderRadius: 999, background: '#0a0603', zIndex: 100,
          }} />

          {screen === 'home' && (
            <HomeScreen
              config={config}
              checkIn={checkIn} setCheckIn={setCheckIn}
              checkOut={checkOut} setCheckOut={setCheckOut}
              guests={guests} setGuests={setGuests} guestsLabel={guestsLabel}
              onGoRooms={goRooms} onGoAdmin={onGoAdmin}
            />
          )}
          {screen === 'rooms' && (
            <RoomsScreen
              rooms={activeRooms} filter={filter} setFilter={setFilter}
              stayLabel={stayLabel} onGoHome={goHome} onOpen={openRoom}
            />
          )}
          {screen === 'detail' && (
            <DetailScreen room={room} onGoRooms={goRooms} onGoPackages={goPackages} />
          )}
          {screen === 'packages' && (
            <PackagesScreen
              room={room} pkgs={activePkgs} sel={sel} setSel={setSel}
              staySummary={staySummary} totalLines={totalLines} total={total}
              onGoDetail={() => setScreen('detail')} onConfirm={confirmBooking}
            />
          )}
          {screen === 'confirm' && (
            <ConfirmScreen
              code={code} room={room} datesLabel={datesLabel}
              guestsLabel={guestsLabel} totalF={fmt(total)}
              onGoHome={goHome}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────── HOME
function HomeScreen({ config, checkIn, setCheckIn, checkOut, setCheckOut, guests, setGuests, guestsLabel, onGoRooms, onGoAdmin }) {
  const reviewsLoop = [...REVIEWS, ...REVIEWS];
  return (
    <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', animation: 'fadeIn .5s ease both' }}>
      <div style={{ position: 'relative', height: 392, background: '#3A2E20' }}>
        <ImageSlot id="hero" shape="rect" placeholder="Foto del hotel" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(30,22,12,.38) 0%, rgba(30,22,12,0) 34%, rgba(30,22,12,.72) 100%)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'absolute', left: 24, right: 24, bottom: 26, color: '#FBF6EA', pointerEvents: 'none' }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 2.6, opacity: 0.85, animation: 'fadeUp .6s .1s both' }}>
            HOTEL BOUTIQUE · VALLE DE GUADALUPE
          </div>
          <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 38, lineHeight: 1.08, marginTop: 8, animation: 'fadeUp .6s .2s both' }}>
            {config.name}
          </div>
          <div style={{ fontSize: 14, fontStyle: 'italic', opacity: 0.82, marginTop: 7, animation: 'fadeUp .6s .3s both' }}>
            {config.tagline}
          </div>
        </div>
      </div>

      <div style={{
        margin: '-30px 20px 0', position: 'relative', zIndex: 2,
        background: '#FFFDF7', border: '1px solid #EDE3CF', borderRadius: 22,
        boxShadow: '0 18px 40px rgba(62,44,22,.14)', padding: 18,
        animation: 'fadeUp .6s .35s both',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[['LLEGADA', checkIn, setCheckIn], ['SALIDA', checkOut, setCheckOut]].map(([label, val, setter]) => (
            <div key={label} style={{ border: '1px solid #E9DFCC', borderRadius: 14, padding: '10px 12px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.6, color: '#8A7A63' }}>{label}</div>
              <input type="date" value={val} onChange={(e) => setter(e.target.value)}
                style={{ border: 'none', background: 'transparent', fontFamily: 'Karla, sans-serif', fontSize: 14.5, fontWeight: 600, color: '#2E2418', marginTop: 3, width: '100%', padding: 0, outline: 'none' }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #E9DFCC', borderRadius: 14, padding: '10px 12px', marginTop: 10 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.6, color: '#8A7A63' }}>HUÉSPEDES</div>
            <div style={{ fontSize: 14.5, fontWeight: 600, marginTop: 3 }}>{guestsLabel}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => setGuests(Math.max(1, guests - 1))} style={{
              width: 36, height: 36, borderRadius: '50%',
              border: '1px solid #DACBAE', background: '#FFFDF7',
              color: '#2E2418', fontSize: 18, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>−</button>
            <button onClick={() => setGuests(Math.min(8, guests + 1))} style={{
              width: 36, height: 36, borderRadius: '50%',
              border: '1px solid #DACBAE', background: '#FFFDF7',
              color: '#2E2418', fontSize: 18, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>+</button>
          </div>
        </div>
        <button onClick={onGoRooms} style={{
          width: '100%', marginTop: 12, padding: 15, border: 'none', borderRadius: 14,
          background: 'var(--ac, #B8552F)', color: '#FBF6EA',
          fontFamily: 'Karla, sans-serif', fontSize: 15.5, fontWeight: 700, letterSpacing: 0.3, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: '0 10px 22px rgba(184,85,47,.32)',
          transition: 'transform .15s ease',
        }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = ''}
        >Ver disponibilidad <span style={{ fontSize: 17 }}>→</span></button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, padding: '26px 20px 0' }}>
        {[
          ['Desayuno de la casa', 0.45, <><path d="M5 11h11v3a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5v-3z" /><path d="M16 12h1.5a2.5 2.5 0 0 1 0 5H16" /><path d="M8 7c0-1.2 1-1.4 1-2.5M12 7c0-1.2 1-1.4 1-2.5" /></>],
          ['Alberca al aire libre', 0.52, <><path d="M3 15c1.5-1.4 3.5-1.4 5 0s3.5 1.4 5 0 3.5-1.4 5 0 3 1.2 3 1.2" /><path d="M3 19c1.5-1.4 3.5-1.4 5 0s3.5 1.4 5 0 3.5-1.4 5 0" /><circle cx="17" cy="6" r="2.6" /></>],
          ['Viñedos a 5 min', 0.59, <><circle cx="9" cy="14" r="2.4" /><circle cx="14.5" cy="16.5" r="2.4" /><circle cx="12" cy="10.5" r="2.4" /><path d="M12 8c0-3 1.5-4.5 4-5-.3 2.4-1.6 3.8-4 5z" /></>],
        ].map(([label, delay, icon]) => (
          <div key={label} style={{ textAlign: 'center', animation: `fadeUp .6s ${delay}s both` }}>
            <div style={{
              width: 46, height: 46, borderRadius: '50%', background: '#F1E7D2',
              margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7A5A38" strokeWidth="1.6" strokeLinecap="round">{icon}</svg>
            </div>
            <div style={{ fontSize: 11.5, fontWeight: 700, marginTop: 8, lineHeight: 1.3 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '30px 0 0' }}>
        <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 21, padding: '0 20px' }}>Lo que dicen nuestros huéspedes</div>
        <div style={{ overflow: 'hidden', marginTop: 14 }}>
          <div style={{ display: 'flex', gap: 12, width: 'max-content', animation: 'mq 30s linear infinite' }}>
            {reviewsLoop.map((rv, i) => (
              <div key={i} style={{
                width: 240, background: '#FFFDF7', border: '1px solid #EDE3CF',
                borderRadius: 18, padding: 16,
              }}>
                <div style={{ color: '#C99B4E', fontSize: 13, letterSpacing: 2 }}>★★★★★</div>
                <div style={{ fontSize: 13.5, lineHeight: 1.5, marginTop: 8, fontStyle: 'italic', color: '#4A3D2C' }}>"{rv.text}"</div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: '#8A7A63', marginTop: 10 }}>{rv.author}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '30px 20px 60px', color: '#9A8A70', fontSize: 11.5, lineHeight: 1.7 }}>
        {config.name} · Carretera al Tigre km 3, Valle de Guadalupe<br />
        <button onClick={onGoAdmin} style={{
          background: 'none', border: 'none', padding: 0, color: '#9A8A70',
          textDecoration: 'underline', textUnderlineOffset: 3,
          fontFamily: 'inherit', fontSize: 'inherit', cursor: 'pointer',
        }}>Panel del hotel →</button>
      </div>
    </div>
  );
}

// ─────────────── ROOMS
function RoomsScreen({ rooms, filter, setFilter, stayLabel, onGoHome, onOpen }) {
  const filtered = rooms.filter(FILTERS[filter] || FILTERS.all);
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', animation: 'slideR .42s cubic-bezier(.2,.7,.2,1) both' }}>
      <div style={{ padding: '64px 20px 12px', background: 'linear-gradient(#F7F1E6 78%, rgba(247,241,230,0))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onGoHome} style={{
            width: 38, height: 38, borderRadius: '50%',
            border: '1px solid #E4D8C0', background: '#FFFDF7', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2E2418" strokeWidth="2" strokeLinecap="round">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <div>
            <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 23, lineHeight: 1 }}>Habitaciones</div>
            <div style={{ fontSize: 12, color: '#8A7A63', marginTop: 4 }}>{stayLabel}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14, overflowX: 'auto', paddingBottom: 2 }}>
          {CHIP_DEFS.map(([k, label]) => {
            const on = filter === k;
            return (
              <button key={k} onClick={() => setFilter(k)} style={{
                flex: 'none', padding: '8px 14px', borderRadius: 999,
                border: '1px solid ' + (on ? '#2E2418' : '#E4D8C0'),
                background: on ? '#2E2418' : '#FFFDF7',
                color: on ? '#FBF6EA' : '#6B5D4A',
                fontFamily: 'Karla, sans-serif', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
                transition: 'all .18s ease',
              }}>{label}</button>
            );
          })}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 20px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filtered.map((r, i) => (
          <div key={r.id} onClick={() => onOpen(r.id)} style={{
            background: '#FFFDF7', border: '1px solid #EDE3CF', borderRadius: 20,
            overflow: 'hidden', cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(62,44,22,.06)',
            transition: 'transform .22s cubic-bezier(.2,.7,.2,1), box-shadow .22s ease',
            animation: `fadeUp .55s cubic-bezier(.2,.7,.2,1) ${(0.06 + i * 0.09).toFixed(2)}s both`,
          }}>
            <div style={{ position: 'relative', height: 188, background: '#EAE0CC' }}>
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                <ImageSlot id={`room-${r.id}-1`} shape="rect" placeholder="Foto de la habitación" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
              </div>
              <div style={{
                position: 'absolute', top: 12, left: 12,
                background: 'rgba(251,246,234,.92)', backdropFilter: 'blur(4px)',
                borderRadius: 999, padding: '5px 11px',
                fontSize: 10.5, fontWeight: 700, letterSpacing: 1, color: '#6B5335',
              }}>{(r.type || '').toUpperCase()}</div>
            </div>
            <div style={{ padding: '15px 16px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 19 }}>{r.name}</div>
                <div style={{ textAlign: 'right', flex: 'none' }}>
                  <span style={{ fontSize: 16.5, fontWeight: 700, color: 'var(--ac, #B8552F)' }}>{fmt(r.price)}</span>
                  <span style={{ fontSize: 11, color: '#8A7A63' }}> /noche</span>
                </div>
              </div>
              <div style={{ fontSize: 12.5, color: '#8A7A63', marginTop: 4 }}>
                Hasta {r.cap} huéspedes · {r.m2} m² · {r.bed}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: '1px dashed #E9DFCC' }}>
                <div style={{ fontSize: 12, color: '#6B5D4A' }}>{(r.amenities || []).slice(0, 2).join(' · ')}</div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ac, #B8552F)', display: 'flex', alignItems: 'center', gap: 4, flex: 'none' }}>
                  Ver <span>→</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────── DETAIL
function DetailScreen({ room, onGoRooms, onGoPackages }) {
  const slots = [1, 2, 3].map((n) => ({ id: `room-${room.id}-${n}`, ph: n === 1 ? 'Foto principal' : 'Foto ' + n }));
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', animation: 'slideR .42s cubic-bezier(.2,.7,.2,1) both' }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 110 }}>
        <div style={{ position: 'relative', height: 330, background: '#EAE0CC' }}>
          <div style={{ display: 'flex', height: '100%', overflowX: 'auto', scrollSnapType: 'x mandatory' }}>
            {slots.map((s) => (
              <div key={s.id} style={{ flex: 'none', width: 402, height: '100%', scrollSnapAlign: 'center', position: 'relative' }}>
                <ImageSlot id={s.id} shape="rect" placeholder={s.ph} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
              </div>
            ))}
          </div>
          <button onClick={onGoRooms} style={{
            position: 'absolute', top: 64, left: 16,
            width: 38, height: 38, borderRadius: '50%', border: 'none',
            background: 'rgba(251,246,234,.92)', backdropFilter: 'blur(6px)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,.14)',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2E2418" strokeWidth="2" strokeLinecap="round">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6, pointerEvents: 'none' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <div style={{ width: 16, height: 5, borderRadius: 99, background: 'rgba(251,246,234,.95)' }} />
              <div style={{ width: 5, height: 5, borderRadius: 99, background: 'rgba(251,246,234,.55)' }} />
              <div style={{ width: 5, height: 5, borderRadius: 99, background: 'rgba(251,246,234,.55)' }} />
            </div>
          </div>
          <div style={{
            position: 'absolute', bottom: 12, right: 12,
            background: 'rgba(30,22,12,.55)', color: '#FBF6EA',
            fontSize: 10.5, fontWeight: 700, padding: '4px 9px', borderRadius: 99,
            pointerEvents: 'none',
          }}>Desliza para ver más ›</div>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 2.2, color: 'var(--ac, #B8552F)', animation: 'fadeUp .5s .05s both' }}>
            {(room.type || '').toUpperCase()}
          </div>
          <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 29, marginTop: 5, animation: 'fadeUp .5s .1s both' }}>{room.name}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap', animation: 'fadeUp .5s .16s both' }}>
            {[room.cap + ' huéspedes', room.m2 + ' m²', room.bed].map((c) => (
              <div key={c} style={{ padding: '6px 12px', borderRadius: 999, background: '#F1E7D2', fontSize: 12, fontWeight: 700, color: '#6B5335' }}>{c}</div>
            ))}
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.65, color: '#4A3D2C', margin: '16px 0 0', animation: 'fadeUp .5s .22s both' }}>{room.desc}</p>
          <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 19, marginTop: 24, animation: 'fadeUp .5s .28s both' }}>Comodidades</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 14px', marginTop: 12, animation: 'fadeUp .5s .32s both' }}>
            {(room.amenities || []).map((am) => (
              <div key={am} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, color: '#4A3D2C' }}>
                <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--ac, #B8552F)', flex: 'none' }} />
                {am}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '14px 20px 34px',
        background: 'linear-gradient(rgba(247,241,230,0), #F7F1E6 30%)',
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: '#8A7A63', fontWeight: 700 }}>DESDE</div>
          <div>
            <span style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 23 }}>{fmt(room.price)}</span>
            <span style={{ fontSize: 12, color: '#8A7A63' }}> /noche</span>
          </div>
        </div>
        <button onClick={onGoPackages} style={{
          flex: 'none', padding: '15px 22px', border: 'none', borderRadius: 14,
          background: 'var(--ac, #B8552F)', color: '#FBF6EA',
          fontFamily: 'Karla, sans-serif', fontSize: 15, fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 10px 22px rgba(184,85,47,.32)',
          transition: 'transform .15s ease',
        }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = ''}
        >Elegir paquetes →</button>
      </div>
    </div>
  );
}

// ─────────────── PACKAGES
function PackagesScreen({ room, pkgs, sel, setSel, staySummary, totalLines, total, onGoDetail, onConfirm }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', animation: 'slideR .42s cubic-bezier(.2,.7,.2,1) both' }}>
      <div style={{ padding: '64px 20px 10px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onGoDetail} style={{
          width: 38, height: 38, borderRadius: '50%',
          border: '1px solid #E4D8C0', background: '#FFFDF7', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2E2418" strokeWidth="2" strokeLinecap="round">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 23 }}>Completa tu estancia</div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 40px' }}>
        <div style={{
          background: '#2E2418', color: '#FBF6EA', borderRadius: 18, padding: 16,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          animation: 'fadeUp .5s .05s both',
        }}>
          <div>
            <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 17 }}>{room.name}</div>
            <div style={{ fontSize: 12, opacity: 0.75, marginTop: 3 }}>{staySummary}</div>
          </div>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#C99B4E" strokeWidth="1.5" strokeLinecap="round">
            <path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6" />
            <path d="M3 18h18M5 10V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3" />
          </svg>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
          {pkgs.map((p, i) => {
            const on = !!sel[p.id];
            return (
              <div key={p.id} onClick={() => setSel((s) => ({ ...s, [p.id]: !s[p.id] }))} style={{
                display: 'flex', gap: 13, alignItems: 'flex-start',
                background: on ? '#F8EDE4' : '#FFFDF7',
                border: '1.5px solid ' + (on ? 'var(--ac, #B8552F)' : '#EDE3CF'),
                borderRadius: 18, padding: 15, cursor: 'pointer',
                transition: 'all .2s ease',
                animation: `fadeUp .5s ${(0.08 + i * 0.07).toFixed(2)}s both`,
              }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = ''}
              >
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  border: '1.5px solid ' + (on ? 'var(--ac, #B8552F)' : '#D5C6A8'),
                  background: on ? 'var(--ac, #B8552F)' : 'transparent',
                  flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginTop: 1, transition: 'all .2s ease',
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FBF6EA" strokeWidth="3.4" strokeLinecap="round"
                    style={{ opacity: on ? 1 : 0, transition: 'opacity .15s ease' }}>
                    <path d="M5 13l5 5L20 7" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'baseline' }}>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{p.name}</div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ac, #B8552F)', flex: 'none' }}>{fmt(p.price)}</div>
                  </div>
                  <div style={{ fontSize: 12.5, color: '#6B5D4A', lineHeight: 1.5, marginTop: 3 }}>{p.desc}</div>
                  <div style={{ fontSize: 11, color: '#8A7A63', fontWeight: 700, marginTop: 5, letterSpacing: 0.4 }}>{p.unit.toUpperCase()}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ background: '#FFFDF7', border: '1px solid #EDE3CF', borderRadius: 18, padding: 16, marginTop: 18 }}>
          {totalLines.map((tl, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, color: '#4A3D2C', padding: '4px 0' }}>
              <span>{tl.l}</span>
              <span style={{ fontWeight: 600 }}>{tl.v}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px dashed #E4D8C0', marginTop: 10, paddingTop: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>Total</span>
            <span style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 24 }}>{fmt(total)}</span>
          </div>
          <div style={{ fontSize: 11, color: '#9A8A70', marginTop: 4, textAlign: 'right' }}>Impuestos incluidos · MXN</div>
        </div>

        <button onClick={onConfirm} style={{
          width: '100%', marginTop: 14, padding: 16, border: 'none', borderRadius: 14,
          background: 'var(--ac, #B8552F)', color: '#FBF6EA',
          fontFamily: 'Karla, sans-serif', fontSize: 15.5, fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 10px 22px rgba(184,85,47,.32)',
          transition: 'transform .15s ease',
        }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = ''}
        >Confirmar reserva</button>
      </div>
    </div>
  );
}

// ─────────────── CONFIRM
function ConfirmScreen({ code, room, datesLabel, guestsLabel, totalF, onGoHome }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', animation: 'pop .5s cubic-bezier(.2,.7,.2,1) both' }}>
      <div style={{
        minHeight: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '80px 24px 50px', textAlign: 'center',
      }}>
        <svg width="92" height="92" viewBox="0 0 92 92" fill="none">
          <circle cx="46" cy="46" r="42" stroke="var(--ac, #B8552F)" strokeWidth="2.5"
            strokeDasharray="264" strokeDashoffset="264"
            style={{ animation: 'drawRing .7s ease .15s forwards' }} />
          <path d="M30 47l11 11 21-23" stroke="var(--ac, #B8552F)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray="50" strokeDashoffset="50"
            style={{ animation: 'drawCheck .45s ease .75s forwards' }} />
        </svg>
        <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 28, marginTop: 20, animation: 'fadeUp .5s .3s both' }}>¡Reserva confirmada!</div>
        <div style={{ fontSize: 13.5, color: '#8A7A63', marginTop: 6, animation: 'fadeUp .5s .4s both' }}>Enviamos los detalles a tu correo.</div>
        <div style={{
          marginTop: 22, border: '1.5px dashed var(--ac, #B8552F)',
          borderRadius: 16, padding: '14px 30px',
          animation: 'fadeUp .5s .5s both',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: '#8A7A63' }}>CÓDIGO DE RESERVA</div>
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: 4, color: 'var(--ac, #B8552F)', marginTop: 4 }}>{code || 'CA-2607'}</div>
        </div>
        <div style={{
          width: '100%', background: '#FFFDF7', border: '1px solid #EDE3CF',
          borderRadius: 18, padding: 16, marginTop: 18, textAlign: 'left',
          animation: 'fadeUp .5s .6s both',
        }}>
          {[
            ['Habitación', room.name],
            ['Fechas', datesLabel],
            ['Huéspedes', guestsLabel],
          ].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, padding: '5px 0' }}>
              <span style={{ color: '#8A7A63' }}>{l}</span>
              <span style={{ fontWeight: 700 }}>{v}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, padding: '5px 0', borderTop: '1px dashed #E4D8C0', marginTop: 5, paddingTop: 11 }}>
            <span style={{ color: '#8A7A63' }}>Total</span>
            <span style={{ fontWeight: 700, color: 'var(--ac, #B8552F)' }}>{totalF}</span>
          </div>
        </div>
        <div style={{
          width: '100%', display: 'flex', gap: 11, alignItems: 'flex-start',
          background: '#F1E7D2', borderRadius: 16, padding: 14, marginTop: 14,
          textAlign: 'left', animation: 'fadeUp .5s .7s both',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7A5A38" strokeWidth="1.7" strokeLinecap="round" style={{ flex: 'none', marginTop: 1 }}>
            <rect x="3" y="6" width="18" height="13" rx="2.5" />
            <path d="M3 10h18M7 15.5h4" />
          </svg>
          <div style={{ fontSize: 12.5, lineHeight: 1.55, color: '#6B5335' }}>
            Tu <b>tarjeta-llave</b> se activará en recepción al llegar. Solo presenta tu código.
          </div>
        </div>
        <button onClick={onGoHome} style={{
          marginTop: 20, padding: '13px 26px',
          border: '1.5px solid #DACBAE', borderRadius: 14,
          background: 'transparent', color: '#2E2418',
          fontFamily: 'Karla, sans-serif', fontSize: 14, fontWeight: 700, cursor: 'pointer',
        }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#F4EBD9'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >Volver al inicio</button>
      </div>
    </div>
  );
}
