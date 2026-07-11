import { useEffect, useState } from 'react';
import { usePoolConfig } from '../../shared/hooks/usePoolConfig.jsx';

const CARD = { background: '#FFFDF7', border: '1px solid #EDE3CF', borderRadius: 20 };
const INPUT = {
  width: '100%', boxSizing: 'border-box', padding: '11px 13px',
  border: '1px solid #E4D8C0', borderRadius: 11, background: '#FDFBF4',
  fontSize: 14, outline: 'none',
};
const LABEL = { fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, color: '#8A7A63', marginBottom: 6 };

const MODES = ['exclusive_only', 'mixed', 'passes_only'];
const MODE_LABELS = {
  exclusive_only: 'Solo eventos privados',
  mixed: 'Eventos y day-pass mixtos',
  passes_only: 'Solo day-pass',
};
const MODE_HELP = {
  exclusive_only: 'La alberca se reserva completa para un evento; no se venden day-pass.',
  mixed: 'Conviven eventos privados y day-pass, sujeto a la capacidad y a bloqueos por evento.',
  passes_only: 'Solo se venden pases de día; no hay reservas de evento privado.',
};

export default function AlbercaConfig() {
  const { config, loading, error, updateConfig, saving } = usePoolConfig();
  const [draft, setDraft] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => { if (config) setDraft({ ...config }); }, [config]);

  if (loading || !draft) return <div style={{ padding: 30 }}>Cargando configuración de alberca…</div>;
  if (error) return <div style={{ padding: 30, color: '#A8442C' }}>Error: {error}</div>;

  const onSave = async () => {
    try {
      await updateConfig(draft);
      setToast({ kind: 'ok', text: '✓ Guardado' });
    } catch (e) {
      setToast({ kind: 'err', text: 'No se pudo guardar: ' + (e.message || e) });
    } finally {
      setTimeout(() => setToast(null), 2600);
    }
  };

  return (
    <div style={{ padding: '30px 34px 44px', animation: 'fadeIn .35s ease both' }}>
      <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 29 }}>Alberca — Configuración</div>
      <div style={{ fontSize: 13.5, color: '#8A7A63', marginTop: 4 }}>
        Define cómo se comparte la alberca entre eventos privados y day-pass
      </div>

      <div style={{ ...CARD, padding: 24, marginTop: 20, maxWidth: 720 }}>
        <div style={LABEL}>MODO DE OPERACIÓN</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
          {MODES.map((m) => {
            const on = draft.mode === m;
            return (
              <div key={m} onClick={() => setDraft((d) => ({ ...d, mode: m }))} style={{
                border: '1.5px solid ' + (on ? 'var(--ac, #B8552F)' : '#E4D8C0'),
                background: on ? '#F8EDE4' : '#FDFBF4',
                borderRadius: 14, padding: 13, cursor: 'pointer', transition: 'all .15s ease',
              }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{MODE_LABELS[m]}</div>
                <div style={{ fontSize: 11.5, color: '#6B5D4A', marginTop: 4, lineHeight: 1.5 }}>{MODE_HELP[m]}</div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginTop: 20 }}>
          <div>
            <div style={LABEL}>CAPACIDAD MÁXIMA</div>
            <input type="number" min={1} value={draft.maxCapacity}
              onChange={(e) => setDraft((d) => ({ ...d, maxCapacity: Math.max(1, Number(e.target.value) || 1) }))}
              style={INPUT} />
          </div>
          <div>
            <div style={LABEL}>ABRE</div>
            <input type="time" value={draft.openTime} onChange={(e) => setDraft((d) => ({ ...d, openTime: e.target.value }))} style={INPUT} />
          </div>
          <div>
            <div style={LABEL}>CIERRA</div>
            <input type="time" value={draft.closeTime} onChange={(e) => setDraft((d) => ({ ...d, closeTime: e.target.value }))} style={INPUT} />
          </div>
          <div>
            <div style={LABEL}>PRECIO EVENTO PRIVADO (DEFAULT)</div>
            <input type="number" min={0} step="0.01" value={draft.defaultEventPrice}
              onChange={(e) => setDraft((d) => ({ ...d, defaultEventPrice: Number(e.target.value) || 0 }))}
              style={INPUT} />
          </div>
          <div>
            <div style={LABEL}>PRECIO DAY-PASS (DEFAULT)</div>
            <input type="number" min={0} step="0.01" value={draft.defaultDayPassPrice}
              onChange={(e) => setDraft((d) => ({ ...d, defaultDayPassPrice: Number(e.target.value) || 0 }))}
              style={INPUT} />
          </div>
        </div>

        <div
          onClick={() => setDraft((d) => ({ ...d, eventLocksPool: !d.eventLocksPool }))}
          style={{
            display: 'flex', alignItems: 'center', gap: 12, marginTop: 20, padding: 14,
            border: '1px solid #EDE3CF', borderRadius: 13, cursor: 'pointer', background: '#FDFBF4',
          }}
        >
          <div style={{
            width: 40, height: 22, borderRadius: 99, flex: 'none',
            background: draft.eventLocksPool ? '#6F7D5C' : '#D8CCB2',
            position: 'relative', transition: 'background .18s ease',
          }}>
            <div style={{
              position: 'absolute', top: 2.5, width: 17, height: 17, borderRadius: 99,
              background: '#FFFDF7', boxShadow: '0 1px 3px rgba(0,0,0,.25)',
              transition: 'left .18s ease', left: draft.eventLocksPool ? 20.5 : 2.5,
            }} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Un evento privado bloquea day-pass</div>
            <div style={{ fontSize: 11.5, color: '#8A7A63', marginTop: 2 }}>
              Si está activo, no se puede vender un day-pass en el mismo horario de un evento confirmado
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 22, paddingTop: 18, borderTop: '1px dashed #E9DFCC' }}>
          <button onClick={onSave} disabled={saving} style={{
            padding: '13px 24px', border: 'none', borderRadius: 12,
            background: 'var(--ac, #B8552F)', color: '#FBF6EA',
            fontFamily: 'Karla, sans-serif', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
            boxShadow: '0 8px 18px rgba(184,85,47,.28)', opacity: saving ? 0.7 : 1,
          }}>{saving ? 'Guardando…' : 'Guardar cambios'}</button>
          <div style={{
            fontSize: 12.5, color: toast?.kind === 'err' ? '#A8442C' : '#6F7D5C', fontWeight: 700,
            opacity: toast ? 1 : 0, transition: 'opacity .3s ease',
          }}>{toast?.text}</div>
        </div>
      </div>
    </div>
  );
}
