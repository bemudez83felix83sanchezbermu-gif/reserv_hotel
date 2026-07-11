import { initials } from '../../shared/utils/helpers.js';

export default function CardModal({ phase, selRes, room, config, onClose, onAgain }) {
  if (!phase) return null;
  const monogram = initials(config.name || 'Casa');
  const habShort = room ? (room.num === 'Casa' ? 'CASA' : 'HAB ' + room.num) : '';

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(24,17,9,.68)', backdropFilter: 'blur(7px)', zIndex: 70,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 30, animation: 'fadeIn .25s ease both',
    }}>
      <div style={{
        background: '#FFFDF7', borderRadius: 24, width: 460, maxWidth: '100%',
        padding: 26, animation: 'pop .3s cubic-bezier(.2,.7,.2,1) both',
        textAlign: 'center', position: 'relative',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16,
          width: 34, height: 34, borderRadius: '50%',
          border: '1px solid #E4D8C0', background: 'transparent',
          fontSize: 15, cursor: 'pointer', color: '#6B5D4A',
        }}>✕</button>
        <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 2, color: '#8A7A63' }}>
          CODIFICADOR DE TARJETAS · {selRes.code}
        </div>

        {phase === 'search' && (
          <div style={{ padding: '26px 0 8px' }}>
            <div style={{ position: 'relative', width: 170, height: 170, margin: '0 auto' }}>
              {[0, 0.55, 1.1].map((d) => (
                <div key={d} style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  border: '2px solid var(--ac, #B8552F)',
                  animation: `pulseRing 1.7s ease-out ${d}s infinite`,
                }} />
              ))}
              <div style={{
                position: 'absolute', inset: 38, borderRadius: '50%',
                background: '#F1E7D2', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#7A5A38" strokeWidth="1.6" strokeLinecap="round">
                  <path d="M12 21V7M12 7l-3.5 3M12 7l3.5 2.2" />
                  <circle cx="12" cy="4.2" r="1.6" />
                  <path d="M8.5 10a1.4 1.4 0 1 0 0 .01M15.5 9.2l1.8-.5v2" />
                </svg>
              </div>
            </div>
            <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 21, marginTop: 20 }}>Buscando codificador…</div>
            <div style={{ fontSize: 13, color: '#8A7A63', marginTop: 6 }}>
              Verificando dispositivos USB conectados al equipo
            </div>
          </div>
        )}

        {phase === 'found' && (
          <div style={{ padding: '18px 0 8px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#EAF0E2', borderRadius: 999, padding: '7px 14px',
              fontSize: 12, fontWeight: 700, color: '#4E6238',
              animation: 'fadeUp .4s both',
            }}>
              <span style={{ width: 8, height: 8, borderRadius: 99, background: '#6F9B4E' }} />
              Codificador NFC · USB-C · listo
            </div>
            <div style={{ position: 'relative', height: 210, marginTop: 10 }}>
              <div style={{
                position: 'absolute', left: '50%', top: 8, transform: 'translateX(-50%)',
                width: 190, height: 118, borderRadius: 16,
                background: 'linear-gradient(135deg, #4A3323, #2B1F13)',
                boxShadow: '0 18px 34px rgba(43,31,19,.4)',
                animation: 'floatY 2.2s ease-in-out infinite',
                zIndex: 2, padding: 14, boxSizing: 'border-box', textAlign: 'left',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%',
                    border: '1px solid rgba(239,230,210,.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Marcellus, Georgia, serif', fontSize: 12, color: '#EFE6D2',
                  }}>{monogram}</div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C99B4E" strokeWidth="1.7" strokeLinecap="round">
                    <path d="M6 8.5a8.5 8.5 0 0 1 12 0M8.5 11.5a4.5 4.5 0 0 1 7 0" />
                    <circle cx="12" cy="15" r="1.3" fill="#C99B4E" stroke="none" />
                  </svg>
                </div>
                <div style={{ width: 30, height: 22, borderRadius: 5, background: 'linear-gradient(135deg, #D9B36B, #B98D45)', marginTop: 12 }} />
                <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: 1.6, color: 'rgba(239,230,210,.65)', marginTop: 10 }}>
                  TARJETA LLAVE · {habShort}
                </div>
              </div>
              <div style={{
                position: 'absolute', left: '50%', bottom: 0, transform: 'translateX(-50%)',
                width: 230, height: 64, borderRadius: 15,
                background: '#EFE6D2', border: '1px solid #DFD3B8',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              }}>
                <span style={{ width: 9, height: 9, borderRadius: 99, background: '#4E8ACB', animation: 'blinkLED 1.1s ease infinite' }} />
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.4, color: '#7A6A4E' }}>LECTOR NFC</span>
              </div>
              <div style={{
                position: 'absolute', left: '50%', bottom: 56, transform: 'translateX(-50%)',
                width: 110, height: 110, borderRadius: '50%',
                border: '1.5px solid rgba(78,138,203,.5)',
                animation: 'pulseRing 1.6s ease-out infinite', pointerEvents: 'none',
              }} />
            </div>
            <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 21, marginTop: 8 }}>Acerca la tarjeta al lector</div>
            <div style={{ fontSize: 13, color: '#8A7A63', marginTop: 6 }}>
              Coloca la tarjeta sobre el codificador sin retirarla
            </div>
          </div>
        )}

        {phase === 'writing' && (
          <div style={{ padding: '22px 0 8px' }}>
            <div style={{ position: 'relative', width: 210, height: 130, margin: '0 auto' }}>
              <div style={{
                position: 'absolute', inset: 0, borderRadius: 16,
                background: 'linear-gradient(135deg, #4A3323, #2B1F13)',
                boxShadow: '0 14px 30px rgba(43,31,19,.35)', overflow: 'hidden',
                padding: 14, boxSizing: 'border-box', textAlign: 'left',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%',
                    border: '1px solid rgba(239,230,210,.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Marcellus, Georgia, serif', fontSize: 12, color: '#EFE6D2',
                  }}>{monogram}</div>
                  <span style={{ width: 9, height: 9, borderRadius: 99, background: '#E8B14E', animation: 'blinkLED .5s ease infinite' }} />
                </div>
                <div style={{ width: 30, height: 22, borderRadius: 5, background: 'linear-gradient(135deg, #D9B36B, #B98D45)', marginTop: 14 }} />
                <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: 1.6, color: 'rgba(239,230,210,.65)', marginTop: 12 }}>
                  ESCRIBIENDO…
                </div>
                <div style={{
                  position: 'absolute', top: 0, bottom: 0, width: 60,
                  background: 'linear-gradient(100deg, transparent, rgba(255,236,200,.28), transparent)',
                  animation: 'sweepX 1.1s linear infinite',
                }} />
              </div>
            </div>
            <div style={{ width: 240, height: 7, borderRadius: 99, background: '#EFE6D2', margin: '22px auto 0', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 99,
                background: 'var(--ac, #B8552F)',
                animation: 'growW 2s linear forwards',
              }} />
            </div>
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 7, marginTop: 18,
              textAlign: 'left', width: 270, marginLeft: 'auto', marginRight: 'auto',
            }}>
              <div style={{ display: 'flex', gap: 9, alignItems: 'center', fontSize: 12.5, color: '#4A3D2C', animation: 'fadeUp .35s .1s both' }}>
                <span style={{ color: '#6F9B4E', fontWeight: 700 }}>✓</span>
                Credencial · {selRes.roomLine}
              </div>
              <div style={{ display: 'flex', gap: 9, alignItems: 'center', fontSize: 12.5, color: '#4A3D2C', animation: 'fadeUp .35s .7s both' }}>
                <span style={{ color: '#6F9B4E', fontWeight: 700 }}>✓</span>
                Válida del {selRes.dates} · {selRes.n} huéspedes
              </div>
              <div style={{ display: 'flex', gap: 9, alignItems: 'center', fontSize: 12.5, color: '#4A3D2C', animation: 'fadeUp .35s 1.4s both' }}>
                <span style={{
                  width: 11, height: 11,
                  border: '2px solid #C9B788', borderTopColor: 'transparent',
                  borderRadius: 99, flex: 'none',
                  animation: 'spin .8s linear infinite', boxSizing: 'border-box',
                }} />
                Cifrando sector NFC…
              </div>
            </div>
            <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 21, marginTop: 18 }}>Escribiendo credencial</div>
            <div style={{ fontSize: 13, color: '#8A7A63', marginTop: 6 }}>No retires la tarjeta del lector</div>
          </div>
        )}

        {phase === 'done' && (
          <div style={{ padding: '24px 0 4px' }}>
            <svg width="84" height="84" viewBox="0 0 92 92" fill="none" style={{ display: 'block', margin: '0 auto' }}>
              <circle cx="46" cy="46" r="42" stroke="#6F9B4E" strokeWidth="3"
                strokeDasharray="264" strokeDashoffset="264"
                style={{ animation: 'drawRing .6s ease .1s forwards' }} />
              <path d="M30 47l11 11 21-23" stroke="#6F9B4E" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray="50" strokeDashoffset="50"
                style={{ animation: 'drawCheck .4s ease .6s forwards' }} />
            </svg>
            <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 23, marginTop: 16 }}>Tarjeta activada</div>
            <div style={{
              background: '#F4EFE3', borderRadius: 14, padding: '13px 16px', marginTop: 14,
              fontSize: 13, color: '#4A3D2C', lineHeight: 1.6,
            }}>
              <b>{selRes.guest}</b> · {selRes.roomLine}<br />
              Válida del {selRes.dates} · expira al check-out
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <button onClick={onAgain} style={{
                flex: 1, padding: 13, border: '1px solid #DACBAE', borderRadius: 12,
                background: 'transparent', color: '#2E2418',
                fontFamily: 'Karla, sans-serif', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}>Codificar otra</button>
              <button onClick={onClose} style={{
                flex: 1, padding: 13, border: 'none', borderRadius: 12,
                background: 'var(--ac, #B8552F)', color: '#FBF6EA',
                fontFamily: 'Karla, sans-serif', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 8px 18px rgba(184,85,47,.28)',
              }}>Listo</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
