import { useState } from 'react';
import { usePrintTemplates } from '../../shared/hooks/usePrintTemplates.jsx';

const CARD = { background: '#FFFDF7', border: '1px solid #EDE3CF', borderRadius: 18 };
const inputStyle = {
  padding: '9px 11px', border: '1px solid #E4D8C0', borderRadius: 9,
  fontFamily: 'Karla, sans-serif', fontSize: 12.5, background: '#FFFDF7', color: '#2E2418',
};

const KINDS = ['reservation', 'key_card', 'pool_booking', 'corporate_confirmation'];
const KIND_LABELS = {
  reservation: 'Confirmación de reserva',
  key_card: 'Tarjeta-llave',
  pool_booking: 'Reserva de alberca',
  corporate_confirmation: 'Confirmación corporativa',
};

const SAMPLE_VARS = {
  guest_name: 'Ana Torres', reservation_code: 'CA-1024', room_label: 'Hab. 204 · Doble jardín',
  check_in: '2026-07-12', check_out: '2026-07-15',
};

export default function PlantillasImpresion() {
  const { templates, loading, error, createTemplate, updateTemplate, deleteTemplate, saving } = usePrintTemplates();
  const [expandedId, setExpandedId] = useState(null);

  const onNew = (kind) => createTemplate({
    kind, name: `Plantilla de ${KIND_LABELS[kind].toLowerCase()}`,
    htmlBody: `<h1>${KIND_LABELS[kind]}</h1>\n<p>Huésped: {{guest_name}}</p>\n<p>Código: {{reservation_code}}</p>`,
    active: true,
  });

  const preview = (html) => Object.entries(SAMPLE_VARS).reduce(
    (acc, [k, v]) => acc.replaceAll(`{{${k}}}`, v), html || '',
  );

  return (
    <div style={{ padding: '30px 34px 44px', animation: 'fadeIn .35s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 29 }}>Plantillas de impresión</div>
          <div style={{ fontSize: 13.5, color: '#8A7A63', marginTop: 4 }}>
            HTML con variables {'{{variable}}'} — el botón "Imprimir" usa la plantilla activa de cada tipo
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {KINDS.map((k) => (
            <button key={k} onClick={() => onNew(k)} disabled={saving} style={{
              padding: '10px 14px', border: '1px solid #DACBAE', borderRadius: 10,
              background: 'transparent', color: '#2E2418',
              fontFamily: 'Karla, sans-serif', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}>+ {KIND_LABELS[k]}</button>
          ))}
        </div>
      </div>

      {error && <div style={{ marginTop: 16, padding: 12, background: '#F5E0DA', color: '#7A3B2A', borderRadius: 12, fontSize: 13.5 }}>{error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 20 }}>
        {templates.map((t) => {
          const expanded = expandedId === t.id;
          return (
            <div key={t.id} style={{ ...CARD, padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: 10.5, fontWeight: 700, padding: '4px 10px', borderRadius: 999,
                  background: '#F1E7D2', color: '#6B5335', flex: 'none',
                }}>{KIND_LABELS[t.kind]}</span>
                <input defaultValue={t.name}
                  onBlur={(e) => { if (e.target.value !== t.name) updateTemplate(t.id, { name: e.target.value }); }}
                  style={{ ...inputStyle, fontWeight: 600, flex: '1 1 200px' }} />
                <div onClick={() => updateTemplate(t.id, { active: !t.active })} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <div style={{
                    width: 38, height: 21, borderRadius: 99,
                    background: t.active ? '#6F7D5C' : '#D8CCB2',
                    position: 'relative', transition: 'background .18s ease',
                  }}>
                    <div style={{
                      position: 'absolute', top: 2.5, width: 16, height: 16, borderRadius: 99,
                      background: '#FFFDF7', boxShadow: '0 1px 3px rgba(0,0,0,.25)',
                      transition: 'left .18s ease', left: t.active ? 19.5 : 2.5,
                    }} />
                  </div>
                  <span style={{ fontSize: 12, color: '#6B5D4A' }}>{t.active ? 'Activa' : 'Inactiva'}</span>
                </div>
                <button onClick={() => setExpandedId(expanded ? null : t.id)} style={{
                  padding: '8px 14px', border: '1px solid #DACBAE', borderRadius: 9,
                  background: 'transparent', fontFamily: 'Karla, sans-serif', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}>{expanded ? 'Cerrar' : 'Editar HTML'}</button>
                <button onClick={() => deleteTemplate(t.id)} style={{
                  width: 32, height: 32, borderRadius: '50%', border: '1px solid #E3B8AC',
                  background: 'transparent', color: '#A8442C', cursor: 'pointer', fontSize: 12.5,
                }}>✕</button>
              </div>

              {expanded && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
                  <div>
                    <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1, color: '#8A7A63', marginBottom: 6 }}>HTML (usa {'{{variable}}'})</div>
                    <textarea defaultValue={t.htmlBody} rows={12}
                      onBlur={(e) => { if (e.target.value !== t.htmlBody) updateTemplate(t.id, { htmlBody: e.target.value }); }}
                      style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', fontFamily: 'monospace', fontSize: 12, lineHeight: 1.5, resize: 'vertical' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1, color: '#8A7A63', marginBottom: 6 }}>PREVIEW (datos de ejemplo)</div>
                    <iframe title={`preview-${t.id}`} srcDoc={preview(t.htmlBody)} style={{
                      width: '100%', height: 268, border: '1px solid #E4D8C0', borderRadius: 11, background: '#fff',
                    }} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {!loading && templates.length === 0 && (
          <div style={{ ...CARD, padding: 24, textAlign: 'center', color: '#8A7A63', fontSize: 13.5 }}>Sin plantillas — crea una desde los botones de arriba.</div>
        )}
      </div>
    </div>
  );
}
