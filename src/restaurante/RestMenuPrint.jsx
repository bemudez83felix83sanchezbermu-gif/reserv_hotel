import { createPortal } from 'react-dom';
import { LA_PARADITA_LOGO } from './logo.js';

const money = (n) => '$' + Math.round(Number(n) || 0).toLocaleString('es-MX');

// Ornamento central (rombo + líneas) entre secciones del encabezado.
function Divider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, margin: '10px auto 0', maxWidth: 320 }}>
      <span style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, #C9A24B)' }} />
      <svg width="34" height="12" viewBox="0 0 34 12" fill="none"><path d="M17 1l4 5-4 5-4-5 4-5z" fill="#C0392B" /><path d="M4 6h6M24 6h6" stroke="#C9A24B" strokeWidth="1.4" strokeLinecap="round" /></svg>
      <span style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, #C9A24B, transparent)' }} />
    </div>
  );
}

// Menú imprimible: papel crema, logo limpio (PNG sin fondo) y detalles cálidos.
// Portal a <body>; @media print oculta la app y deja solo la hoja.
export default function MenuPrint({ categories, items, onClose }) {
  const visible = items.filter((i) => i.active !== false);
  const byCat = categories
    .map((c) => ({ cat: c, list: visible.filter((i) => i.category_id === c.id) }))
    .filter((g) => g.list.length > 0);

  return createPortal(
    <div id="menu-print-root" style={{ position: 'fixed', inset: 0, zIndex: 200, overflowY: 'auto', background: '#4a4139' }}>
      <style>{`
        @media print {
          #root { display: none !important; }
          #menu-print-root { position: static !important; background: #fff !important; }
          .no-print { display: none !important; }
          @page { size: A4; margin: 0; }
        }
        #menu-print-root * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .mp-item { break-inside: avoid; }
        .mp-cat { break-inside: avoid; }
      `}</style>

      {/* Barra de acciones (no imprime) */}
      <div className="no-print" style={{ position: 'sticky', top: 0, display: 'flex', gap: 10, justifyContent: 'center', padding: 12, background: 'rgba(20,16,12,.92)', zIndex: 5 }}>
        <button onClick={() => window.print()} style={{ padding: '10px 20px', border: 'none', borderRadius: 10, background: '#B8552F', color: '#FBF6EA', fontFamily: 'Karla, sans-serif', fontWeight: 700, fontSize: 13.5, cursor: 'pointer' }}>🖨 Imprimir / Guardar PDF</button>
        <button onClick={onClose} style={{ padding: '10px 20px', border: '1px solid rgba(255,255,255,.3)', borderRadius: 10, background: 'transparent', color: '#fff', fontFamily: 'Karla, sans-serif', fontWeight: 700, fontSize: 13.5, cursor: 'pointer' }}>Cerrar</button>
      </div>

      {/* Hoja del menú */}
      <div style={{ maxWidth: 820, margin: '18px auto', background: '#FBF5E9', boxShadow: '0 24px 70px rgba(0,0,0,.45)', overflow: 'hidden', border: '1px solid #EAD9B8' }}>
        {/* Encabezado claro con el logo limpio */}
        <div style={{ position: 'relative', textAlign: 'center', padding: '30px 20px 22px', background: 'radial-gradient(120% 90% at 50% 0%, #FFFDF7 0%, #F6EAD2 100%)' }}>
          {/* filete superior tricolor sutil */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 5, background: 'linear-gradient(90deg, #2E7D32 0 33%, #FBF5E9 33% 34%, #C0392B 34%)' }} />
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 11, letterSpacing: 4, color: '#9B7B3E', textTransform: 'uppercase', marginTop: 6 }}>Hotel Félix Inn · Puerto Peñasco</div>
          <img src={LA_PARADITA_LOGO} alt="La Paradita Restaurante" style={{ width: 230, maxWidth: '62%', height: 'auto', display: 'inline-block', margin: '6px 0 2px' }} />
          <Divider />
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 15, letterSpacing: 7, color: '#B02A1E', textTransform: 'uppercase', marginTop: 12, fontWeight: 700 }}>Menú</div>
          <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12.5, color: '#8A7A5E', marginTop: 3 }}>Auténtica cocina mexicana · desayunos y comida corrida</div>
        </div>

        <div style={{ padding: '24px 34px 30px', columns: 2, columnGap: 36 }}>
          {byCat.map(({ cat, list }) => (
            <div key={cat.id} className="mp-cat" style={{ breakInside: 'avoid', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
                <span style={{ fontFamily: 'Georgia, serif', fontSize: 18, color: '#B02A1E', fontWeight: 700, letterSpacing: 0.5 }}>{cat.name}</span>
                <span style={{ flex: 1, height: 2, background: 'repeating-linear-gradient(90deg, #E0B15A 0 6px, transparent 6px 10px)' }} />
              </div>
              {list.map((it) => (
                <div key={it.id} className="mp-item" style={{ marginBottom: 9 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontFamily: 'Georgia, serif', fontSize: 14.5, color: '#2E2418', fontWeight: 700 }}>{it.name}</span>
                    <span style={{ flex: 1, borderBottom: '1px dotted #C9B99A', transform: 'translateY(-3px)' }} />
                    <span style={{ fontFamily: 'Georgia, serif', fontSize: 14.5, color: '#B02A1E', fontWeight: 700, whiteSpace: 'nowrap' }}>{it.price > 0 ? money(it.price) : '—'}</span>
                  </div>
                  {it.description && <div style={{ fontSize: 11.5, color: '#7A6A52', fontStyle: 'italic', lineHeight: 1.4, marginTop: 1 }}>{it.description}</div>}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Pie cálido (terracota) */}
        <div style={{ background: 'linear-gradient(90deg, #8A3B22, #B8552F)', color: '#FBEFDD', textAlign: 'center', padding: '16px 20px', fontFamily: 'Georgia, serif' }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.6 }}>Comida corrida todos los días de 12 a 2 pm · Domingos menudo de res</div>
          <div style={{ fontSize: 12, opacity: 0.92, marginTop: 5 }}>Carretera Peñasco Sonoyta y Calle Lisboa #450, a un costado de Gasolinera Arco Aeropuerto</div>
          <div style={{ fontSize: 12.5, fontWeight: 700, marginTop: 4, letterSpacing: 1 }}>Tel. 638 156 5582</div>
        </div>
      </div>
    </div>,
    document.body
  );
}
