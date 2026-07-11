import { useState } from 'react';
import DataTable from '../../shared/ui/DataTable.jsx';
import GuestModal from '../components/GuestModal.jsx';
import { useGuests } from '../../shared/hooks/useGuests.jsx';
import { useGuestTags } from '../../shared/hooks/useGuestTags.jsx';

const inputStyle = {
  padding: '8px 11px', border: '1px solid #E4D8C0', borderRadius: 9,
  fontFamily: 'Karla, sans-serif', fontSize: 12.5, background: '#FFFDF7', color: '#2E2418',
};

export default function Huespedes() {
  const { guests, loading, error, createGuest, updateGuest, deleteGuest, toggleGuestTag, bulkAssignTag, saving } = useGuests();
  const { tags } = useGuestTags();
  const [editing, setEditing] = useState(null); // { guest } | { guest: null } para nuevo | null cerrado
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(() => new Set());
  const [bulkTagId, setBulkTagId] = useState('');

  const toggleSelect = (id) => setSelected((s) => {
    const next = new Set(s);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const applyBulkTag = async () => {
    if (!bulkTagId || selected.size === 0) return;
    await bulkAssignTag([...selected], bulkTagId);
    setSelected(new Set());
    setBulkTagId('');
  };

  const openEdit = (g) => { setEditing(g); setOpen(true); };
  const close = () => setOpen(false);

  const onSave = async (draft) => {
    try {
      if (draft.id) await updateGuest(draft.id, draft);
      else await createGuest(draft);
      close();
    } catch (e) {
      console.error('saveGuest failed', e);
    }
  };
  const onDelete = async (id) => {
    try { await deleteGuest(id); close(); } catch (e) { console.error('deleteGuest failed', e); }
  };

  const columns = [
    {
      key: 'sel', label: '', width: 34,
      render: (g) => (
        <input type="checkbox" checked={selected.has(g.id)} onChange={() => toggleSelect(g.id)} style={{ cursor: 'pointer' }} />
      ),
    },
    { key: 'fullName', label: 'NOMBRE', sortable: true, render: (g) => <span style={{ fontWeight: 700 }}>{g.fullName}</span> },
    { key: 'email', label: 'EMAIL', sortable: true },
    { key: 'phone', label: 'TELÉFONO' },
    {
      key: 'tags', label: 'ETIQUETAS',
      render: (g) => (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(g.tags || []).map((t) => (
            <span key={t.id} style={{
              fontSize: 10.5, fontWeight: 700, padding: '3px 9px', borderRadius: 999,
              background: (t.color || '#2E2418') + '22', color: t.color || '#2E2418',
            }}>{t.name}</span>
          ))}
          {!g.tags?.length && <span style={{ color: '#C4B79A' }}>—</span>}
        </div>
      ),
    },
    {
      key: 'actions', label: '', align: 'right', width: 90,
      render: (g) => (
        <button onClick={() => openEdit(g)} style={{
          padding: '8px 14px', border: '1px solid #DACBAE', borderRadius: 9,
          background: 'transparent', color: '#2E2418',
          fontFamily: 'Karla, sans-serif', fontSize: 12, fontWeight: 700, cursor: 'pointer',
        }}>Ver</button>
      ),
    },
  ];

  return (
    <div style={{ padding: '30px 34px 44px', animation: 'fadeIn .35s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 29 }}>Huéspedes</div>
          <div style={{ fontSize: 13.5, color: '#8A7A63', marginTop: 4 }}>
            Directorio de huéspedes, sus etiquetas y su historial de estancias
          </div>
        </div>
        <button onClick={() => openEdit(null)} style={{
          flex: 'none', padding: '12px 20px', border: 'none', borderRadius: 12,
          background: 'var(--ac, #B8552F)', color: '#FBF6EA',
          fontFamily: 'Karla, sans-serif', fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 8px 18px rgba(184,85,47,.28)',
        }}>+ Nuevo huésped</button>
      </div>

      {error && <div style={{ marginTop: 16, padding: 12, background: '#F5E0DA', color: '#7A3B2A', borderRadius: 12, fontSize: 13.5 }}>{error}</div>}

      <div style={{ marginTop: 20 }}>
        <DataTable
          columns={columns}
          rows={guests}
          searchKeys={['fullName', 'email', 'phone']}
          searchPlaceholder="Buscar huésped…"
          emptyMessage={loading ? 'Cargando huéspedes…' : 'Sin huéspedes registrados.'}
          toolbarExtra={selected.size > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12.5, color: '#6B5D4A', fontWeight: 700 }}>{selected.size} seleccionado{selected.size > 1 ? 's' : ''}</span>
              <select value={bulkTagId} onChange={(e) => setBulkTagId(e.target.value)} style={inputStyle}>
                <option value="">Aplicar etiqueta…</option>
                {tags.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <button onClick={applyBulkTag} disabled={!bulkTagId || saving} style={{
                padding: '8px 14px', border: 'none', borderRadius: 9,
                background: 'var(--ac, #B8552F)', color: '#FBF6EA',
                fontFamily: 'Karla, sans-serif', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}>Aplicar</button>
              <button onClick={() => setSelected(new Set())} style={{
                border: 'none', background: 'transparent', color: '#8A7A63',
                fontFamily: 'Karla, sans-serif', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}>Cancelar</button>
            </div>
          )}
        />
      </div>

      {open && (
        <GuestModal
          guest={editing}
          onClose={close}
          onSave={onSave}
          onDelete={onDelete}
          onToggleTag={toggleGuestTag}
          saving={saving}
        />
      )}
    </div>
  );
}
