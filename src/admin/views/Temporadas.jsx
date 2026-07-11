import DataTable from '../../shared/ui/DataTable.jsx';
import { useRatePeriods } from '../../shared/hooks/useRatePeriods.jsx';
import { useRoomTypes } from '../../shared/hooks/useCatalog.jsx';

const CELL_INPUT = {
  width: '100%', boxSizing: 'border-box', padding: '8px 10px',
  border: '1px solid #E4D8C0', borderRadius: 9, background: '#FDFBF4',
  fontSize: 13, outline: 'none',
};

const KIND_LABEL = { multiplier: '× multiplicador', override: '$ precio fijo' };

export default function Temporadas() {
  const { ratePeriods, loading, error, createRatePeriod, updateRatePeriod, deleteRatePeriod, saving } = useRatePeriods();
  const roomTypesQ = useRoomTypes();
  const roomTypes = roomTypesQ.data || [];

  const today = new Date().toISOString().slice(0, 10);
  const onNew = () => createRatePeriod({
    name: 'Nueva temporada', dateFrom: today, dateTo: today,
    kind: 'multiplier', value: 1.2, appliesToRoomTypeId: null, active: true,
  });

  const columns = [
    {
      key: 'name', label: 'NOMBRE', sortable: true, width: '20%',
      render: (r) => (
        <input defaultValue={r.name}
          onBlur={(e) => { if (e.target.value !== r.name) updateRatePeriod(r.id, { name: e.target.value }); }}
          style={{ ...CELL_INPUT, fontWeight: 600 }} />
      ),
    },
    {
      key: 'dateFrom', label: 'DESDE', sortable: true, width: 145,
      render: (r) => (
        <input type="date" defaultValue={r.dateFrom}
          onBlur={(e) => { if (e.target.value !== r.dateFrom) updateRatePeriod(r.id, { dateFrom: e.target.value }); }}
          style={{ ...CELL_INPUT, fontSize: 12.5 }} />
      ),
    },
    {
      key: 'dateTo', label: 'HASTA', width: 145,
      render: (r) => (
        <input type="date" defaultValue={r.dateTo}
          onBlur={(e) => { if (e.target.value !== r.dateTo) updateRatePeriod(r.id, { dateTo: e.target.value }); }}
          style={{ ...CELL_INPUT, fontSize: 12.5 }} />
      ),
    },
    {
      key: 'appliesToRoomTypeId', label: 'TIPO DE HABITACIÓN', width: 190,
      render: (r) => (
        <select
          value={r.appliesToRoomTypeId || ''}
          onChange={(e) => updateRatePeriod(r.id, { appliesToRoomTypeId: e.target.value || null })}
          style={{ ...CELL_INPUT, fontSize: 12.5 }}
        >
          <option value="">— todos los tipos —</option>
          {roomTypes.map((rt) => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
        </select>
      ),
    },
    {
      key: 'kind', label: 'FÓRMULA', sortable: true, width: 160,
      render: (r) => (
        <select value={r.kind} onChange={(e) => updateRatePeriod(r.id, { kind: e.target.value })} style={CELL_INPUT}>
          <option value="multiplier">{KIND_LABEL.multiplier}</option>
          <option value="override">{KIND_LABEL.override}</option>
        </select>
      ),
    },
    {
      key: 'value', label: 'VALOR', sortable: true, align: 'right', width: 110,
      render: (r) => (
        <input type="number" step="0.01" defaultValue={r.value}
          onBlur={(e) => { const v = Number(e.target.value) || 0; if (v !== r.value) updateRatePeriod(r.id, { value: v }); }}
          style={{ ...CELL_INPUT, textAlign: 'right' }} />
      ),
    },
    {
      key: 'active', label: 'ACTIVA', align: 'center', width: 90,
      render: (r) => (
        <div onClick={() => updateRatePeriod(r.id, { active: !r.active })} style={{ display: 'flex', justifyContent: 'center', cursor: 'pointer' }}>
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
        <button onClick={() => deleteRatePeriod(r.id)} disabled={saving} style={{
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
          <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 29 }}>Temporadas</div>
          <div style={{ fontSize: 13.5, color: '#8A7A63', marginTop: 4 }}>
            Ajustes de tarifa por rango de fechas — se aplican noche por noche al crear una reserva
          </div>
        </div>
        <button onClick={onNew} disabled={saving} style={{
          flex: 'none', padding: '12px 20px', border: 'none', borderRadius: 12,
          background: 'var(--ac, #B8552F)', color: '#FBF6EA',
          fontFamily: 'Karla, sans-serif', fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 8px 18px rgba(184,85,47,.28)',
        }}>+ Nueva temporada</button>
      </div>

      {error && <div style={{ marginTop: 16, padding: 12, background: '#F5E0DA', color: '#7A3B2A', borderRadius: 12, fontSize: 13.5 }}>{error}</div>}

      <div style={{ marginTop: 20 }}>
        <DataTable
          columns={columns}
          rows={ratePeriods}
          searchKeys={['name']}
          searchPlaceholder="Buscar temporada…"
          emptyMessage={loading ? 'Cargando temporadas…' : 'Sin temporadas registradas.'}
        />
      </div>
      <div style={{ fontSize: 12, color: '#9A8A70', marginTop: 12 }}>
        {KIND_LABEL.multiplier} multiplica el precio base de la noche (p.ej. 1.2 = +20%) · {KIND_LABEL.override} reemplaza el precio de esa noche.
      </div>
    </div>
  );
}
