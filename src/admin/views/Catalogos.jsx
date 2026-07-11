import { useState } from 'react';
import DataTable from '../../shared/ui/DataTable.jsx';
import { useBedTypesAdmin, useRoomTypesAdmin, useAmenitiesAdmin, useIdentificationTypesAdmin } from '../../shared/hooks/useCatalogAdmin.jsx';

const CELL_INPUT = {
  width: '100%', boxSizing: 'border-box', padding: '8px 10px',
  border: '1px solid #E4D8C0', borderRadius: 9, background: '#FDFBF4',
  fontSize: 13, outline: 'none',
};

const ActiveToggle = ({ on, onClick }) => (
  <div onClick={onClick} style={{ display: 'flex', justifyContent: 'center', cursor: 'pointer' }}>
    <div style={{
      width: 38, height: 21, borderRadius: 99,
      background: on ? '#6F7D5C' : '#D8CCB2',
      position: 'relative', transition: 'background .18s ease',
    }}>
      <div style={{
        position: 'absolute', top: 2.5, width: 16, height: 16, borderRadius: 99,
        background: '#FFFDF7', boxShadow: '0 1px 3px rgba(0,0,0,.25)',
        transition: 'left .18s ease', left: on ? 19.5 : 2.5,
      }} />
    </div>
  </div>
);

const DeleteBtn = ({ onClick, disabled }) => (
  <button onClick={onClick} disabled={disabled} style={{
    width: 30, height: 30, borderRadius: '50%',
    border: '1px solid #E3B8AC', background: 'transparent',
    color: '#A8442C', cursor: 'pointer', fontSize: 12.5,
  }}>✕</button>
);

function BedTypesTab() {
  const { items, loading, create, update, remove, saving } = useBedTypesAdmin();
  const columns = [
    {
      key: 'name', label: 'NOMBRE', sortable: true,
      render: (r) => <input defaultValue={r.name} onBlur={(e) => e.target.value !== r.name && update(r.id, { name: e.target.value })} style={{ ...CELL_INPUT, fontWeight: 600 }} />,
    },
    {
      key: 'capacity_suggested', label: 'CAPACIDAD SUGERIDA', align: 'right', width: 170,
      render: (r) => <input type="number" min={1} defaultValue={r.capacity_suggested} onBlur={(e) => { const v = Number(e.target.value) || 1; v !== r.capacity_suggested && update(r.id, { capacity_suggested: v }); }} style={{ ...CELL_INPUT, textAlign: 'right' }} />,
    },
    { key: 'active', label: 'ACTIVO', align: 'center', width: 90, render: (r) => <ActiveToggle on={r.active} onClick={() => update(r.id, { active: !r.active })} /> },
    { key: 'actions', label: '', align: 'right', width: 60, render: (r) => <DeleteBtn onClick={() => remove(r.id)} disabled={saving} /> },
  ];
  return (
    <>
      <button onClick={() => create({ name: 'Nuevo tipo de cama', capacity_suggested: 2 })} disabled={saving} style={NEW_BTN}>+ Nuevo tipo de cama</button>
      <DataTable columns={columns} rows={items} searchKeys={['name']} searchPlaceholder="Buscar…" emptyMessage={loading ? 'Cargando…' : 'Sin registros.'} />
    </>
  );
}

function RoomTypesTab() {
  const { items, loading, create, update, remove, saving } = useRoomTypesAdmin();
  const { items: bedTypes } = useBedTypesAdmin();
  const columns = [
    {
      key: 'name', label: 'NOMBRE', sortable: true,
      render: (r) => <input defaultValue={r.name} onBlur={(e) => e.target.value !== r.name && update(r.id, { name: e.target.value })} style={{ ...CELL_INPUT, fontWeight: 600 }} />,
    },
    {
      key: 'description', label: 'DESCRIPCIÓN',
      render: (r) => <input defaultValue={r.description || ''} onBlur={(e) => e.target.value !== (r.description || '') && update(r.id, { description: e.target.value })} style={CELL_INPUT} />,
    },
    {
      key: 'base_capacity', label: 'CAPACIDAD', align: 'right', width: 110,
      render: (r) => <input type="number" min={1} defaultValue={r.base_capacity} onBlur={(e) => { const v = Number(e.target.value) || 1; v !== r.base_capacity && update(r.id, { base_capacity: v }); }} style={{ ...CELL_INPUT, textAlign: 'right' }} />,
    },
    {
      key: 'bed_type_id', label: 'TIPO DE CAMA', width: 180,
      render: (r) => (
        <select value={r.bed_type_id || ''} onChange={(e) => update(r.id, { bed_type_id: e.target.value || null })} style={CELL_INPUT}>
          <option value="">— sin especificar —</option>
          {bedTypes.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      ),
    },
    { key: 'active', label: 'ACTIVO', align: 'center', width: 90, render: (r) => <ActiveToggle on={r.active} onClick={() => update(r.id, { active: !r.active })} /> },
    { key: 'actions', label: '', align: 'right', width: 60, render: (r) => <DeleteBtn onClick={() => remove(r.id)} disabled={saving} /> },
  ];
  return (
    <>
      <button onClick={() => create({ name: 'Nuevo tipo de habitación', base_capacity: 2 })} disabled={saving} style={NEW_BTN}>+ Nuevo tipo de habitación</button>
      <DataTable columns={columns} rows={items} searchKeys={['name', 'description']} searchPlaceholder="Buscar…" emptyMessage={loading ? 'Cargando…' : 'Sin registros.'} />
    </>
  );
}

function AmenitiesTab() {
  const { items, loading, create, update, remove, saving } = useAmenitiesAdmin();
  const columns = [
    {
      key: 'name', label: 'NOMBRE', sortable: true,
      render: (r) => <input defaultValue={r.name} onBlur={(e) => e.target.value !== r.name && update(r.id, { name: e.target.value })} style={{ ...CELL_INPUT, fontWeight: 600 }} />,
    },
    {
      key: 'category', label: 'CATEGORÍA', width: 150,
      render: (r) => <input defaultValue={r.category || ''} onBlur={(e) => e.target.value !== (r.category || '') && update(r.id, { category: e.target.value })} style={CELL_INPUT} />,
    },
    {
      key: 'icon', label: 'ICONO', width: 130,
      render: (r) => <input defaultValue={r.icon || ''} onBlur={(e) => e.target.value !== (r.icon || '') && update(r.id, { icon: e.target.value })} style={CELL_INPUT} />,
    },
    { key: 'active', label: 'ACTIVO', align: 'center', width: 90, render: (r) => <ActiveToggle on={r.active} onClick={() => update(r.id, { active: !r.active })} /> },
    { key: 'actions', label: '', align: 'right', width: 60, render: (r) => <DeleteBtn onClick={() => remove(r.id)} disabled={saving} /> },
  ];
  return (
    <>
      <button onClick={() => create({ name: 'Nueva amenidad', category: '' })} disabled={saving} style={NEW_BTN}>+ Nueva amenidad</button>
      <DataTable columns={columns} rows={items} searchKeys={['name', 'category']} searchPlaceholder="Buscar…" emptyMessage={loading ? 'Cargando…' : 'Sin registros.'} />
    </>
  );
}

function IdTypesTab() {
  const { items, loading, create, update, remove, saving } = useIdentificationTypesAdmin();
  const columns = [
    {
      key: 'name', label: 'NOMBRE', sortable: true,
      render: (r) => <input defaultValue={r.name} onBlur={(e) => e.target.value !== r.name && update(r.id, { name: e.target.value })} style={{ ...CELL_INPUT, fontWeight: 600 }} />,
    },
    { key: 'requires_number', label: 'PIDE NÚMERO', align: 'center', width: 120, render: (r) => <ActiveToggle on={r.requires_number} onClick={() => update(r.id, { requires_number: !r.requires_number })} /> },
    { key: 'requires_file', label: 'PIDE ARCHIVO', align: 'center', width: 120, render: (r) => <ActiveToggle on={r.requires_file} onClick={() => update(r.id, { requires_file: !r.requires_file })} /> },
    { key: 'active', label: 'ACTIVO', align: 'center', width: 90, render: (r) => <ActiveToggle on={r.active} onClick={() => update(r.id, { active: !r.active })} /> },
    { key: 'actions', label: '', align: 'right', width: 60, render: (r) => <DeleteBtn onClick={() => remove(r.id)} disabled={saving} /> },
  ];
  return (
    <>
      <button onClick={() => create({ name: 'Nuevo tipo de identificación', requires_number: true, requires_file: false })} disabled={saving} style={NEW_BTN}>+ Nuevo tipo</button>
      <DataTable columns={columns} rows={items} searchKeys={['name']} searchPlaceholder="Buscar…" emptyMessage={loading ? 'Cargando…' : 'Sin registros.'} />
    </>
  );
}

const NEW_BTN = {
  display: 'block', marginBottom: 14, padding: '11px 18px', border: 'none', borderRadius: 11,
  background: 'var(--ac, #B8552F)', color: '#FBF6EA',
  fontFamily: 'Karla, sans-serif', fontSize: 13, fontWeight: 700, cursor: 'pointer',
  boxShadow: '0 8px 18px rgba(184,85,47,.28)',
};

const TABS = [
  { key: 'bed', label: 'Tipos de cama', Comp: BedTypesTab },
  { key: 'room', label: 'Tipos de habitación', Comp: RoomTypesTab },
  { key: 'amen', label: 'Amenidades', Comp: AmenitiesTab },
  { key: 'id', label: 'Tipos de identificación', Comp: IdTypesTab },
];

export default function Catalogos() {
  const [tab, setTab] = useState('bed');
  const Active = TABS.find((t) => t.key === tab).Comp;

  return (
    <div style={{ padding: '30px 34px 44px', animation: 'fadeIn .35s ease both' }}>
      <div>
        <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 29 }}>Catálogos</div>
        <div style={{ fontSize: 13.5, color: '#8A7A63', marginTop: 4 }}>
          Catálogos base que alimentan habitaciones, huéspedes y amenidades
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
        {TABS.map((t) => {
          const on = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '10px 16px', border: '1.5px solid ' + (on ? 'var(--ac, #B8552F)' : '#E4D8C0'),
              borderRadius: 11, background: on ? '#F8EDE4' : '#FFFDF7',
              fontFamily: 'Karla, sans-serif', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
              color: on ? 'var(--ac, #B8552F)' : '#6B5D4A',
            }}>{t.label}</button>
          );
        })}
      </div>

      <div style={{ marginTop: 18 }}>
        <Active />
      </div>
    </div>
  );
}
