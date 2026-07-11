import { useEffect, useState } from 'react';
import ImageSlot from '../../shared/ui/ImageSlot.jsx';
import { useIdentificationTypes } from '../../shared/hooks/useCatalog.jsx';
import { useGuestTags } from '../../shared/hooks/useGuestTags.jsx';
import { useReservationsByGuest } from '../../shared/hooks/useReservations.jsx';
import { fmt } from '../../shared/utils/helpers.js';

const INPUT = {
  width: '100%', boxSizing: 'border-box', padding: '11px 13px',
  border: '1px solid #E4D8C0', borderRadius: 11, background: '#FDFBF4',
  fontSize: 14, outline: 'none',
};
const LABEL = { fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, color: '#8A7A63', marginBottom: 5 };

const emptyDraft = () => ({
  firstName: '', lastName: '', email: '', phone: '', birthday: '',
  identificationTypeId: null, identificationNumber: '', notes: '',
});

export default function GuestModal({ guest, onClose, onSave, onDelete, onToggleTag, saving = false }) {
  const isNew = !guest;
  const [draft, setDraft] = useState(guest ? { ...guest } : emptyDraft());
  useEffect(() => setDraft(guest ? { ...guest } : emptyDraft()), [guest]);

  const idTypesQ = useIdentificationTypes();
  const { tags } = useGuestTags();
  const { reservations: history, loading: histLoading } = useReservationsByGuest(guest?.id);

  const onField = (field) => (e) => setDraft((d) => ({ ...d, [field]: e.target.value }));

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(38,29,18,.55)',
      backdropFilter: 'blur(5px)', zIndex: 60,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 30, animation: 'fadeIn .2s ease both',
    }}>
      <div style={{
        background: '#FFFDF7', borderRadius: 22,
        width: 720, maxWidth: '100%', maxHeight: '100%',
        overflowY: 'auto', padding: 26,
        animation: 'pop .28s cubic-bezier(.2,.7,.2,1) both',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 22 }}>{isNew ? 'Nuevo huésped' : draft.fullName || 'Editar huésped'}</div>
          <button onClick={onClose} style={{
            width: 34, height: 34, borderRadius: '50%',
            border: '1px solid #E4D8C0', background: 'transparent',
            fontSize: 15, cursor: 'pointer', color: '#6B5D4A',
          }}>✕</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '112px 1fr', gap: 18, marginTop: 20 }}>
          <ImageSlot id={`guest-id-${guest?.id || 'nuevo'}`} shape="rounded" radius={12} placeholder="Foto ID" style={{ width: 112, height: 112 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={LABEL}>NOMBRE(S)</div>
              <input value={draft.firstName || ''} onChange={onField('firstName')} style={{ ...INPUT, fontWeight: 600 }} />
            </div>
            <div>
              <div style={LABEL}>APELLIDOS</div>
              <input value={draft.lastName || ''} onChange={onField('lastName')} style={{ ...INPUT, fontWeight: 600 }} />
            </div>
            <div>
              <div style={LABEL}>EMAIL</div>
              <input type="email" value={draft.email || ''} onChange={onField('email')} style={INPUT} />
            </div>
            <div>
              <div style={LABEL}>TELÉFONO</div>
              <input value={draft.phone || ''} onChange={onField('phone')} style={INPUT} />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 12 }}>
          <div>
            <div style={LABEL}>CUMPLEAÑOS</div>
            <input type="date" value={draft.birthday || ''} onChange={onField('birthday')} style={INPUT} />
          </div>
          <div>
            <div style={LABEL}>TIPO DE IDENTIFICACIÓN</div>
            <select
              value={draft.identificationTypeId || ''}
              onChange={(e) => setDraft((d) => ({ ...d, identificationTypeId: e.target.value || null }))}
              style={{ ...INPUT, fontSize: 13.5 }}
            >
              <option value="">— sin especificar —</option>
              {(idTypesQ.data || []).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <div style={LABEL}>NÚMERO DE IDENTIFICACIÓN</div>
            <input value={draft.identificationNumber || ''} onChange={onField('identificationNumber')} style={INPUT} />
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={LABEL}>NOTAS</div>
          <textarea value={draft.notes || ''} onChange={onField('notes')} rows={2} style={{ ...INPUT, fontSize: 13.5, lineHeight: 1.5, resize: 'vertical' }} />
        </div>

        <div style={{ marginTop: 18 }}>
          <div style={{ ...LABEL, marginBottom: 8 }}>ETIQUETAS</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {tags.map((tag) => {
              const on = isNew ? false : (guest.tags || []).some((t) => t.id === tag.id);
              return (
                <button
                  key={tag.id}
                  disabled={isNew}
                  onClick={() => onToggleTag(guest, tag.id)}
                  title={isNew ? 'Guarda el huésped antes de asignar etiquetas' : ''}
                  style={{
                    padding: '7px 13px', borderRadius: 999,
                    border: '1px solid ' + (on ? (tag.color || '#2E2418') : '#E4D8C0'),
                    background: on ? (tag.color || '#2E2418') : '#FFFDF7',
                    color: on ? '#FBF6EA' : '#6B5D4A',
                    fontFamily: 'Karla, sans-serif', fontSize: 12, fontWeight: 700,
                    cursor: isNew ? 'not-allowed' : 'pointer', opacity: isNew ? 0.5 : 1,
                    transition: 'all .15s ease',
                  }}
                >{tag.name}</button>
              );
            })}
            {!tags.length && <div style={{ fontSize: 12.5, color: '#8A7A63' }}>Sin catálogo de etiquetas todavía.</div>}
          </div>
        </div>

        {!isNew && (
          <div style={{ marginTop: 18 }}>
            <div style={{ ...LABEL, marginBottom: 8 }}>HISTORIAL DE ESTANCIAS</div>
            <div style={{ border: '1px solid #EDE3CF', borderRadius: 13, overflow: 'hidden' }}>
              {histLoading && <div style={{ padding: 14, fontSize: 13, color: '#8A7A63' }}>Cargando historial…</div>}
              {!histLoading && history.length === 0 && (
                <div style={{ padding: 14, fontSize: 13, color: '#8A7A63' }}>Sin estancias registradas.</div>
              )}
              {history.map((r, i) => (
                <div key={r.id} style={{
                  display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 14px',
                  borderTop: i ? '1px solid #F3ECDC' : 'none', fontSize: 13,
                }}>
                  <div>
                    <span style={{ fontWeight: 700 }}>{r.code}</span>
                    <span style={{ color: '#8A7A63', marginLeft: 8 }}>Hab. {r.roomNum} · {r.checkIn} – {r.checkOut}</span>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--ac, #B8552F)' }}>{r.total != null ? fmt(r.total) : '—'}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 22, alignItems: 'center' }}>
          {!isNew && (
            <button onClick={() => onDelete(guest.id)} disabled={saving} style={{
              padding: '12px 18px', border: '1px solid #E3B8AC', borderRadius: 11,
              background: 'transparent', color: '#A8442C',
              fontFamily: 'Karla, sans-serif', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}>Eliminar</button>
          )}
          <div style={{ flex: 1 }} />
          <button onClick={onClose} disabled={saving} style={{
            padding: '12px 20px', border: '1px solid #DACBAE', borderRadius: 11,
            background: 'transparent', color: '#2E2418',
            fontFamily: 'Karla, sans-serif', fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}>Cancelar</button>
          <button onClick={() => onSave(draft)} disabled={saving || !(draft.firstName || '').trim()} style={{
            padding: '12px 24px', border: 'none', borderRadius: 11,
            background: 'var(--ac, #B8552F)', color: '#FBF6EA',
            fontFamily: 'Karla, sans-serif', fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
            boxShadow: '0 8px 18px rgba(184,85,47,.28)', opacity: saving ? 0.7 : 1,
          }}>{saving ? 'Guardando…' : 'Guardar'}</button>
        </div>
      </div>
    </div>
  );
}
