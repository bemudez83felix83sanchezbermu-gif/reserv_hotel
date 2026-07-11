import { useFeatureFlags } from '../../shared/hooks/useFeatureFlags.jsx';

const CARD = { background: '#FFFDF7', border: '1px solid #EDE3CF', borderRadius: 15 };

const FLAG_LABELS = {
  restaurant: 'Restaurante (POS)',
  pool: 'Alberca',
  corporate: 'Empresas y tarifas corporativas',
  courtesies: 'Cortesías',
  guest_signup_required: 'Registro obligatorio en app del huésped',
  housekeeping: 'Housekeeping',
  amenity_inventory: 'Inventario de amenidades',
  surveys: 'Encuestas',
};
const FLAG_HELP = {
  restaurant: 'Habilita el módulo de restaurante (POS) cuando esté operativo.',
  pool: 'Muestra las vistas de Alberca en el menú.',
  corporate: 'Muestra Empresas y tarifas corporativas en el menú.',
  courtesies: 'Muestra Cortesías en el menú.',
  guest_signup_required: 'Exige cuenta antes de reservar en la app del huésped.',
  housekeeping: 'Muestra Housekeeping en el menú.',
  amenity_inventory: 'Muestra Amenidades en el menú.',
  surveys: 'Muestra Encuestas en el menú.',
};

export default function FeatureFlags() {
  const { flags, loading, error, setFlagEnabled, saving } = useFeatureFlags();

  return (
    <div style={{ padding: '30px 34px 44px', animation: 'fadeIn .35s ease both' }}>
      <div>
        <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 29 }}>Feature flags</div>
        <div style={{ fontSize: 13.5, color: '#8A7A63', marginTop: 4 }}>
          Enciende o apaga módulos completos — el sidebar oculta lo desactivado
        </div>
      </div>

      {error && <div style={{ marginTop: 16, padding: 12, background: '#F5E0DA', color: '#7A3B2A', borderRadius: 12, fontSize: 13.5 }}>{error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20, maxWidth: 640 }}>
        {flags.map((f) => (
          <div key={f.feature} onClick={() => setFlagEnabled(f.feature, !f.enabled)} style={{
            ...CARD, padding: 16, display: 'flex', alignItems: 'center', gap: 14, cursor: saving ? 'wait' : 'pointer',
          }}>
            <div style={{
              width: 40, height: 22, borderRadius: 99, flex: 'none',
              background: f.enabled ? '#6F7D5C' : '#D8CCB2',
              position: 'relative', transition: 'background .18s ease',
            }}>
              <div style={{
                position: 'absolute', top: 2.5, width: 17, height: 17, borderRadius: 99,
                background: '#FFFDF7', boxShadow: '0 1px 3px rgba(0,0,0,.25)',
                transition: 'left .18s ease', left: f.enabled ? 20.5 : 2.5,
              }} />
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700 }}>{FLAG_LABELS[f.feature] || f.feature}</div>
              <div style={{ fontSize: 11.5, color: '#8A7A63', marginTop: 2 }}>{FLAG_HELP[f.feature] || ''}</div>
            </div>
          </div>
        ))}
        {!loading && flags.length === 0 && (
          <div style={{ ...CARD, padding: 24, textAlign: 'center', color: '#8A7A63', fontSize: 13.5 }}>Sin feature flags registrados.</div>
        )}
      </div>
    </div>
  );
}
