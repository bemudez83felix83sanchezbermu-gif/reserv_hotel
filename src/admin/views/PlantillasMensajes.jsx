import { useState } from 'react';
import { useMessageTemplates, useMessagesLog } from '../../shared/hooks/useMessageTemplates.jsx';

const CARD = { background: '#FFFDF7', border: '1px solid #EDE3CF', borderRadius: 18 };
const inputStyle = {
  padding: '9px 11px', border: '1px solid #E4D8C0', borderRadius: 9,
  fontFamily: 'Karla, sans-serif', fontSize: 12.5, background: '#FFFDF7', color: '#2E2418',
};

const CHANNELS = ['email', 'sms', 'whatsapp', 'in_app'];
const CHANNEL_LABELS = { email: 'Email', sms: 'SMS', whatsapp: 'WhatsApp', in_app: 'In-app' };
const STATUS_META = {
  queued:    { label: 'En cola',    bg: '#F1E7D2', fg: '#6B5335' },
  sent:      { label: 'Enviado',    bg: '#E4D5B8', fg: '#5C4A2E' },
  delivered: { label: 'Entregado',  bg: '#EAF2E6', fg: '#3F6E4C' },
  failed:    { label: 'Fallido',    bg: '#F5E0DA', fg: '#7A3B2A' },
  opened:    { label: 'Abierto',    bg: '#E8E3EF', fg: '#5A4A7A' },
};

export default function PlantillasMensajes() {
  const { templates, loading, error, createTemplate, updateTemplate, deleteTemplate, sendTest, saving } = useMessageTemplates();
  const { log, loading: logLoading } = useMessagesLog();
  const [testTo, setTestTo] = useState({});

  const onNew = (channel) => createTemplate({ channel, trigger: 'post_checkout', subject: channel === 'email' ? 'Asunto' : '', body: 'Hola {{guest_name}}, ...' });

  return (
    <div style={{ padding: '30px 34px 44px', animation: 'fadeIn .35s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 29 }}>Plantillas de mensajes</div>
          <div style={{ fontSize: 13.5, color: '#8A7A63', marginTop: 4 }}>
            Por canal y disparador — "Enviar de prueba" registra el intento en el log de mensajes
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {CHANNELS.map((c) => (
            <button key={c} onClick={() => onNew(c)} disabled={saving} style={{
              padding: '10px 14px', border: '1px solid #DACBAE', borderRadius: 10,
              background: 'transparent', color: '#2E2418',
              fontFamily: 'Karla, sans-serif', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}>+ {CHANNEL_LABELS[c]}</button>
          ))}
        </div>
      </div>

      {error && <div style={{ marginTop: 16, padding: 12, background: '#F5E0DA', color: '#7A3B2A', borderRadius: 12, fontSize: 13.5 }}>{error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 20 }}>
        {templates.map((t) => (
          <div key={t.id} style={{ ...CARD, padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{
                fontSize: 10.5, fontWeight: 700, padding: '4px 10px', borderRadius: 999,
                background: '#F1E7D2', color: '#6B5335', flex: 'none',
              }}>{CHANNEL_LABELS[t.channel]}</span>
              <input defaultValue={t.trigger} placeholder="disparador (ej. post_checkout)"
                onBlur={(e) => { if (e.target.value !== t.trigger) updateTemplate(t.id, { trigger: e.target.value }); }}
                style={{ ...inputStyle, fontWeight: 600, width: 200 }} />
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
              <div style={{ flex: 1 }} />
              <button onClick={() => deleteTemplate(t.id)} style={{
                width: 32, height: 32, borderRadius: '50%', border: '1px solid #E3B8AC',
                background: 'transparent', color: '#A8442C', cursor: 'pointer', fontSize: 12.5,
              }}>✕</button>
            </div>

            {t.channel === 'email' && (
              <input defaultValue={t.subject} placeholder="Asunto"
                onBlur={(e) => { if (e.target.value !== t.subject) updateTemplate(t.id, { subject: e.target.value }); }}
                style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', marginTop: 10 }} />
            )}
            <textarea defaultValue={t.body} rows={3} placeholder="Cuerpo del mensaje — usa {{variable}}"
              onBlur={(e) => { if (e.target.value !== t.body) updateTemplate(t.id, { body: e.target.value }); }}
              style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', marginTop: 10, resize: 'vertical' }} />

            <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center' }}>
              <input
                placeholder={t.channel === 'email' ? 'correo@ejemplo.com' : 'destinatario'}
                value={testTo[t.id] || ''}
                onChange={(e) => setTestTo((m) => ({ ...m, [t.id]: e.target.value }))}
                style={{ ...inputStyle, flex: '1 1 200px' }}
              />
              <button
                disabled={saving || !(testTo[t.id] || '').trim()}
                onClick={() => sendTest(t, testTo[t.id])}
                style={{
                  padding: '9px 16px', border: 'none', borderRadius: 9,
                  background: 'var(--ac, #B8552F)', color: '#FBF6EA',
                  fontFamily: 'Karla, sans-serif', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}
              >Enviar de prueba</button>
            </div>
          </div>
        ))}
        {!loading && templates.length === 0 && (
          <div style={{ ...CARD, padding: 24, textAlign: 'center', color: '#8A7A63', fontSize: 13.5 }}>Sin plantillas — crea una desde los botones de arriba.</div>
        )}
      </div>

      <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 19, marginTop: 26 }}>Log de mensajes</div>
      <div style={{ ...CARD, marginTop: 10, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.4fr 1fr 1fr', gap: 10, padding: '12px 18px', fontSize: 10.5, fontWeight: 700, letterSpacing: 1, color: '#8A7A63', borderBottom: '1px solid #EDE3CF' }}>
          <div>CANAL</div><div>DISPARADOR</div><div>DESTINATARIO</div><div>ESTADO</div><div>FECHA</div>
        </div>
        {log.map((l) => (
          <div key={l.id} style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1.4fr 1fr 1fr', gap: 10,
            padding: '11px 18px', fontSize: 12.5, alignItems: 'center', borderBottom: '1px solid #F2EADA',
          }}>
            <div>{CHANNEL_LABELS[l.channel] || l.channel}</div>
            <div>{l.templateTrigger || '—'}</div>
            <div>{l.toAddress}</div>
            <div>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999,
                background: STATUS_META[l.status]?.bg, color: STATUS_META[l.status]?.fg,
              }}>{STATUS_META[l.status]?.label || l.status}</span>
            </div>
            <div style={{ color: '#8A7A63', fontSize: 11.5 }}>{new Date(l.createdAt).toLocaleString('es-MX')}</div>
          </div>
        ))}
        {!logLoading && log.length === 0 && (
          <div style={{ padding: 18, fontSize: 12.5, color: '#8A7A63' }}>Sin mensajes registrados todavía.</div>
        )}
      </div>
    </div>
  );
}
