import DataTable from '../../shared/ui/DataTable.jsx';
import { useDiscounts } from '../../shared/hooks/useDiscounts.jsx';

const CELL_INPUT = {
  width: '100%', boxSizing: 'border-box', padding: '8px 10px',
  border: '1px solid #E4D8C0', borderRadius: 9, background: '#FDFBF4',
  fontSize: 13, outline: 'none',
};

const KIND_LABEL = { percentage: '% porcentaje', fixed: '$ fijo' };

export default function Descuentos() {
  const { discounts, loading, error, createDiscount, updateDiscount, deleteDiscount, saving } = useDiscounts();

  const onNew = () => createDiscount({ name: 'Nuevo descuento', kind: 'percentage', value: 10, active: true });

  const columns = [
    {
      key: 'name', label: 'NOMBRE', sortable: true, width: '22%',
      render: (r) => (
        <input defaultValue={r.name}
          onBlur={(e) => { if (e.target.value !== r.name) updateDiscount(r.id, { name: e.target.value }); }}
          style={{ ...CELL_INPUT, fontWeight: 600 }} />
      ),
    },
    {
      key: 'code', label: 'CÓDIGO', sortable: true, width: 130,
      render: (r) => (
        <input defaultValue={r.code} placeholder="—"
          onBlur={(e) => { const v = e.target.value.toUpperCase(); if (v !== r.code) updateDiscount(r.id, { code: v }); }}
          style={{ ...CELL_INPUT, textTransform: 'uppercase' }} />
      ),
    },
    {
      key: 'kind', label: 'TIPO', sortable: true, width: 140,
      render: (r) => (
        <select value={r.kind} onChange={(e) => updateDiscount(r.id, { kind: e.target.value })} style={CELL_INPUT}>
          <option value="percentage">{KIND_LABEL.percentage}</option>
          <option value="fixed">{KIND_LABEL.fixed}</option>
        </select>
      ),
    },
    {
      key: 'value', label: 'VALOR', sortable: true, align: 'right', width: 110,
      render: (r) => (
        <input type="number" step="0.01" defaultValue={r.value}
          onBlur={(e) => { const v = Number(e.target.value) || 0; if (v !== r.value) updateDiscount(r.id, { value: v }); }}
          style={{ ...CELL_INPUT, textAlign: 'right' }} />
      ),
    },
    {
      key: 'validFrom', label: 'DESDE', width: 145,
      render: (r) => (
        <input type="date" defaultValue={r.validFrom || ''}
          onBlur={(e) => { if (e.target.value !== (r.validFrom || '')) updateDiscount(r.id, { validFrom: e.target.value }); }}
          style={{ ...CELL_INPUT, fontSize: 12.5 }} />
      ),
    },
    {
      key: 'validUntil', label: 'HASTA', width: 145,
      render: (r) => (
        <input type="date" defaultValue={r.validUntil || ''}
          onBlur={(e) => { if (e.target.value !== (r.validUntil || '')) updateDiscount(r.id, { validUntil: e.target.value }); }}
          style={{ ...CELL_INPUT, fontSize: 12.5 }} />
      ),
    },
    {
      key: 'usedCount', label: 'USOS', align: 'center', width: 90,
      render: (r) => <span style={{ color: '#6B5D4A' }}>{r.usedCount}{r.maxUses ? ` / ${r.maxUses}` : ''}</span>,
    },
    {
      key: 'active', label: 'ACTIVO', align: 'center', width: 90,
      render: (r) => (
        <div onClick={() => updateDiscount(r.id, { active: !r.active })} style={{ display: 'flex', justifyContent: 'center', cursor: 'pointer' }}>
          <div style={{
            width: 38, height: 21, borderRadius: 99,
            background: r.active ? '#6F7D5C' : '#D8CCB2',
            position: 'relative', transition: 'background .18s ease',
          }}>
            <div style={{
              position: 'absolute', top: 2.5, width: 16, height: 16, borderRadius: 99,
              background: '#FFFDF7', boxShadow: '0 1px 3px rgba(0,0,0,.25)',
              transition: 'left .18s ease', left: r.active ? 19.5 : 2.5,
            }} />
          </div>
        </div>
      ),
    },
    {
      key: 'actions', label: '', align: 'right', width: 60,
      render: (r) => (
        <button onClick={() => deleteDiscount(r.id)} disabled={saving} style={{
          width: 30, height: 30, borderRadius: '50%',
          border: '1px solid #E3B8AC', background: 'transparent',
          color: '#A8442C', cursor: 'pointer', fontSize: 12.5,
        }}>✕</button>
      ),
    },
  ];

  return (
    <div style={{ padding: '30px 34px 44px', animation: 'fadeIn .35s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 29 }}>Descuentos</div>
          <div style={{ fontSize: 13.5, color: '#8A7A63', marginTop: 4 }}>
            Catálogo de códigos y promociones aplicables al crear una reserva
          </div>
        </div>
        <button onClick={onNew} disabled={saving} style={{
          flex: 'none', padding: '12px 20px', border: 'none', borderRadius: 12,
          background: 'var(--ac, #B8552F)', color: '#FBF6EA',
          fontFamily: 'Karla, sans-serif', fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 8px 18px rgba(184,85,47,.28)',
        }}>+ Nuevo descuento</button>
      </div>

      {error && <div style={{ marginTop: 16, padding: 12, background: '#F5E0DA', color: '#7A3B2A', borderRadius: 12, fontSize: 13.5 }}>{error}</div>}

      <div style={{ marginTop: 20 }}>
        <DataTable
          columns={columns}
          rows={discounts}
          searchKeys={['name', 'code']}
          searchPlaceholder="Buscar por nombre o código…"
          emptyMessage={loading ? 'Cargando descuentos…' : 'Sin descuentos registrados.'}
        />
      </div>
      <div style={{ fontSize: 12, color: '#9A8A70', marginTop: 12 }}>
        {KIND_LABEL.percentage} aplica sobre el subtotal (habitación + paquetes) · {KIND_LABEL.fixed} es un monto fijo, topado al subtotal.
      </div>
    </div>
  );
}
