import { useState } from 'react';
import DataTable from '../../shared/ui/DataTable.jsx';
import { useStaff } from '../../shared/hooks/useStaff.jsx';
import { useRoles } from '../../shared/hooks/useRoles.jsx';

const CARD = { background: '#FFFDF7', border: '1px solid #EDE3CF', borderRadius: 18 };
const CELL_INPUT = {
  width: '100%', boxSizing: 'border-box', padding: '8px 10px',
  border: '1px solid #E4D8C0', borderRadius: 9, background: '#FDFBF4',
  fontSize: 13, outline: 'none',
};
const inputStyle = {
  padding: '9px 11px', border: '1px solid #E4D8C0', borderRadius: 9,
  fontFamily: 'Karla, sans-serif', fontSize: 12.5, background: '#FFFDF7', color: '#2E2418',
};

export default function Staff() {
  const { staff, loading, error, createStaffMirror, updateStaff, deleteStaff, saving } = useStaff();
  const { roles } = useRoles();
  const [form, setForm] = useState({ authUserId: '', roleId: '', fullName: '', phone: '' });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.authUserId.trim() || !form.roleId || !form.fullName.trim()) return;
    await createStaffMirror(form);
    setForm({ authUserId: '', roleId: '', fullName: '', phone: '' });
  };

  const columns = [
    { key: 'fullName', label: 'NOMBRE', sortable: true, render: (s) => <input defaultValue={s.fullName} onBlur={(e) => e.target.value !== s.fullName && updateStaff(s.id, { fullName: e.target.value })} style={{ ...CELL_INPUT, fontWeight: 600 }} /> },
    { key: 'phone', label: 'TELÉFONO', width: 150, render: (s) => <input defaultValue={s.phone} onBlur={(e) => e.target.value !== s.phone && updateStaff(s.id, { phone: e.target.value })} style={CELL_INPUT} /> },
    {
      key: 'roleId', label: 'ROL', width: 170,
      render: (s) => (
        <select value={s.roleId} onChange={(e) => updateStaff(s.id, { roleId: e.target.value })} style={CELL_INPUT}>
          {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      ),
    },
    {
      key: 'active', label: 'ACTIVO', align: 'center', width: 90,
      render: (s) => (
        <div onClick={() => updateStaff(s.id, { active: !s.active })} style={{ display: 'flex', justifyContent: 'center', cursor: 'pointer' }}>
          <div style={{ width: 38, height: 21, borderRadius: 99, background: s.active ? '#6F7D5C' : '#D8CCB2', position: 'relative', transition: 'background .18s ease' }}>
            <div style={{ position: 'absolute', top: 2.5, width: 16, height: 16, borderRadius: 99, background: '#FFFDF7', boxShadow: '0 1px 3px rgba(0,0,0,.25)', transition: 'left .18s ease', left: s.active ? 19.5 : 2.5 }} />
          </div>
        </div>
      ),
    },
    {
      key: 'actions', label: '', align: 'right', width: 60,
      render: (s) => (
        <button onClick={() => deleteStaff(s.id)} disabled={saving} style={{
          width: 30, height: 30, borderRadius: '50%',
          border: '1px solid #E3B8AC', background: 'transparent',
          color: '#A8442C', cursor: 'pointer', fontSize: 12.5,
        }}>✕</button>
      ),
    },
  ];

  return (
    <div style={{ padding: '30px 34px 44px', animation: 'fadeIn .35s ease both' }}>
      <div>
        <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 29 }}>Staff</div>
        <div style={{ fontSize: 13.5, color: '#8A7A63', marginTop: 4 }}>
          Personal con acceso al panel — asigna rol y estado
        </div>
      </div>

      <div style={{ ...CARD, padding: 18, marginTop: 20 }}>
        <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 18 }}>Dar de alta</div>
        <div style={{ fontSize: 12, color: '#8A7A63', marginTop: 4, lineHeight: 1.5 }}>
          Primero crea el usuario en <strong>Supabase → Authentication → Users → Add user</strong> con su email y contraseña,
          copia su UUID y pégalo aquí para crear su fila de staff con rol y datos de contacto.
        </div>
        <form onSubmit={submit} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12, alignItems: 'center' }}>
          <input placeholder="UUID de auth.users" required value={form.authUserId}
            onChange={(e) => setForm((f) => ({ ...f, authUserId: e.target.value }))} style={{ ...inputStyle, flex: '1 1 260px', fontFamily: 'monospace' }} />
          <input placeholder="Nombre completo" required value={form.fullName}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} style={{ ...inputStyle, flex: '1 1 180px' }} />
          <input placeholder="Teléfono (opcional)" value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} style={{ ...inputStyle, flex: '1 1 140px' }} />
          <select required value={form.roleId} onChange={(e) => setForm((f) => ({ ...f, roleId: e.target.value }))} style={inputStyle}>
            <option value="">Rol…</option>
            {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <button type="submit" disabled={saving} style={{
            padding: '10px 18px', border: 'none', borderRadius: 10,
            background: 'var(--ac, #B8552F)', color: '#FBF6EA',
            fontFamily: 'Karla, sans-serif', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
          }}>+ Crear</button>
        </form>
      </div>

      {error && <div style={{ marginTop: 16, padding: 12, background: '#F5E0DA', color: '#7A3B2A', borderRadius: 12, fontSize: 13.5 }}>{error}</div>}

      <div style={{ marginTop: 20 }}>
        <DataTable
          columns={columns}
          rows={staff}
          searchKeys={['fullName', 'phone', 'roleName']}
          searchPlaceholder="Buscar staff…"
          emptyMessage={loading ? 'Cargando staff…' : 'Sin staff registrado.'}
        />
      </div>
    </div>
  );
}
