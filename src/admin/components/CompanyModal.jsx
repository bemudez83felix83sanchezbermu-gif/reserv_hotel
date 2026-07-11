import { useEffect, useState } from 'react';
import { useRoomTypes } from '../../shared/hooks/useCatalog.jsx';
import { useCorporateRates } from '../../shared/hooks/useCompanies.jsx';
import { fmt } from '../../shared/utils/helpers.js';

const INPUT = {
  width: '100%', boxSizing: 'border-box', padding: '11px 13px',
  border: '1px solid #E4D8C0', borderRadius: 11, background: '#FDFBF4',
  fontSize: 14, outline: 'none',
};
const LABEL = { fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, color: '#8A7A63', marginBottom: 5 };

const VERIF_LABEL = { pending: 'Pendiente', approved: 'Aprobada', rejected: 'Rechazada' };
const VERIF_COLOR = { pending: '#8A6420', approved: '#3F6E4C', rejected: '#93402D' };

const emptyDraft = () => ({ legalName: '', commercialName: '', rfc: '', contactName: '', email: '', phone: '', notes: '' });

export default function CompanyModal({ company, onClose, onSave, onDelete, onSetVerification, saving = false }) {
  const isNew = !company;
  const [draft, setDraft] = useState(company ? { ...company } : emptyDraft());
  useEffect(() => setDraft(company ? { ...company } : emptyDraft()), [company]);

  const roomTypesQ = useRoomTypes();
  const roomTypes = roomTypesQ.data || [];
  const { rates, saveRate, removeRate, saving: ratesSaving } = useCorporateRates(company?.id);

  const [newRateType, setNewRateType] = useState('');
  const [newRatePrice, setNewRatePrice] = useState('');

  const onField = (field) => (e) => setDraft((d) => ({ ...d, [field]: e.target.value }));

  const addRate = () => {
    const price = Number(newRatePrice);
    if (!newRateType || !price) return;
    saveRate({ roomTypeId: newRateType, price });
    setNewRateType('');
    setNewRatePrice('');
  };

  const availableTypes = roomTypes.filter((rt) => !rates.some((r) => r.roomTypeId === rt.id));

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(38,29,18,.55)',
      backdropFilter: 'blur(5px)', zIndex: 60,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 30, animation: 'fadeIn .2s ease both',
    }}>
      <div style={{
        background: '#FFFDF7', borderRadius: 22,
        width: 680, maxWidth: '100%', maxHeight: '100%',
        overflowY: 'auto', padding: 26,
        animation: 'pop .28s cubic-bezier(.2,.7,.2,1) both',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 22 }}>{isNew ? 'Nueva empresa' : draft.legalName || 'Editar empresa'}</div>
          <button onClick={onClose} style={{
            width: 34, height: 34, borderRadius: '50%',
            border: '1px solid #E4D8C0', background: 'transparent',
            fontSize: 15, cursor: 'pointer', color: '#6B5D4A',
          }}>✕</button>
        </div>

        {!isNew && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 11.5, fontWeight: 700, padding: '6px 12px', borderRadius: 999,
              background: (VERIF_COLOR[draft.verificationStatus] || '#8A7A63') + '1E',
              color: VERIF_COLOR[draft.verificationStatus] || '#8A7A63',
            }}>{VERIF_LABEL[draft.verificationStatus] || draft.verificationStatus}</span>
            {draft.verificationStatus !== 'approved' && (
              <button onClick={() => onSetVerification(company.id, 'approved')} disabled={saving} style={{
                padding: '7px 13px', border: '1px solid #A9C6A1', borderRadius: 9,
                background: 'transparent', color: '#3F6E4C', fontFamily: 'Karla, sans-serif',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}>Aprobar</button>
            )}
            {draft.verificationStatus !== 'rejected' && (
              <button onClick={() => onSetVerification(company.id, 'rejected')} disabled={saving} style={{
                padding: '7px 13px', border: '1px solid #E3B8AC', borderRadius: 9,
                background: 'transparent', color: '#A8442C', fontFamily: 'Karla, sans-serif',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}>Rechazar</button>
            )}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 18 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={LABEL}>RAZÓN SOCIAL</div>
            <input value={draft.legalName || ''} onChange={onField('legalName')} style={{ ...INPUT, fontWeight: 600 }} />
          </div>
          <div>
            <div style={LABEL}>NOMBRE COMERCIAL</div>
            <input value={draft.commercialName || ''} onChange={onField('commercialName')} style={INPUT} />
          </div>
          <div>
            <div style={LABEL}>RFC</div>
            <input value={draft.rfc || ''} onChange={onField('rfc')} style={{ ...INPUT, textTransform: 'uppercase' }} />
          </div>
          <div>
            <div style={LABEL}>CONTACTO</div>
            <input value={draft.contactName || ''} onChange={onField('contactName')} style={INPUT} />
          </div>
          <div>
            <div style={LABEL}>TELÉFONO</div>
            <input value={draft.phone || ''} onChange={onField('phone')} style={INPUT} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={LABEL}>EMAIL</div>
            <input type="email" value={draft.email || ''} onChange={onField('email')} style={INPUT} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={LABEL}>NOTAS</div>
            <textarea value={draft.notes || ''} onChange={onField('notes')} rows={2} style={{ ...INPUT, fontSize: 13.5, lineHeight: 1.5, resize: 'vertical' }} />
          </div>
        </div>

        {!isNew && (
          <div style={{ marginTop: 18 }}>
            <div style={{ ...LABEL, marginBottom: 8 }}>TARIFAS CORPORATIVAS</div>
            <div style={{ border: '1px solid #EDE3CF', borderRadius: 13, overflow: 'hidden' }}>
              {rates.map((r, i) => (
                <div key={r.roomTypeId} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                  padding: '10px 14px', borderTop: i ? '1px solid #F3ECDC' : 'none', fontSize: 13,
                }}>
                  <span>{r.roomTypeName}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontWeight: 700, color: 'var(--ac, #B8552F)' }}>{fmt(r.price)}</span>
                    <button onClick={() => removeRate(r.roomTypeId)} disabled={ratesSaving} style={{
                      width: 26, height: 26, borderRadius: '50%',
                      border: '1px solid #E3B8AC', background: 'transparent',
                      color: '#A8442C', cursor: 'pointer', fontSize: 11,
                    }}>✕</button>
                  </div>
                </div>
              ))}
              {!rates.length && <div style={{ padding: 14, fontSize: 13, color: '#8A7A63' }}>Sin tarifas corporativas todavía.</div>}
            </div>
            {availableTypes.length > 0 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <select value={newRateType} onChange={(e) => setNewRateType(e.target.value)} style={{ ...INPUT, fontSize: 13, flex: 2 }}>
                  <option value="">— tipo de habitación —</option>
                  {availableTypes.map((rt) => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
                </select>
                <input type="number" placeholder="Precio" value={newRatePrice} onChange={(e) => setNewRatePrice(e.target.value)} style={{ ...INPUT, flex: 1 }} />
                <button onClick={addRate} disabled={ratesSaving || !newRateType || !newRatePrice} style={{
                  padding: '0 16px', border: '1.5px dashed #C9B788', borderRadius: 11,
                  background: 'transparent', color: '#6B5335',
                  fontFamily: 'Karla, sans-serif', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
                }}>+ Agregar</button>
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 22, alignItems: 'center' }}>
          {!isNew && (
            <button onClick={() => onDelete(company.id)} disabled={saving} style={{
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
          <button onClick={() => onSave(draft)} disabled={saving || !(draft.legalName || '').trim()} style={{
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
