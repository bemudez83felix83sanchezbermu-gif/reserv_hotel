import { useEffect, useState } from 'react';
import { useDailyClosings, useDailyClosing, useDailyPreview } from '../../shared/hooks/useDailyClosings.jsx';
import { useConfig } from '../../shared/hooks/useConfig.jsx';
import { useAuth } from '../../shared/hooks/useAuth.jsx';
import { todayIso, fmt } from '../../shared/utils/helpers.js';

const CARD = { background: '#FFFDF7', border: '1px solid #EDE3CF', borderRadius: 18 };
const inputStyle = {
  padding: '9px 11px', border: '1px solid #E4D8C0', borderRadius: 9,
  fontFamily: 'Karla, sans-serif', fontSize: 12.5, background: '#FFFDF7', color: '#2E2418',
};

export default function CierreContable() {
  const { config } = useConfig();
  const { staff } = useAuth();
  const [date, setDate] = useState(todayIso());
  const [notes, setNotes] = useState('');
  const [toast, setToast] = useState(null);

  const { closing: existingClosing } = useDailyClosing(date);
  const { preview, loading, error, load, closeDay, closing: saving } = useDailyPreview(date, config?.tax_rate);
  const { closings } = useDailyClosings();

  useEffect(() => { load(); }, [load]);

  const onClose = async () => {
    if (!preview) return;
    try {
      await closeDay({ date, staffId: staff?.id, notes, ...preview });
      setToast({ kind: 'ok', text: '✓ Día cerrado' });
      setNotes('');
    } catch (e) {
      setToast({ kind: 'err', text: e.message || String(e) });
    } finally {
      setTimeout(() => setToast(null), 3200);
    }
  };

  const rows = existingClosing || preview;
  const total = rows ? rows.roomsRevenue + rows.restaurantRevenue + rows.poolRevenue : 0;

  return (
    <div style={{ padding: '30px 34px 44px', animation: 'fadeIn .35s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 29 }}>Cierre contable</div>
          <div style={{ fontSize: 13.5, color: '#8A7A63', marginTop: 4 }}>
            Ingresos y descuentos del día, calculados en vivo desde reservas y alberca
          </div>
        </div>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
      </div>

      {error && <div style={{ marginTop: 16, padding: 12, background: '#F5E0DA', color: '#7A3B2A', borderRadius: 12, fontSize: 13.5 }}>{error}</div>}

      <div style={{ ...CARD, padding: 24, marginTop: 20, maxWidth: 720 }}>
        {loading || !rows ? (
          <div style={{ fontSize: 13, color: '#8A7A63' }}>Calculando…</div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
              {[
                ['Habitaciones', rows.roomsRevenue],
                ['Restaurante', rows.restaurantRevenue],
                ['Alberca', rows.poolRevenue],
                ['Descuentos', -rows.discountsTotal],
                ['Impuestos', rows.taxCollected],
              ].map(([label, val]) => (
                <div key={label} style={{ border: '1px solid #EDE3CF', borderRadius: 13, padding: '12px 14px' }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1, color: '#8A7A63' }}>{label.toUpperCase()}</div>
                  <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 20, marginTop: 4 }}>{fmt(val)}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 18, paddingTop: 16, borderTop: '1px dashed #E9DFCC' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#6B5D4A' }}>Total ingresos (antes de impuestos)</div>
              <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 26, color: 'var(--ac, #B8552F)' }}>{fmt(total)}</div>
            </div>

            {existingClosing ? (
              <div style={{ marginTop: 16, padding: 12, background: '#EAF2E6', color: '#3F6E4C', borderRadius: 10, fontSize: 13 }}>
                ✓ Día cerrado el {new Date(existingClosing.closedAt).toLocaleString('es-MX')}
                {existingClosing.notes && <div style={{ marginTop: 4, color: '#4A5D3E' }}>{existingClosing.notes}</div>}
              </div>
            ) : (
              <div style={{ marginTop: 18 }}>
                <textarea placeholder="Notas del cierre (opcional)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                  style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', resize: 'vertical' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 12 }}>
                  <button onClick={onClose} disabled={saving} style={{
                    padding: '13px 24px', border: 'none', borderRadius: 12,
                    background: 'var(--ac, #B8552F)', color: '#FBF6EA',
                    fontFamily: 'Karla, sans-serif', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
                    boxShadow: '0 8px 18px rgba(184,85,47,.28)', opacity: saving ? 0.7 : 1,
                  }}>{saving ? 'Cerrando…' : 'Cerrar día'}</button>
                  <div style={{ fontSize: 12.5, color: toast?.kind === 'err' ? '#A8442C' : '#6F7D5C', fontWeight: 700, opacity: toast ? 1 : 0, transition: 'opacity .3s ease' }}>{toast?.text}</div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 19, marginTop: 26 }}>Historial de cierres</div>
      <div style={{ ...CARD, marginTop: 10, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr', gap: 10, padding: '12px 18px', fontSize: 10.5, fontWeight: 700, letterSpacing: 1, color: '#8A7A63', borderBottom: '1px solid #EDE3CF' }}>
          <div>FECHA</div><div>HABITACIONES</div><div>RESTAURANTE</div><div>ALBERCA</div><div>DESCUENTOS</div><div>IMPUESTOS</div>
        </div>
        {closings.map((c) => (
          <div key={c.date} style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr', gap: 10,
            padding: '11px 18px', fontSize: 12.5, alignItems: 'center', borderBottom: '1px solid #F2EADA',
          }}>
            <div style={{ fontWeight: 700 }}>{c.date}</div>
            <div>{fmt(c.roomsRevenue)}</div>
            <div>{fmt(c.restaurantRevenue)}</div>
            <div>{fmt(c.poolRevenue)}</div>
            <div>{fmt(c.discountsTotal)}</div>
            <div>{fmt(c.taxCollected)}</div>
          </div>
        ))}
        {closings.length === 0 && <div style={{ padding: 18, fontSize: 12.5, color: '#8A7A63' }}>Sin cierres registrados todavía.</div>}
      </div>
    </div>
  );
}
