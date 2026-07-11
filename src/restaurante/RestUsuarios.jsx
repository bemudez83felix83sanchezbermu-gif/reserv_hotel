import { useQuery, useMutation } from '../shared/hooks/useQuery.jsx';
import { useAuth } from '../shared/hooks/useAuth.jsx';
import supabase from '../shared/supabase.js';
import { fetchStaff } from './data.js';
import { C, PageHeader, Card, Toggle, Chip, Select, Loading, ErrorBox } from './ui.jsx';

async function fetchRoles() {
  const { data, error } = await supabase.from('roles').select('*').order('name');
  if (error) throw error;
  return data || [];
}
async function updateStaff({ id, patch }) {
  const { data, error } = await supabase.from('staff').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

const ROLE_LABEL = { admin: 'Administrador', manager: 'Gerente', cajero: 'Cajero', mesero: 'Mesero', cocina: 'Cocina', camarista: 'Camarista', recepcion: 'Recepción' };

export default function RestUsuarios() {
  const { staff: me } = useAuth();
  const { data, loading, error, refresh } = useQuery('rest-staff', fetchStaff);
  const { data: roles } = useQuery('roles-all', fetchRoles);
  const save = useMutation((p) => updateStaff(p), { invalidate: ['rest-staff'], onSuccess: () => refresh() });

  const list = data?.list || [];
  const restRoles = (roles || []).filter((r) => r.restaurant_access);
  const active = list.filter((s) => s.active).length;

  return (
    <div style={{ padding: '30px 34px 44px', animation: 'fadeIn .35s ease both' }}>
      <PageHeader title="Usuarios y personal" subtitle={`${active} activos de ${list.length} · roles con acceso al restaurante`} />
      <ErrorBox error={error || save.error} />

      <div style={{ marginTop: 16, padding: '11px 16px', background: '#F6ECD5', borderRadius: 12, color: '#8A6A1E', fontSize: 12.5, lineHeight: 1.5 }}>
        Aquí administras el personal existente (rol, activo/inactivo). Crear un <b>nuevo login</b> requiere alta en Supabase Auth desde administración; una vez creado aparece en esta lista.
      </div>

      {loading && !data ? <Loading /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14, marginTop: 18 }}>
          {list.map((s, i) => {
            const roleName = s.roles?.name;
            const isMe = s.id === me?.id;
            return (
              <Card key={s.id} style={{ animation: `fadeUp .5s ${(0.04 + i * 0.04).toFixed(2)}s both`, opacity: s.active ? 1 : 0.6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--ac, #B8552F)', color: '#FBF6EA', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 16, flex: 'none' }}>
                    {(s.full_name || '?')[0].toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 700, color: C.ink, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {s.full_name} {isMe && <Chip tone="accent">Tú</Chip>}
                    </div>
                    <div style={{ fontSize: 12, color: C.muted }}>{s.phone || 'sin teléfono'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1, color: C.muted }}>ROL</span>
                  <Select style={{ flex: 1 }} value={s.role_id} disabled={isMe}
                    onChange={(v) => save.mutate({ id: s.id, patch: { role_id: v } })}
                    options={(roles || []).map((r) => ({ value: r.id, label: ROLE_LABEL[r.name] || r.name }))} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: `1px dashed ${C.border}` }}>
                  {roleName && <Chip tone={s.roles?.restaurant_access ? 'green' : 'neutral'}>{s.roles?.restaurant_access ? 'Acceso restaurante' : 'Solo hotel'}</Chip>}
                  <div title={isMe ? 'No puedes desactivarte a ti mismo' : ''} style={{ pointerEvents: isMe ? 'none' : 'auto', opacity: isMe ? 0.5 : 1 }}>
                    <Toggle on={s.active} onClick={() => save.mutate({ id: s.id, patch: { active: !s.active } })} labels={['Activo', 'Inactivo']} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {restRoles.length > 0 && (
        <div style={{ marginTop: 20, fontSize: 12, color: C.muted }}>
          Roles con acceso al restaurante: {restRoles.map((r) => ROLE_LABEL[r.name] || r.name).join(' · ')}
        </div>
      )}
    </div>
  );
}
