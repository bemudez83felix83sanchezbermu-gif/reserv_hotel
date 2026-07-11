import { useState, useEffect } from 'react';
import ImageSlot from '../../shared/ui/ImageSlot.jsx';
import { SWATCHES } from '../../data/mockData.js';

const CARD = { background: '#FFFDF7', border: '1px solid #EDE3CF' };
const INPUT = {
  width: '100%', boxSizing: 'border-box', padding: '12px 14px',
  border: '1px solid #E4D8C0', borderRadius: 12, background: '#FDFBF4',
  fontSize: 14.5, color: '#2E2418', outline: 'none',
};

export default function Configuracion({ config, setConfig, structure, setStructure }) {
  const [draft, setDraft] = useState(config);
  const [toast, setToast] = useState(false);

  useEffect(() => { setDraft(config); }, [config]);

  const previewAccent = draft.accent;

  const onSave = () => {
    setConfig(draft);
    setToast(true);
    setTimeout(() => setToast(false), 2600);
  };

  const modeStyle = (on) => ({
    border: '1.5px solid ' + (on ? 'var(--ac, #B8552F)' : '#E4D8C0'),
    background: on ? '#F8EDE4' : '#FDFBF4',
  });

  const structIsEdif = structure.mode === 'edificios';
  const applyLB = (b, n) => (b.letter ? (b.letterPos === 'suf' ? String(n) + b.letter : String(b.letter) + n) : String(n));

  const upd = (bId, patch) =>
    setStructure({ ...structure, buildings: structure.buildings.map((x) => (x.id === bId ? { ...x, ...patch } : x)) });

  return (
    <div style={{ padding: '30px 34px 44px', animation: 'fadeIn .35s ease both' }}>
      <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 29 }}>Configuración del hotel</div>
      <div style={{ fontSize: 13.5, color: '#8A7A63', marginTop: 4 }}>
        Estancia es adaptable: personaliza la marca y se aplica al instante en la app del huésped
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(280px, 360px)', gap: 16, marginTop: 20, alignItems: 'start' }}>
        <div style={{ ...CARD, borderRadius: 20, padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '96px 1fr', gap: 18, alignItems: 'center' }}>
            <ImageSlot id="logo-hotel" shape="circle" placeholder="Logo" style={{ width: 96, height: 96 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.4, color: '#8A7A63', marginBottom: 6 }}>NOMBRE DEL HOTEL</div>
                <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} style={{ ...INPUT, fontWeight: 600 }} />
              </div>
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.4, color: '#8A7A63', marginBottom: 6 }}>LEMA</div>
                <input value={draft.tagline} onChange={(e) => setDraft({ ...draft, tagline: e.target.value })} style={INPUT} />
              </div>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.4, color: '#8A7A63', marginBottom: 10 }}>COLOR DE ACENTO</div>
            <div style={{ display: 'flex', gap: 12 }}>
              {SWATCHES.map(([c, label]) => {
                const on = draft.accent === c;
                return (
                  <div key={c} onClick={() => setDraft({ ...draft, accent: c })} title={label} style={{
                    width: 52, height: 52, borderRadius: 16, background: c, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: on ? `0 0 0 3px #FFFDF7, 0 0 0 5.5px ${c}` : '0 2px 8px rgba(62,44,22,.18)',
                    transition: 'transform .15s ease',
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.07)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = ''}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FBF6EA" strokeWidth="3" strokeLinecap="round" style={{ opacity: on ? 1 : 0 }}>
                      <path d="M5 13l5 5L20 7" />
                    </svg>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 24, paddingTop: 18, borderTop: '1px dashed #E9DFCC' }}>
            <button onClick={onSave} style={{
              padding: '13px 24px', border: 'none', borderRadius: 12,
              background: 'var(--ac, #B8552F)', color: '#FBF6EA',
              fontFamily: 'Karla, sans-serif', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 8px 18px rgba(184,85,47,.28)',
            }}>Guardar cambios</button>
            <div style={{
              fontSize: 12.5, color: '#6F7D5C', fontWeight: 700,
              opacity: toast ? 1 : 0, transition: 'opacity .3s ease',
            }}>✓ Guardado — la app del huésped ya lo refleja</div>
          </div>
        </div>

        {/* Preview */}
        <div style={{ background: '#2E2418', borderRadius: 20, padding: 20 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.6, color: '#C99B4E' }}>VISTA PREVIA · APP DEL HUÉSPED</div>
          <div style={{ background: '#F7F1E6', borderRadius: 18, overflow: 'hidden', marginTop: 14, boxShadow: '0 16px 34px rgba(0,0,0,.35)' }}>
            <div style={{ position: 'relative', height: 130, background: 'linear-gradient(160deg, #4A3323, #2E2418)' }}>
              <div style={{ position: 'absolute', left: 16, bottom: 12, color: '#FBF6EA' }}>
                <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1.8, opacity: 0.8 }}>HOTEL BOUTIQUE</div>
                <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 20, marginTop: 3 }}>{draft.name}</div>
                <div style={{ fontSize: 10, fontStyle: 'italic', opacity: 0.75, marginTop: 2 }}>{draft.tagline}</div>
              </div>
            </div>
            <div style={{ padding: 14 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {[['LLEGADA', '10 jul'], ['SALIDA', '13 jul']].map(([l, v]) => (
                  <div key={l} style={{ flex: 1, border: '1px solid #E9DFCC', borderRadius: 9, padding: '7px 9px' }}>
                    <div style={{ fontSize: 7.5, fontWeight: 700, letterSpacing: 1, color: '#8A7A63' }}>{l}</div>
                    <div style={{ fontSize: 10.5, fontWeight: 700, marginTop: 2 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{
                marginTop: 9, padding: 11, borderRadius: 10,
                background: previewAccent, color: '#FBF6EA',
                fontSize: 11, fontWeight: 700, textAlign: 'center',
                transition: 'background .25s ease',
              }}>Ver disponibilidad →</div>
            </div>
          </div>
          <div style={{ fontSize: 11.5, color: 'rgba(239,230,210,.6)', lineHeight: 1.6, marginTop: 14 }}>
            El mismo sistema sirve a cualquier hotel: cambia nombre, logo y color sin tocar código.
          </div>
        </div>
      </div>

      {/* Structure */}
      <div style={{ ...CARD, borderRadius: 20, padding: 24, marginTop: 16 }}>
        <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 19 }}>Estructura del hotel</div>
        <div style={{ fontSize: 13, color: '#8A7A63', marginTop: 4 }}>
          Define cómo se visualiza la ocupación en Reservaciones · se guarda automáticamente
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginTop: 16, maxWidth: 640 }}>
          <div onClick={() => setStructure({ ...structure, mode: 'edificios' })} style={{
            ...modeStyle(structIsEdif), borderRadius: 15, padding: 15, cursor: 'pointer',
            transition: 'all .15s ease',
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#7A5A38" strokeWidth="1.6" strokeLinecap="round">
              <path d="M3 21h18M5 21V5.5L10 3v18M14 21V8l5 1.5V21" />
              <path d="M7 7.5h.01M7 10.5h.01M7 13.5h.01M7 16.5h.01" />
            </svg>
            <div style={{ fontSize: 14, fontWeight: 700, marginTop: 8 }}>Por edificios</div>
            <div style={{ fontSize: 12, color: '#6B5D4A', marginTop: 3, lineHeight: 1.5 }}>
              Varios edificios o torres, cada uno con sus habitaciones.
            </div>
          </div>
          <div onClick={() => setStructure({ ...structure, mode: 'plano' })} style={{
            ...modeStyle(!structIsEdif), borderRadius: 15, padding: 15, cursor: 'pointer',
            transition: 'all .15s ease',
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#7A5A38" strokeWidth="1.6" strokeLinecap="round">
              <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
              <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
              <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
              <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
            </svg>
            <div style={{ fontSize: 14, fontWeight: 700, marginTop: 8 }}>Lista única</div>
            <div style={{ fontSize: 12, color: '#6B5D4A', marginTop: 3, lineHeight: 1.5 }}>
              Un solo conjunto con un número determinado de habitaciones.
            </div>
          </div>
        </div>

        {structIsEdif ? (
          <div style={{ marginTop: 16, maxWidth: 640 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {structure.buildings.map((b) => {
                const suf = b.letterPos === 'suf';
                const segOn  = { background: '#2E2418', color: '#FBF6EA' };
                const segOff = { background: '#FFFDF7', color: '#6B5D4A' };
                return (
                  <div key={b.id} style={{ border: '1px solid #EDE3CF', borderRadius: 14, padding: 12, background: '#FDFBF4' }}>
                    <div style={{ display: 'flex', gap: 9, alignItems: 'center' }}>
                      <input value={b.name} onChange={(e) => upd(b.id, { name: e.target.value })} style={{
                        flex: 1, minWidth: 0, padding: '10px 13px',
                        border: '1px solid #E4D8C0', borderRadius: 11, background: '#FFFDF7',
                        fontSize: 13.5, fontWeight: 600, outline: 'none',
                      }} />
                      <span style={{
                        fontSize: 11.5, color: '#3F6E4C', fontWeight: 700, flex: 'none',
                        background: '#EAF2E6', borderRadius: 999, padding: '6px 11px',
                      }}>{applyLB(b, b.start)} – {applyLB(b, b.end)} · {b.end - b.start + 1} hab.</span>
                      <button onClick={() => setStructure({ ...structure, buildings: structure.buildings.filter((x) => x.id !== b.id) })}
                        style={{
                          width: 34, height: 34, borderRadius: '50%',
                          border: '1px solid #E3B8AC', background: 'transparent',
                          color: '#A8442C', cursor: 'pointer', fontSize: 13, flex: 'none',
                        }}>✕</button>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, color: '#8A7A63' }}>NUMERACIÓN</span>
                      <span style={{ fontSize: 12, color: '#6B5D4A' }}>del</span>
                      <input type="number" value={b.start} onChange={(e) => {
                        const v = Math.max(1, Math.min(9998, Number(e.target.value) || 1));
                        upd(b.id, { start: v, end: Math.min(Math.max(v, b.end), v + 399) });
                      }} style={{
                        width: 76, boxSizing: 'border-box', padding: '9px 11px',
                        border: '1px solid #E4D8C0', borderRadius: 10, background: '#FFFDF7',
                        fontSize: 13, outline: 'none',
                      }} />
                      <span style={{ fontSize: 12, color: '#6B5D4A' }}>al</span>
                      <input type="number" value={b.end} onChange={(e) => {
                        const v = Math.max(b.start, Math.min(b.start + 399, Number(e.target.value) || b.start));
                        upd(b.id, { end: v });
                      }} style={{
                        width: 76, boxSizing: 'border-box', padding: '9px 11px',
                        border: '1px solid #E4D8C0', borderRadius: 10, background: '#FFFDF7',
                        fontSize: 13, outline: 'none',
                      }} />
                      <span style={{ width: 1, height: 22, background: '#E4D8C0', margin: '0 4px' }} />
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, color: '#8A7A63' }}>LETRA</span>
                      <input value={b.letter || ''} onChange={(e) => upd(b.id, { letter: (e.target.value || '').replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2) })}
                        maxLength={2} placeholder="—" style={{
                          width: 46, boxSizing: 'border-box', padding: '9px 6px',
                          border: '1px solid #E4D8C0', borderRadius: 10, background: '#FFFDF7',
                          fontSize: 13, fontWeight: 700, textAlign: 'center', outline: 'none',
                        }} />
                      <div style={{ display: 'flex', background: '#EDE4D1', borderRadius: 10, padding: 2, gap: 2 }}>
                        <button onClick={() => upd(b.id, { letterPos: 'pre' })} title="Letra antes del número" style={{
                          padding: '7px 12px', border: 'none', borderRadius: 8,
                          ...(suf ? segOff : segOn),
                          fontFamily: 'Karla, sans-serif', fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
                        }}>{(b.letter || 'A') + b.start}</button>
                        <button onClick={() => upd(b.id, { letterPos: 'suf' })} title="Letra después del número" style={{
                          padding: '7px 12px', border: 'none', borderRadius: 8,
                          ...(suf ? segOn : segOff),
                          fontFamily: 'Karla, sans-serif', fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
                        }}>{b.start + (b.letter || 'A')}</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => setStructure({
                ...structure,
                buildings: [...structure.buildings, { id: 'b' + Date.now(), name: 'Edificio ' + (structure.buildings.length + 1), start: 101, end: 130, letter: '', letterPos: 'pre' }],
              })}
              style={{
                marginTop: 11, padding: '10px 16px',
                border: '1.5px dashed #C9B788', borderRadius: 11,
                background: 'transparent', color: '#6B5335',
                fontFamily: 'Karla, sans-serif', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#F4EBD9'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >+ Agregar edificio</button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16 }}>
            <input type="number" value={structure.flatCount}
              onChange={(e) => setStructure({ ...structure, flatCount: Math.max(1, Math.min(400, Number(e.target.value) || 1)) })}
              style={{
                width: 110, boxSizing: 'border-box', padding: '11px 13px',
                border: '1px solid #E4D8C0', borderRadius: 11, background: '#FDFBF4',
                fontSize: 13.5, outline: 'none',
              }}
            />
            <span style={{ fontSize: 13, color: '#6B5D4A', fontWeight: 700 }}>habitaciones en total</span>
          </div>
        )}
      </div>
    </div>
  );
}
