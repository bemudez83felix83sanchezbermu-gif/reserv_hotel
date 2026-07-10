import ImageSlot from './ImageSlot.jsx';
import { AMEN_CATALOG } from '../data/mockData.js';

const INPUT = {
  width: '100%', boxSizing: 'border-box', padding: '11px 13px',
  border: '1px solid #E4D8C0', borderRadius: 11, background: '#FDFBF4',
  fontSize: 14, outline: 'none',
};
const LABEL = { fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, color: '#8A7A63', marginBottom: 5 };

export default function RoomPackageModal({ modal, updateDraft, onClose, onSave, onDelete }) {
  if (!modal) return null;
  const { kind, isNew, draft } = modal;
  const canDelete = !isNew;
  const title = kind === 'room'
    ? (isNew ? 'Nueva habitación' : 'Editar habitación')
    : (isNew ? 'Nuevo paquete' : 'Editar paquete');

  const onField = (field, isNum = false) => (e) =>
    updateDraft(field, isNum ? Number(e.target.value) : e.target.value);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(38,29,18,.55)',
      backdropFilter: 'blur(5px)', zIndex: 60,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 30, animation: 'fadeIn .2s ease both',
    }}>
      <div style={{
        background: '#FFFDF7', borderRadius: 22,
        width: 640, maxWidth: '100%', maxHeight: '100%',
        overflowY: 'auto', padding: 26,
        animation: 'pop .28s cubic-bezier(.2,.7,.2,1) both',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 22 }}>{title}</div>
          <button onClick={onClose} style={{
            width: 34, height: 34, borderRadius: '50%',
            border: '1px solid #E4D8C0', background: 'transparent',
            fontSize: 15, cursor: 'pointer', color: '#6B5D4A',
          }}>✕</button>
        </div>

        {kind === 'room' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 18 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={LABEL}>NOMBRE</div>
                <input value={draft.name || ''} onChange={onField('name')} style={{ ...INPUT, fontWeight: 600 }} />
              </div>
              <div>
                <div style={LABEL}>TIPO</div>
                <input value={draft.type || ''} onChange={onField('type')} style={INPUT} />
              </div>
              <div>
                <div style={LABEL}>PRECIO / NOCHE (MXN)</div>
                <input type="number" value={draft.price || 0} onChange={onField('price', true)} style={INPUT} />
              </div>
              <div>
                <div style={LABEL}>CAPACIDAD</div>
                <input type="number" value={draft.cap || 0} onChange={onField('cap', true)} style={INPUT} />
              </div>
              <div>
                <div style={LABEL}>SUPERFICIE (M²)</div>
                <input type="number" value={draft.m2 || 0} onChange={onField('m2', true)} style={INPUT} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={LABEL}>CAMA</div>
                <input value={draft.bed || ''} onChange={onField('bed')} style={INPUT} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={LABEL}>DESCRIPCIÓN</div>
                <textarea value={draft.desc || ''} onChange={onField('desc')} rows={3}
                  style={{ ...INPUT, fontSize: 13.5, lineHeight: 1.5, resize: 'vertical' }} />
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ ...LABEL, marginBottom: 8 }}>COMODIDADES</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {AMEN_CATALOG.map((label) => {
                  const on = (draft.amenities || []).includes(label);
                  return (
                    <button key={label} onClick={() => updateDraft('amenities', on ? draft.amenities.filter((a) => a !== label) : [...(draft.amenities || []), label])} style={{
                      padding: '7px 13px', borderRadius: 999,
                      border: '1px solid ' + (on ? '#2E2418' : '#E4D8C0'),
                      background: on ? '#2E2418' : '#FFFDF7',
                      color: on ? '#FBF6EA' : '#6B5D4A',
                      fontFamily: 'Karla, sans-serif', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      transition: 'all .15s ease',
                    }}>{label}</button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ ...LABEL, marginBottom: 8 }}>FOTOS · arrastra imágenes</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
                {[1, 2, 3].map((n) => (
                  <ImageSlot key={n} id={`room-${draft.id}-${n}`} shape="rounded" radius={12} placeholder={`Foto ${n}`} style={{ width: '100%', height: 110 }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {kind === 'pkg' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 18 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={LABEL}>NOMBRE DEL PAQUETE</div>
              <input value={draft.name || ''} onChange={onField('name')} style={{ ...INPUT, fontWeight: 600 }} />
            </div>
            <div>
              <div style={LABEL}>PRECIO (MXN)</div>
              <input type="number" value={draft.price || 0} onChange={onField('price', true)} style={INPUT} />
            </div>
            <div>
              <div style={LABEL}>SE COBRA</div>
              <select value={draft.unit || 'por persona'} onChange={onField('unit')} style={{ ...INPUT, fontSize: 13.5 }}>
                <option value="por persona / día">por persona / día</option>
                <option value="por persona">por persona</option>
                <option value="por pareja">por pareja</option>
                <option value="por estancia">por estancia</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={LABEL}>DESCRIPCIÓN</div>
              <textarea value={draft.desc || ''} onChange={onField('desc')} rows={3}
                style={{ ...INPUT, fontSize: 13.5, lineHeight: 1.5, resize: 'vertical' }} />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 22, alignItems: 'center' }}>
          {canDelete && (
            <button onClick={onDelete} style={{
              padding: '12px 18px', border: '1px solid #E3B8AC', borderRadius: 11,
              background: 'transparent', color: '#A8442C',
              fontFamily: 'Karla, sans-serif', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}>Eliminar</button>
          )}
          <div style={{ flex: 1 }} />
          <button onClick={onClose} style={{
            padding: '12px 20px', border: '1px solid #DACBAE', borderRadius: 11,
            background: 'transparent', color: '#2E2418',
            fontFamily: 'Karla, sans-serif', fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}>Cancelar</button>
          <button onClick={onSave} style={{
            padding: '12px 24px', border: 'none', borderRadius: 11,
            background: 'var(--ac, #B8552F)', color: '#FBF6EA',
            fontFamily: 'Karla, sans-serif', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 8px 18px rgba(184,85,47,.28)',
          }}>Guardar</button>
        </div>
      </div>
    </div>
  );
}
