import { fmt } from '../../shared/utils/helpers.js';

export default function Paquetes({ pkgs, setPkgs, onEdit, onNew }) {
  const toggleActive = (id) =>
    setPkgs(pkgs.map((p) => (p.id === id ? { ...p, active: p.active === false } : p)));

  return (
    <div style={{ padding: '30px 34px 44px', animation: 'fadeIn .35s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 29 }}>Paquetes y extras</div>
          <div style={{ fontSize: 13.5, color: '#8A7A63', marginTop: 4 }}>
            Se ofrecen al huésped al completar su reserva
          </div>
        </div>
        <button
          onClick={onNew}
          style={{
            flex: 'none', padding: '12px 20px', border: 'none', borderRadius: 12,
            background: 'var(--ac, #B8552F)', color: '#FBF6EA',
            fontFamily: 'Karla, sans-serif', fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 8px 18px rgba(184,85,47,.28)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.07)'}
          onMouseLeave={(e) => e.currentTarget.style.filter = ''}
        >+ Nuevo paquete</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16, marginTop: 20 }}>
        {pkgs.map((p, i) => {
          const active = p.active !== false;
          return (
            <div
              key={p.id}
              style={{
                background: '#FFFDF7', border: '1px solid #EDE3CF', borderRadius: 18, padding: 18,
                animation: `fadeUp .5s ${(0.05 + i * 0.06).toFixed(2)}s both`,
                transition: 'transform .2s ease, box-shadow .2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 14px 30px rgba(62,44,22,.13)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ fontSize: 15.5, fontWeight: 700 }}>{p.name}</div>
                <div style={{ flex: 'none', textAlign: 'right' }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--ac, #B8552F)' }}>{fmt(p.price)}</span>
                  <div style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: 0.6,
                    color: '#8A7A63', marginTop: 2,
                  }}>{(p.unit || '').toUpperCase()}</div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: '#6B5D4A', lineHeight: 1.55, marginTop: 8, minHeight: 40 }}>{p.desc}</div>

              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginTop: 14, paddingTop: 13, borderTop: '1px dashed #E9DFCC',
              }}>
                <div onClick={() => toggleActive(p.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <div style={{
                    width: 38, height: 21, borderRadius: 99,
                    background: active ? '#6F7D5C' : '#D8CCB2',
                    position: 'relative', transition: 'background .18s ease',
                  }}>
                    <div style={{
                      position: 'absolute', top: 2.5, width: 16, height: 16, borderRadius: 99,
                      background: '#FFFDF7', boxShadow: '0 1px 3px rgba(0,0,0,.25)',
                      transition: 'left .18s ease',
                      left: active ? 19.5 : 2.5,
                    }} />
                  </div>
                  <span style={{
                    fontSize: 11.5, fontWeight: 700,
                    color: active ? '#5C6B4A' : '#9A8A70',
                  }}>{active ? 'Activo' : 'Oculto'}</span>
                </div>
                <button
                  onClick={() => onEdit(p)}
                  style={{
                    padding: '8px 14px', border: '1px solid #DACBAE', borderRadius: 9,
                    background: 'transparent', color: '#2E2418',
                    fontFamily: 'Karla, sans-serif', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F4EBD9'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >Editar</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
