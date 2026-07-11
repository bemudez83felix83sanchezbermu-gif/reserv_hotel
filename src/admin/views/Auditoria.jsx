import { useState } from 'react';
import { useAuditLog } from '../../shared/hooks/useAuditLog.jsx';
import { useStaff } from '../../shared/hooks/useStaff.jsx';

const CARD = { background: '#FFFDF7', border: '1px solid #EDE3CF', borderRadius: 15 };
const inputStyle = {
  padding: '9px 11px', border: '1px solid #E4D8C0', borderRadius: 9,
  fontFamily: 'Karla, sans-serif', fontSize: 12.5, background: '#FFFDF7', color: '#2E2418',
};

export default function Auditoria() {
  const { staff } = useStaff();
  const [filters, setFilters] = useState({ actorId: '', targetTable: '', action: '', dateFrom: '', dateTo: '' });
  const [expandedId, setExpandedId] = useState(null);
  const { entries, loading, error } = useAuditLog(filters);

  const setFilter = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div style={{ padding: '30px 34px 44px', animation: 'fadeIn .35s ease both' }}>
      <div>
        <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 29 }}>Auditoría</div>
        <div style={{ fontSize: 13.5, color: '#8A7A63', marginTop: 4 }}>
          Registro de cambios — solo lectura
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
        <select value={filters.actorId} onChange={setFilter('actorId')} style={inputStyle}>
          <option value="">Todo el staff</option>
          {staff.map((s) => <option key={s.id} value={s.id}>{s.fullName}</option>)}
        </select>
        <input placeholder="Tabla (ej. reservations)" value={filters.targetTable} onChange={setFilter('targetTable')} style={{ ...inputStyle, width: 180 }} />
        <input placeholder="Acción (ej. update)" value={filters.action} onChange={setFilter('action')} style={{ ...inputStyle, width: 150 }} />
        <input type="date" value={filters.dateFrom} onChange={setFilter('dateFrom')} style={inputStyle} />
        <span style={{ alignSelf: 'center', color: '#8A7A63', fontSize: 12 }}>a</span>
        <input type="date" value={filters.dateTo} onChange={setFilter('dateTo')} style={inputStyle} />
      </div>

      {error && <div style={{ marginTop: 16, padding: 12, background: '#F5E0DA', color: '#7A3B2A', borderRadius: 12, fontSize: 13.5 }}>{error}</div>}

      <div style={{ ...CARD, marginTop: 20, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr 1.2fr 1.3fr', gap: 10, padding: '12px 18px', fontSize: 10.5, fontWeight: 700, letterSpacing: 1, color: '#8A7A63', borderBottom: '1px solid #EDE3CF' }}>
          <div>FECHA</div><div>ACTOR</div><div>ACCIÓN</div><div>TABLA</div><div>REGISTRO</div>
        </div>
        {entries.map((e) => {
          const expanded = expandedId === e.id;
          return (
            <div key={e.id} onClick={() => setExpandedId(expanded ? null : e.id)} style={{ borderBottom: '1px solid #F2EADA', cursor: 'pointer' }}>
              <div style={{
                display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr 1.2fr 1.3fr', gap: 10,
                padding: '11px 18px', fontSize: 12.5, alignItems: 'center',
              }}>
                <div style={{ color: '#8A7A63', fontSize: 11.5 }}>{new Date(e.at).toLocaleString('es-MX')}</div>
                <div>{e.actorName || '—'}</div>
                <div style={{ fontWeight: 700 }}>{e.action}</div>
                <div>{e.targetSchema}.{e.targetTable}</div>
                <div style={{ fontFamily: 'monospace', fontSize: 11 }}>{e.targetId || '—'}</div>
              </div>
              {expanded && (e.before || e.after) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 18px 14px' }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: '#8A7A63', marginBottom: 4 }}>ANTES</div>
                    <pre style={{ margin: 0, fontSize: 11, background: '#FDFBF4', border: '1px solid #EDE3CF', borderRadius: 9, padding: 10, overflowX: 'auto' }}>{JSON.stringify(e.before, null, 2) || '—'}</pre>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: '#8A7A63', marginBottom: 4 }}>DESPUÉS</div>
                    <pre style={{ margin: 0, fontSize: 11, background: '#FDFBF4', border: '1px solid #EDE3CF', borderRadius: 9, padding: 10, overflowX: 'auto' }}>{JSON.stringify(e.after, null, 2) || '—'}</pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {!loading && entries.length === 0 && (
          <div style={{ padding: 18, fontSize: 12.5, color: '#8A7A63' }}>Sin registros de auditoría todavía.</div>
        )}
      </div>
    </div>
  );
}
