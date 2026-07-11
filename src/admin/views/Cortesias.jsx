import { useState } from 'react';
import { useCourtesies, useCourtesyRedemptions } from '../../shared/hooks/useCourtesies.jsx';

const CARD = { background: '#FFFDF7', border: '1px solid #EDE3CF', borderRadius: 18 };
const chipBtn = {
  padding: '6px 11px', border: '1px solid #DACBAE', borderRadius: 9,
  background: 'transparent', color: '#2E2418',
  fontFamily: 'Karla, sans-serif', fontSize: 11, fontWeight: 700, cursor: 'pointer',
};

function RedemptionsRow({ courtesyId }) {
  const { redemptions, loading } = useCourtesyRedemptions(courtesyId);
  return (
    <div style={{ gridColumn: '1 / -1', padding: '10px 18px 14px', background: '#FAF4E6', fontSize: 12 }}>
      {loading && <span style={{ color: '#8A7A63' }}>Cargando canjes…</span>}
      {!loading && redemptions.length === 0 && (
        <span style={{ color: '#8A7A63' }}>Sin canjes registrados todavía (se conecta al POS del restaurante).</span>
      )}
      {!loading && redemptions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {redemptions.map((r) => (
            <div key={r.id} style={{ color: '#6B5D4A' }}>
              {new Date(r.created_at).toLocaleString('es-MX')} · ticket {r.ticket_id} · ${Number(r.amount).toFixed(2)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Cortesias() {
  const { courtesies, loading, error } = useCourtesies();
  const [expanded, setExpanded] = useState(null);

  return (
    <div style={{ padding: '30px 34px 44px', animation: 'fadeIn .35s ease both' }}>
      <div>
        <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 29 }}>Cortesías</div>
        <div style={{ fontSize: 13.5, color: '#8A7A63', marginTop: 4 }}>
          Saldo de cortesías por reserva · el canje se registra desde el POS del restaurante
        </div>
      </div>

      {error && <div style={{ marginTop: 16, padding: 12, background: '#F5E0DA', color: '#7A3B2A', borderRadius: 12, fontSize: 13.5 }}>{error}</div>}
      {loading && !courtesies.length && <div style={{ marginTop: 24, fontSize: 13.5, color: '#8A7A63' }}>Cargando cortesías…</div>}

      <div style={{ ...CARD, marginTop: 20, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr 1.1fr 0.8fr 0.8fr 0.9fr 1fr', gap: 10, padding: '12px 18px', fontSize: 10.5, fontWeight: 700, letterSpacing: 1, color: '#8A7A63', borderBottom: '1px solid #EDE3CF' }}>
          <div>RESERVA</div><div>HUÉSPED</div><div>HABITACIÓN</div><div>TOTAL</div><div>USADAS</div><div>DISPONIBLES</div><div />
        </div>
        {courtesies.map((c) => (
          <div key={c.id} style={{ display: 'contents' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1.3fr 1.1fr 0.8fr 0.8fr 0.9fr 1fr', gap: 10,
              padding: '12px 18px', fontSize: 12.5, alignItems: 'center', borderBottom: '1px solid #F2EADA',
            }}>
              <div style={{ fontWeight: 700, color: 'var(--ac, #B8552F)' }}>{c.reservationCode}</div>
              <div>{c.guest}</div>
              <div>{c.roomLabel}</div>
              <div>{c.totalQty}</div>
              <div>{c.usedQty}</div>
              <div style={{ fontWeight: 700, color: c.remainingQty > 0 ? '#3F6E4C' : '#93402D' }}>{c.remainingQty}</div>
              <button onClick={() => setExpanded(expanded === c.id ? null : c.id)} style={chipBtn}>
                {expanded === c.id ? 'Ocultar' : 'Ver canjes'}
              </button>
            </div>
            {expanded === c.id && <RedemptionsRow courtesyId={c.id} />}
          </div>
        ))}
        {!loading && courtesies.length === 0 && (
          <div style={{ padding: '18px', fontSize: 12.5, color: '#8A7A63' }}>No hay cortesías registradas.</div>
        )}
      </div>
    </div>
  );
}
