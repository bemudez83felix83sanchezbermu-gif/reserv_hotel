import ImageSlot from '../../shared/ui/ImageSlot.jsx';
import { fmt } from '../../shared/utils/helpers.js';

export default function Habitaciones({ rooms, loading, error, onToggle, onEdit, onNew }) {
  return (
    <div style={{ padding: '30px 34px 44px', animation: 'fadeIn .35s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 29 }}>Habitaciones</div>
          <div style={{ fontSize: 13.5, color: '#8A7A63', marginTop: 4 }}>
            Cada tipo con foto, cama, capacidad y comodidades · edita o crea a demanda
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
        >+ Nueva habitación</button>
      </div>

      {error && <div style={{ marginTop: 16, padding: 12, background: '#F5E0DA', color: '#7A3B2A', borderRadius: 12, fontSize: 13.5 }}>{error}</div>}
      {loading && !rooms.length && <div style={{ marginTop: 24, fontSize: 13.5, color: '#8A7A63' }}>Cargando habitaciones…</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16, marginTop: 20 }}>
        {rooms.map((r, i) => {
          const active = r.active !== false;
          return (
            <div key={r.id} style={{
              background: '#FFFDF7', border: '1px solid #EDE3CF', borderRadius: 18, overflow: 'hidden',
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
              <ImageSlot id={`room-${r.id}-1`} shape="none" placeholder={`Hab. ${r.num}`} style={{ width: '100%', height: 170 }} />
              <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 15.5, fontWeight: 700 }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: '#8A7A63', marginTop: 2 }}>Hab. {r.num} · {r.type}</div>
                  </div>
                  <div style={{ textAlign: 'right', flex: 'none' }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--ac, #B8552F)' }}>{fmt(r.price)}</span>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#8A7A63', letterSpacing: 0.6, marginTop: 2 }}>POR NOCHE</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 10, fontSize: 12, color: '#6B5D4A', flexWrap: 'wrap' }}>
                  <span>👥 {r.cap}</span>
                  <span>📐 {r.m2 || '—'} m²</span>
                  <span>🛏 {r.bed}</span>
                </div>

                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginTop: 14, paddingTop: 12, borderTop: '1px dashed #E9DFCC',
                }}>
                  <div onClick={() => onToggle(r.id, !active)} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
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
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: active ? '#5C6B4A' : '#9A8A70' }}>
                      {active ? 'Activa' : 'Oculta'}
                    </span>
                  </div>
                  <button onClick={() => onEdit(r)} style={{
                    padding: '8px 14px', border: '1px solid #DACBAE', borderRadius: 9,
                    background: 'transparent', color: '#2E2418',
                    fontFamily: 'Karla, sans-serif', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F4EBD9'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >Editar</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
