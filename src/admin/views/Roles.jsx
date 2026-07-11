import { useState } from 'react';
import { useRoles } from '../../shared/hooks/useRoles.jsx';

const CARD = { background: '#FFFDF7', border: '1px solid #EDE3CF', borderRadius: 18 };
const inputStyle = {
  padding: '9px 11px', border: '1px solid #E4D8C0', borderRadius: 9,
  fontFamily: 'Karla, sans-serif', fontSize: 12.5, background: '#FFFDF7', color: '#2E2418',
};

function AccessToggle({ label, on, onClick }) {
  return (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
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
      <span style={{ fontSize: 12, color: '#6B5D4A', fontWeight: 700 }}>{label}</span>
    </div>
  );
}

function PermissionsEditor({ role, onSave }) {
  const [text, setText] = useState(JSON.stringify(role.permissions, null, 2));
  const [err, setErr] = useState('');

  const commit = () => {
    try {
      const parsed = JSON.parse(text);
      setErr('');
      onSave(parsed);
    } catch {
      setErr('JSON inválido — no se guardó');
    }
  };

  return (
    <div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} onBlur={commit} rows={5}
        style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', fontFamily: 'monospace', fontSize: 12, lineHeight: 1.5, resize: 'vertical' }} />
      {err && <div style={{ color: '#A8442C', fontSize: 11.5, marginTop: 4 }}>{err}</div>}
    </div>
  );
}

export default function Roles() {
  const { roles, loading, error, createRole, updateRole, deleteRole, saving } = useRoles();
  const [expandedId, setExpandedId] = useState(null);

  const onNew = () => createRole({ name: 'Nuevo rol', permissions: {}, hotelAccess: true, restaurantAccess: false });

  return (
    <div style={{ padding: '30px 34px 44px', animation: 'fadeIn .35s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 29 }}>Roles</div>
          <div style={{ fontSize: 13.5, color: '#8A7A63', marginTop: 4 }}>
            Permisos por rol (jsonb) y acceso a hotel / restaurante
          </div>
        </div>
        <button onClick={onNew} disabled={saving} style={{
          flex: 'none', padding: '12px 20px', border: 'none', borderRadius: 12,
          background: 'var(--ac, #B8552F)', color: '#FBF6EA',
          fontFamily: 'Karla, sans-serif', fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 8px 18px rgba(184,85,47,.28)',
        }}>+ Nuevo rol</button>
      </div>

      {error && <div style={{ marginTop: 16, padding: 12, background: '#F5E0DA', color: '#7A3B2A', borderRadius: 12, fontSize: 13.5 }}>{error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 20 }}>
        {roles.map((r) => {
          const expanded = expandedId === r.id;
          return (
            <div key={r.id} style={{ ...CARD, padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <input defaultValue={r.name} onBlur={(e) => e.target.value !== r.name && updateRole(r.id, { name: e.target.value })}
                  style={{ ...inputStyle, fontWeight: 700, fontSize: 14.5, flex: '1 1 160px' }} />
                <input defaultValue={r.description} placeholder="Descripción" onBlur={(e) => e.target.value !== r.description && updateRole(r.id, { description: e.target.value })}
                  style={{ ...inputStyle, flex: '2 1 220px' }} />
                <AccessToggle label="Hotel" on={r.hotelAccess} onClick={() => updateRole(r.id, { hotelAccess: !r.hotelAccess })} />
                <AccessToggle label="Restaurante" on={r.restaurantAccess} onClick={() => updateRole(r.id, { restaurantAccess: !r.restaurantAccess })} />
                <button onClick={() => setExpandedId(expanded ? null : r.id)} style={{
                  padding: '8px 14px', border: '1px solid #DACBAE', borderRadius: 9,
                  background: 'transparent', fontFamily: 'Karla, sans-serif', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}>{expanded ? 'Cerrar' : 'Permisos'}</button>
                <button onClick={() => deleteRole(r.id)} disabled={saving} style={{
                  width: 32, height: 32, borderRadius: '50%', border: '1px solid #E3B8AC',
                  background: 'transparent', color: '#A8442C', cursor: 'pointer', fontSize: 12.5,
                }}>✕</button>
              </div>
              {expanded && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px dashed #E9DFCC' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#8A7A63', marginBottom: 6 }}>PERMISOS (JSON)</div>
                  <PermissionsEditor role={r} onSave={(permissions) => updateRole(r.id, { permissions })} />
                </div>
              )}
            </div>
          );
        })}
        {!loading && roles.length === 0 && (
          <div style={{ ...CARD, padding: 24, textAlign: 'center', color: '#8A7A63', fontSize: 13.5 }}>Sin roles registrados.</div>
        )}
      </div>
    </div>
  );
}
