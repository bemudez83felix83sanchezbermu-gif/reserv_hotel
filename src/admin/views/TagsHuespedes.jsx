import DataTable from '../../shared/ui/DataTable.jsx';
import { useGuestTags } from '../../shared/hooks/useGuestTags.jsx';

const CELL_INPUT = {
  width: '100%', boxSizing: 'border-box', padding: '8px 10px',
  border: '1px solid #E4D8C0', borderRadius: 9, background: '#FDFBF4',
  fontSize: 13, outline: 'none',
};

export default function TagsHuespedes() {
  const { tags, loading, error, createTag, updateTag, deleteTag, saving } = useGuestTags();

  const onNew = () => createTag({ name: 'Nueva etiqueta', color: '#B8552F', icon: '' });

  const columns = [
    {
      key: 'name', label: 'NOMBRE', sortable: true, width: '30%',
      render: (t) => (
        <input defaultValue={t.name}
          onBlur={(e) => { if (e.target.value !== t.name) updateTag(t.id, { name: e.target.value }); }}
          style={{ ...CELL_INPUT, fontWeight: 600 }} />
      ),
    },
    {
      key: 'color', label: 'COLOR', width: 150,
      render: (t) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="color" defaultValue={t.color || '#B8552F'}
            onBlur={(e) => { if (e.target.value !== t.color) updateTag(t.id, { color: e.target.value }); }}
            style={{ width: 34, height: 30, border: '1px solid #E4D8C0', borderRadius: 8, padding: 2, background: 'transparent', cursor: 'pointer' }} />
          <span style={{
            fontSize: 10.5, fontWeight: 700, padding: '4px 10px', borderRadius: 999,
            background: (t.color || '#2E2418') + '22', color: t.color || '#2E2418',
          }}>{t.name}</span>
        </div>
      ),
    },
    {
      key: 'icon', label: 'ICONO (opcional)', width: 170,
      render: (t) => (
        <input defaultValue={t.icon} placeholder="—"
          onBlur={(e) => { if (e.target.value !== t.icon) updateTag(t.id, { icon: e.target.value }); }}
          style={CELL_INPUT} />
      ),
    },
    {
      key: 'actions', label: '', align: 'right', width: 60,
      render: (t) => (
        <button onClick={() => deleteTag(t.id)} disabled={saving} style={{
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
          <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 29 }}>Etiquetas de huéspedes</div>
          <div style={{ fontSize: 13.5, color: '#8A7A63', marginTop: 4 }}>
            Catálogo de etiquetas — asígnalas a huéspedes individualmente o en bloque desde Huéspedes
          </div>
        </div>
        <button onClick={onNew} disabled={saving} style={{
          flex: 'none', padding: '12px 20px', border: 'none', borderRadius: 12,
          background: 'var(--ac, #B8552F)', color: '#FBF6EA',
          fontFamily: 'Karla, sans-serif', fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 8px 18px rgba(184,85,47,.28)',
        }}>+ Nueva etiqueta</button>
      </div>

      {error && <div style={{ marginTop: 16, padding: 12, background: '#F5E0DA', color: '#7A3B2A', borderRadius: 12, fontSize: 13.5 }}>{error}</div>}

      <div style={{ marginTop: 20 }}>
        <DataTable
          columns={columns}
          rows={tags}
          searchKeys={['name']}
          searchPlaceholder="Buscar etiqueta…"
          emptyMessage={loading ? 'Cargando etiquetas…' : 'Sin etiquetas registradas.'}
        />
      </div>
    </div>
  );
}
