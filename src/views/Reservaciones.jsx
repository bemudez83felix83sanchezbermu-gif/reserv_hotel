import { useMemo, useState } from 'react';
import { RESERVATIONS, TODAY_ISO, GUEST_POOL } from '../data/mockData.js';
import { STATE_COLORS, dAbsOf, fmtAbs, roomsOf, roomLabel } from '../utils/helpers.js';

const CARD = { background: '#FFFDF7', border: '1px solid #EDE3CF', borderRadius: 18 };
const CHART_WDS = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

const buildingsFromStructure = (s) => {
  if (s.mode === 'plano') {
    return [{
      id: 'flat', name: 'Habitaciones del hotel',
      start: 101, end: 100 + Math.max(1, Math.min(400, Number(s.flatCount) || 1)),
      letter: '', letterPos: 'pre',
    }];
  }
  return s.buildings.map((b) => {
    const start = Math.max(1, Number(b.start) || 101);
    const end = Math.max(start, Math.min(start + 399, Number(b.end) || start));
    return { ...b, start, end };
  });
};

const applyL = (b, n) => (b.letter ? (b.letterPos === 'suf' ? String(n) + b.letter : b.letter + n) : String(n));

export default function Reservaciones({ structure, rooms, onGoConfig }) {
  const [viewMode, setViewMode] = useState('mapa');
  const [mapDate, setMapDate] = useState(TODAY_ISO);
  const [selBuilding, setSelBuilding] = useState(null);
  const [selRoomNum, setSelRoomNum] = useState(null);

  const builds = useMemo(() => buildingsFromStructure(structure), [structure]);
  const dAbs = dAbsOf(mapDate || TODAY_ISO);
  const todayAbs = dAbsOf(TODAY_ISO);
  const selB = builds.find((b) => b.id === selBuilding) || builds[0];
  const selRooms = selB ? roomsOf(selB, dAbs) : [];

  const shiftMapDate = (n) => {
    const cur = Date.parse((mapDate || TODAY_ISO) + 'T12:00:00') + n * 86400000;
    setMapDate(new Date(cur).toISOString().slice(0, 10));
    setSelRoomNum(null);
  };
  const mapDateObj = new Date((mapDate || TODAY_ISO) + 'T12:00:00');
  const mapDateLabel = mapDateObj.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
  const isToday = dAbs === todayAbs;

  const seg = (on) => ({
    background: on ? '#FFFDF7' : 'transparent',
    color: on ? '#2E2418' : '#6B5D4A',
    boxShadow: on ? '0 2px 6px rgba(62,44,22,.12)' : 'none',
  });

  // Departures within 7 days for the selected building
  const depGroups = useMemo(() => {
    const map = {};
    selRooms.forEach((r) => {
      if (r.st === 'ocupada' && r.saleAbs > dAbs && r.saleAbs <= dAbs + 7) {
        (map[r.saleAbs] = map[r.saleAbs] || []).push(r);
      }
    });
    const types = rooms.map((r) => r.type || r.name).filter(Boolean);
    const typeOf = (h) => (types.length ? types[(h >>> 6) % types.length] : 'Habitación');
    return Object.keys(map)
      .map(Number)
      .sort((a, b) => a - b)
      .map((a) => {
        const t = new Date(a * 86400000 + 43200000);
        const items = map[a]
          .sort((x, y) => x.num - y.num)
          .map((r) => ({
            label: r.label, type: typeOf(r.h),
            tip: `Hab. ${r.label} · ${typeOf(r.h)} · se desocupa el ${fmtAbs(a)}`,
          }));
        const rel = a === dAbs + 1 ? 'Mañana' : `En ${a - dAbs} días`;
        return {
          key: a, day: t.getDate(), wd: CHART_WDS[t.getDay()],
          label: `${rel} · ${items.length} ${items.length === 1 ? 'habitación se desocupa' : 'habitaciones se desocupan'}`,
          items,
        };
      });
  }, [selRooms, dAbs, rooms]);
  const depCount = depGroups.reduce((s, g) => s + g.items.length, 0);

  const selRoom = selRooms.find((r) => r.num === selRoomNum);
  const sc = selRoom ? STATE_COLORS[selRoom.st] : null;
  const selGuest = selRoom ? GUEST_POOL[selRoom.h % GUEST_POOL.length] : '';
  const nFree = selRooms.filter((r) => r.st === 'libre').length;

  // ────── Timeline chart
  const wdJul = (d) => ['D', 'L', 'M', 'X', 'J', 'V', 'S'][(2 + d) % 7];
  const chartDays = Array.from({ length: 31 }, (_, i) => {
    const d = i + 1;
    const today = d === 5;
    return {
      n: d, wd: wdJul(d), gc: d + 1 + ' / ' + (d + 2),
      bg: today ? 'var(--ac, #B8552F)' : 'transparent',
      fg: today ? '#FBF6EA' : '#6B5D4A',
    };
  });
  const chartRows = rooms.map((r, i) => ({
    key: r.id, name: r.name, sub: r.num === 'Casa' ? 'Villa' : 'Hab. ' + r.num, gr: String(i + 2),
  }));
  const statusStyle = {
    'en-casa': { bg: '#6F7D5C', fg: '#F4F1E6' },
    'llega-hoy': { bg: 'var(--ac, #B8552F)', fg: '#FBF6EA' },
    confirmada: { bg: '#E4D5B8', fg: '#5C4A2E' },
  };
  const chartBars = RESERVATIONS
    .map((b) => {
      const ri = rooms.findIndex((r) => r.id === b.roomId);
      if (ri < 0) return null;
      const s = statusStyle[b.status] || statusStyle.confirmada;
      return {
        key: b.code, guest: b.guest,
        gr: String(ri + 2), gc: b.start + 1 + ' / ' + (b.end + 1),
        bg: s.bg, fg: s.fg,
        tip: `${b.guest} · ${roomLabel(rooms, b.roomId)} · ${b.start}–${b.end} jul · ${b.n} huéspedes`,
      };
    })
    .filter(Boolean);

  return (
    <div style={{ padding: '30px 34px 44px', animation: 'fadeIn .35s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 29 }}>Reservaciones</div>
          <div style={{ fontSize: 13.5, color: '#8A7A63', marginTop: 4 }}>
            Mapa de ocupación por edificio · hoy, domingo 5 de julio
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: '#EDE4D1', borderRadius: 12, padding: 3, gap: 2 }}>
            <button onClick={() => setViewMode('mapa')} style={{
              padding: '8px 16px', border: 'none', borderRadius: 10,
              ...seg(viewMode !== 'crono'),
              fontFamily: 'Karla, sans-serif', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
              transition: 'all .15s ease',
            }}>Mapa de ocupación</button>
            <button onClick={() => setViewMode('crono')} style={{
              padding: '8px 16px', border: 'none', borderRadius: 10,
              ...seg(viewMode === 'crono'),
              fontFamily: 'Karla, sans-serif', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
              transition: 'all .15s ease',
            }}>Cronograma</button>
          </div>
          {viewMode === 'crono' && (
            <div style={{ display: 'flex', gap: 12, fontSize: 11.5, color: '#6B5D4A', fontWeight: 700 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: '#6F7D5C' }} />En casa
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--ac, #B8552F)' }} />Llega hoy
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: '#E4D5B8' }} />Confirmada
              </span>
            </div>
          )}
          <div style={{
            background: '#2E2418', color: '#FBF6EA', borderRadius: 999,
            padding: '8px 18px', fontSize: 13, fontWeight: 700,
          }}>Julio 2026</div>
        </div>
      </div>

      {viewMode === 'mapa' ? (
        <div>
          {/* Date picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.4, color: '#8A7A63' }}>DISPONIBILIDAD PARA</div>
            <div style={{ display: 'flex', alignItems: 'center', ...CARD, padding: 3 }}>
              <button onClick={() => shiftMapDate(-1)} style={{
                width: 32, height: 32, border: 'none', background: 'transparent',
                borderRadius: 9, cursor: 'pointer', color: '#6B5D4A', fontSize: 15, fontWeight: 700,
              }}>‹</button>
              <input type="date" value={mapDate}
                onChange={(e) => { setMapDate(e.target.value || TODAY_ISO); setSelRoomNum(null); }}
                style={{ border: 'none', background: 'transparent', fontFamily: 'Karla, sans-serif', fontSize: 13.5, fontWeight: 700, color: '#2E2418', outline: 'none', padding: '0 4px' }}
              />
              <button onClick={() => shiftMapDate(1)} style={{
                width: 32, height: 32, border: 'none', background: 'transparent',
                borderRadius: 9, cursor: 'pointer', color: '#6B5D4A', fontSize: 15, fontWeight: 700,
              }}>›</button>
            </div>
            <button onClick={() => { setMapDate(TODAY_ISO); setSelRoomNum(null); }} style={{
              padding: '9px 16px', borderRadius: 999,
              border: '1px solid ' + (isToday ? '#2E2418' : '#E4D8C0'),
              background: isToday ? '#2E2418' : '#FFFDF7',
              color: isToday ? '#FBF6EA' : '#6B5D4A',
              fontFamily: 'Karla, sans-serif', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              transition: 'all .15s ease',
            }}>Hoy</button>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ac, #B8552F)', textTransform: 'capitalize' }}>{mapDateLabel}</div>
            <div style={{ flex: 1 }} />
            <button onClick={onGoConfig} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '9px 15px',
              border: '1px solid #DACBAE', borderRadius: 999, background: 'transparent',
              color: '#6B5335', fontFamily: 'Karla, sans-serif', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M4 8h10M18 8h2M4 16h2M10 16h10" />
                <circle cx="16" cy="8" r="2.4" />
                <circle cx="8" cy="16" r="2.4" />
              </svg>
              Configurar edificios y habitaciones
            </button>
          </div>

          {/* Building cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginTop: 14 }}>
            {builds.map((b, i) => {
              const on = selB && b.id === selB.id;
              const rms = roomsOf(b, dAbs);
              const cnt = { libre: 0, ocupada: 0, pendiente: 0 };
              rms.forEach((r) => cnt[r.st]++);
              const winds = rms.slice(0, 18).map((r) => STATE_COLORS[r.st].dot);
              return (
                <div
                  key={b.id}
                  onClick={() => { setSelBuilding(b.id); setSelRoomNum(null); }}
                  style={{
                    background: '#FFFDF7',
                    border: '1.5px solid ' + (on ? 'var(--ac, #B8552F)' : '#EDE3CF'),
                    borderRadius: 18, padding: 16, cursor: 'pointer',
                    boxShadow: on ? '0 10px 24px rgba(62,44,22,.14)' : 'none',
                    transition: 'all .18s ease',
                    animation: `fadeUp .45s ${(0.05 + i * 0.07).toFixed(2)}s both`,
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = ''}
                >
                  <div style={{
                    border: '1px solid #E4D8C0', borderBottom: '4px solid #D8CCB2',
                    borderRadius: '10px 10px 4px 4px',
                    background: 'linear-gradient(180deg, #FBF6EA, #F1E7D2)',
                    padding: '12px 14px 0',
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 5 }}>
                      {winds.map((c, wi) => (
                        <div key={wi} style={{ height: 11, borderRadius: 2.5, background: c, opacity: 0.9 }} />
                      ))}
                    </div>
                    <div style={{ width: 24, height: 15, background: '#8A7A63', borderRadius: '7px 7px 0 0', margin: '10px auto 0' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 12 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 700 }}>{b.name}</div>
                    <div style={{ fontSize: 11, color: '#8A7A63' }}>
                      {rms.length} hab. · {rms.length ? rms[0].label + '–' + rms[rms.length - 1].label : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 8, fontSize: 11.5, fontWeight: 700 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#3F6E4C' }}>
                      <span style={{ width: 8, height: 8, borderRadius: 99, background: '#4C8A5C' }} />{cnt.libre}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#93402D' }}>
                      <span style={{ width: 8, height: 8, borderRadius: 99, background: '#C0503C' }} />{cnt.ocupada}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#8A6420' }}>
                      <span style={{ width: 8, height: 8, borderRadius: 99, background: '#D9A13B' }} />{cnt.pendiente}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Room grid */}
          <div style={{ ...CARD, padding: 20, marginTop: 14, animation: 'fadeUp .45s .15s both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 18 }}>{selB?.name || ''}</div>
                <div style={{ fontSize: 12, color: '#8A7A63', marginTop: 3 }}>
                  {selB ? `${selRooms.length} habitaciones · ${nFree} disponibles · ${mapDateLabel}` : ''}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 11.5, color: '#6B5D4A', fontWeight: 700, flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: '#4C8A5C' }} />Disponible
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: '#C0503C' }} />Ocupada
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: '#D9A13B' }} />Pendiente
                </span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(56px, 1fr))', gap: 8, marginTop: 16 }}>
              {selRooms.map((r) => {
                const c = STATE_COLORS[r.st];
                const on = selRoomNum === r.num;
                const guest = GUEST_POOL[r.h % GUEST_POOL.length];
                const tip = 'Hab. ' + r.label + ' · ' + c.label +
                  (r.st === 'ocupada' ? ' · ' + guest + ' · sale el ' + fmtAbs(r.saleAbs)
                    : r.st === 'pendiente' ? ' · ' + guest + ' · confirma antes del ' + fmtAbs(r.nextAbs)
                      : ' · libre hasta el ' + fmtAbs(r.nextAbs));
                return (
                  <div key={r.num} onClick={() => setSelRoomNum(r.num)} title={tip}
                    style={{
                      border: '1.5px solid ' + (on ? 'var(--ac, #B8552F)' : c.bd),
                      background: c.bg, color: c.fg, borderRadius: 11,
                      padding: '8px 4px 7px', textAlign: 'center',
                      fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
                      boxShadow: on ? '0 0 0 2.5px var(--ac, #B8552F)' : 'none',
                      transition: 'transform .12s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = ''}
                  >
                    {r.label}
                    <div style={{ width: 6, height: 6, borderRadius: 99, background: c.dot, margin: '4px auto 0' }} />
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, padding: '12px 15px', borderRadius: 13, background: '#F4EFE3', flexWrap: 'wrap' }}>
              <span style={{ width: 10, height: 10, borderRadius: 99, background: selRoom ? sc.dot : '#B3A386', flex: 'none' }} />
              <span style={{ fontSize: 13, fontWeight: 700, flex: 'none' }}>
                {selRoom ? `Hab. ${selRoom.label} — ${sc.label}` : 'Selecciona una habitación'}
              </span>
              <span style={{ fontSize: 12.5, color: '#6B5D4A' }}>
                {selRoom
                  ? selRoom.st === 'ocupada'
                    ? `${selGuest} · sale el ${fmtAbs(selRoom.saleAbs)}`
                    : selRoom.st === 'pendiente'
                      ? `Reserva de ${selGuest} por confirmar · se libera el ${fmtAbs(selRoom.nextAbs)}`
                      : `Disponible hasta el ${fmtAbs(selRoom.nextAbs)} · lista para asignar`
                  : 'Haz clic en cualquier habitación para ver su estado en la fecha elegida.'}
              </span>
            </div>
          </div>

          {/* Upcoming departures */}
          <div style={{ ...CARD, padding: 20, marginTop: 14, animation: 'fadeUp .45s .2s both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 18 }}>Próximas salidas</div>
                <div style={{ fontSize: 12, color: '#8A7A63', marginTop: 3 }}>
                  Próximos 7 días · {selB?.name || ''}
                </div>
              </div>
              <div style={{
                fontSize: 11.5, fontWeight: 700, color: '#3F6E4C',
                background: '#EAF2E6', borderRadius: 999, padding: '6px 12px',
              }}>{depCount + (depCount === 1 ? ' salida' : ' salidas')}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', marginTop: 8 }}>
              {depGroups.map((g) => (
                <div key={g.key} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: '13px 0', borderTop: '1px dashed #E9DFCC' }}>
                  <div style={{
                    flex: 'none', width: 64, textAlign: 'center',
                    background: '#F4EFE3', borderRadius: 12, padding: '8px 4px',
                  }}>
                    <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 20, lineHeight: 1 }}>{g.day}</div>
                    <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 1, color: '#8A7A63', marginTop: 3 }}>{g.wd}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: '#4A3D2C' }}>{g.label}</div>
                    <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 8 }}>
                      {g.items.map((it, ii) => (
                        <div key={ii} title={it.tip} style={{
                          display: 'flex', alignItems: 'center', gap: 7,
                          border: '1px solid #E4D8C0', background: '#FDFBF4',
                          borderRadius: 999, padding: '6px 12px',
                          fontSize: 11.5, fontWeight: 700, color: '#4A3D2C',
                        }}>
                          <span style={{ width: 7, height: 7, borderRadius: 99, background: '#C0503C', flex: 'none' }} />
                          Hab. {it.label}
                          <span style={{ color: '#8A7A63', fontWeight: 600 }}>· {it.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              {depGroups.length === 0 && (
                <div style={{ fontSize: 12.5, color: '#8A7A63', padding: '10px 0 2px' }}>
                  No hay salidas programadas en los próximos 7 días para este edificio.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div style={{ ...CARD, padding: 18, marginTop: 20, overflowX: 'auto', animation: 'fadeUp .5s .1s both' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '150px repeat(31, minmax(24px, 1fr))', minWidth: 1000, position: 'relative' }}>
              <div style={{ gridRow: 1, gridColumn: 1, fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, color: '#8A7A63', padding: '6px 8px 10px 4px' }}>HABITACIÓN</div>
              {chartDays.map((d) => (
                <div key={d.n} style={{ gridRow: 1, gridColumn: d.gc, textAlign: 'center', paddingBottom: 8 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#B3A386' }}>{d.wd}</div>
                  <div style={{
                    width: 22, height: 22, margin: '2px auto 0', borderRadius: 99,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, background: d.bg, color: d.fg,
                  }}>{d.n}</div>
                </div>
              ))}
              {chartRows.map((row) => (
                <div key={'r-' + row.key} style={{ display: 'contents' }}>
                  <div style={{
                    gridColumn: 1, gridRow: row.gr,
                    display: 'flex', flexDirection: 'column', justifyContent: 'center',
                    padding: '4px 8px 4px 4px', borderTop: '1px solid #F0E8D6', minHeight: 46,
                  }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.name}</div>
                    <div style={{ fontSize: 10.5, color: '#8A7A63' }}>{row.sub}</div>
                  </div>
                  <div style={{
                    gridColumn: '2 / -1', gridRow: row.gr,
                    borderTop: '1px solid #F0E8D6',
                    backgroundImage: 'linear-gradient(90deg, #F2EADA 1px, transparent 1px)',
                    backgroundSize: 'calc(100%/31) 100%',
                  }} />
                </div>
              ))}
              <div style={{
                gridColumn: '6 / 7', gridRow: '1 / ' + (rooms.length + 2),
                background: 'rgba(184,85,47,.05)', borderLeft: '1.5px dashed var(--ac, #B8552F)',
                pointerEvents: 'none',
              }} />
              {chartBars.map((bar) => (
                <div key={bar.key} title={bar.tip} style={{
                  gridRow: bar.gr, gridColumn: bar.gc, zIndex: 2, margin: '8px 2px',
                  background: bar.bg, color: bar.fg, borderRadius: 9,
                  padding: '4px 9px', fontSize: 11, fontWeight: 700,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  display: 'flex', alignItems: 'center', cursor: 'default',
                  boxShadow: '0 2px 6px rgba(62,44,22,.12)', transition: 'transform .15s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1.5px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = ''}
                >{bar.guest}</div>
              ))}
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#9A8A70', marginTop: 12 }}>
            Pasa el cursor sobre una barra para ver el detalle. La línea punteada marca hoy, domingo 5.
          </div>
        </>
      )}
    </div>
  );
}
