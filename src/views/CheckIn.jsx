import { RESERVATIONS } from '../data/mockData.js';
import { initials, roomLabel } from '../utils/helpers.js';

const CARD = { background: '#FFFDF7', border: '1px solid #EDE3CF', borderRadius: 15 };

function GuestRow({ r, accent, on, cards, onSelect, rooms }) {
  const hasCard = cards > 0 || r.status === 'en-casa';
  const isArrival = r.status === 'llega-hoy';
  return (
    <div onClick={onSelect} style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '13px 14px',
      border: '1.5px solid ' + (on ? accent : '#EDE3CF'),
      background: on ? '#F8EDE4' : '#FFFDF7',
      borderRadius: 15, cursor: 'pointer', transition: 'all .15s ease',
    }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(2px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = ''}
    >
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        background: isArrival ? '#F1E7D2' : '#E7EBDD',
        color: isArrival ? '#7A5A38' : '#5C6B4A',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 700, flex: 'none',
      }}>{initials(r.guest)}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700 }}>{r.guest}</div>
        <div style={{ fontSize: 11.5, color: '#8A7A63', marginTop: 1 }}>
          {roomLabel(rooms, r.roomId)} · {r.end - r.start} noches · {r.n} pax
        </div>
      </div>
      <div style={{
        flex: 'none', padding: '5px 10px', borderRadius: 999,
        fontSize: 10.5, fontWeight: 700,
        background: hasCard ? '#EAF0E2' : '#F8E9E0',
        color: hasCard ? '#4E6238' : '#A8442C',
      }}>{hasCard ? 'Con tarjeta' : 'Sin tarjeta'}</div>
    </div>
  );
}

export default function CheckIn({ rooms, selResCode, setSelResCode, issued, onStartCardFlow, accent }) {
  const arrivals = RESERVATIONS.filter((r) => r.status === 'llega-hoy');
  const inHouse = RESERVATIONS.filter((r) => r.status === 'en-casa');
  const selR = RESERVATIONS.find((r) => r.code === selResCode) || arrivals[0] || RESERVATIONS[0];
  const selCards = issued[selR.code] || 0;
  const room = rooms.find((r) => r.id === selR.roomId);

  const selRes = {
    code: selR.code, guest: selR.guest,
    roomLine: roomLabel(rooms, selR.roomId),
    dates: `${selR.start} – ${selR.end} jul`,
    nights: String(selR.end - selR.start),
    n: String(selR.n),
    pkgChips: selR.pkgs.length ? selR.pkgs : ['Sin paquetes'],
    cardCount: String(selCards),
    cardCountColor: selCards > 0 ? '#6F9B4E' : '#B3A386',
    btnLabel: selCards > 0 ? 'Codificar otra tarjeta' : 'Activar tarjeta-llave',
  };

  return (
    <div style={{ padding: '30px 34px 44px', animation: 'fadeIn .35s ease both' }}>
      <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 29 }}>Check-in y tarjetas</div>
      <div style={{ fontSize: 13.5, color: '#8A7A63', marginTop: 4 }}>
        Domingo 5 de julio · codificador NFC conectado por USB
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 370px) minmax(0, 1fr)', gap: 16, marginTop: 20, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.4, color: '#8A7A63', padding: '0 2px' }}>
            LLEGADAS DE HOY · {arrivals.length}
          </div>
          {arrivals.map((r) => (
            <GuestRow key={r.code} r={r} accent={accent}
              on={selResCode === r.code}
              cards={issued[r.code] || 0}
              rooms={rooms}
              onSelect={() => setSelResCode(r.code)}
            />
          ))}
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.4, color: '#8A7A63', padding: '10px 2px 0' }}>
            YA EN CASA · {inHouse.length}
          </div>
          {inHouse.map((r) => (
            <GuestRow key={r.code} r={r} accent={accent}
              on={selResCode === r.code}
              cards={issued[r.code] || 0}
              rooms={rooms}
              onSelect={() => setSelResCode(r.code)}
            />
          ))}
        </div>

        <div style={{ ...CARD, borderRadius: 20, padding: 24, position: 'sticky', top: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 }}>
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.6, color: 'var(--ac, #B8552F)' }}>{selRes.code}</div>
              <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 24, marginTop: 4 }}>{selRes.guest}</div>
              <div style={{ fontSize: 13, color: '#8A7A63', marginTop: 3 }}>{selRes.roomLine}</div>
            </div>
            <div style={{ flex: 'none', textAlign: 'right' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#8A7A63' }}>TARJETAS EMITIDAS</div>
              <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 28, marginTop: 2, color: selRes.cardCountColor }}>{selRes.cardCount}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10, marginTop: 16 }}>
            {[
              ['ESTANCIA', selRes.dates],
              ['NOCHES', selRes.nights],
              ['HUÉSPEDES', selRes.n],
            ].map(([label, val]) => (
              <div key={label} style={{ border: '1px solid #EDE3CF', borderRadius: 13, padding: '11px 13px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: '#8A7A63' }}>{label}</div>
                <div style={{ fontSize: 13, fontWeight: 700, marginTop: 3 }}>{val}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: '#8A7A63' }}>PAQUETES CONTRATADOS</div>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 8 }}>
              {selRes.pkgChips.map((p, i) => (
                <div key={i} style={{
                  padding: '6px 12px', borderRadius: 999,
                  background: '#F1E7D2', fontSize: 11.5, fontWeight: 700, color: '#6B5335',
                }}>{p}</div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onStartCardFlow(selRes, room)}
            style={{
              width: '100%', marginTop: 20, padding: 16, border: 'none', borderRadius: 14,
              background: 'var(--ac, #B8552F)', color: '#FBF6EA',
              fontFamily: 'Karla, sans-serif', fontSize: 15, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: '0 10px 24px rgba(184,85,47,.3)',
              transition: 'transform .15s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = ''}
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <rect x="3" y="6" width="18" height="13" rx="2.5" />
              <path d="M3 10.5h18M7 15.5h4" />
            </svg>
            {selRes.btnLabel}
          </button>
          <div style={{ fontSize: 11.5, color: '#9A8A70', textAlign: 'center', marginTop: 10 }}>
            Usa el codificador conectado al equipo · las tarjetas expiran al hacer check-out
          </div>
        </div>
      </div>
    </div>
  );
}
