import DataTable from '../../shared/ui/DataTable.jsx';
import { useSalesChannels } from '../../shared/hooks/useSalesChannels.jsx';

const CELL_INPUT = {
  width: '100%', boxSizing: 'border-box', padding: '8px 10px',
  border: '1px solid #E4D8C0', borderRadius: 9, background: '#FDFBF4',
  fontSize: 13, outline: 'none',
};

export default function Canales() {
  const { channels, loading, error, createChannel, updateChannel, deleteChannel, saving } = useSalesChannels();

  const onNew = () => createChannel({ name: 'Nuevo canal', commissionPercent: 0, active: true });

  const columns = [
    {
      key: 'name', label: 'NOMBRE', sortable: true, width: '32%',
      render: (r) => (
        <input
          defaultValue={r.name}
          onBlur={(e) => { if (e.target.value !== r.name) updateChannel(r.id, { name: e.target.value }); }}
          style={{ ...CELL_INPUT, fontWeight: 600 }}
        />
      ),
    },
    {
      key: 'slug', label: 'SLUG', sortable: true,
      render: (r) => <span style={{ color: '#8A7A63', fontSize: 12.5 }}>{r.slug}</span>,
    },
    {
      key: 'commissionPercent', label: 'COMISIÓN %', sortable: true, align: 'right', width: 140,
      render: (r) => (
        <input
          type="number" step="0.1" defaultValue={r.commissionPercent}
          onBlur={(e) => { const v = Number(e.target.value) || 0; if (v !== r.commissionPercent) updateChannel(r.id, { commissionPercent: v }); }}
          style={{ ...CELL_INPUT, textAlign: 'right' }}
        />
      ),
    },
    {
      key: 'active', label: 'ACTIVO', align: 'center', width: 90,
      render: (r) => (
        <div onClick={() => updateChannel(r.id, { active: !r.active })} style={{ display: 'flex', justifyContent: 'center', cursor: 'pointer' }}>
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
        <button onClick={() => deleteChannel(r.id)} disabled={saving} style={{
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
          <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 29 }}>Canales de venta</div>
          <div style={{ fontSize: 13.5, color: '#8A7A63', marginTop: 4 }}>
            Origen de cada reserva y su comisión — se elige al crear una reserva
          </div>
        </div>
        <button onClick={onNew} disabled={saving} style={{
          flex: 'none', padding: '12px 20px', border: 'none', borderRadius: 12,
          background: 'var(--ac, #B8552F)', color: '#FBF6EA',
          fontFamily: 'Karla, sans-serif', fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 8px 18px rgba(184,85,47,.28)',
        }}>+ Nuevo canal</button>
      </div>

      {error && <div style={{ marginTop: 16, padding: 12, background: '#F5E0DA', color: '#7A3B2A', borderRadius: 12, fontSize: 13.5 }}>{error}</div>}

      <div style={{ marginTop: 20 }}>
        <DataTable
          columns={columns}
          rows={channels}
          searchKeys={['name', 'slug']}
          searchPlaceholder="Buscar canal…"
          emptyMessage={loading ? 'Cargando canales…' : 'Sin canales registrados.'}
        />
      </div>
    </div>
  );
}
