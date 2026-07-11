import { useQuery } from '../shared/hooks/useQuery.jsx';
import { useAuth } from '../shared/hooks/useAuth.jsx';
import { fetchDashboard } from './data.js';
import { C, money, timeOf, PageHeader, Card, StatCard, Chip, Loading, ErrorBox } from './ui.jsx';

const METHOD_LABEL = { cash: 'Efectivo', card: 'Tarjeta', transfer: 'Transferencia', room_charge: 'Cargo a cuarto', courtesy: 'Cortesía', comp: 'Cortesía casa' };

export default function RestPanel({ onGo }) {
  const { staff } = useAuth();
  const { data, loading, error, refresh } = useQuery('rest-dashboard', () => fetchDashboard());

  return (
    <div style={{ padding: '30px 34px 44px', animation: 'fadeIn .35s ease both' }}>
      <PageHeader
        title="Panel · La Paradita"
        subtitle={`Restaurante del hotel · ${new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}`}
        right={<button onClick={refresh} style={{ padding: '9px 15px', border: `1px solid ${C.border}`, borderRadius: 10, background: 'transparent', color: C.sub, fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>↻ Actualizar</button>}
      />

      <ErrorBox error={error} />
      {loading && !data ? <Loading /> : data && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginTop: 20 }}>
            <StatCard i={0} label="Ventas de hoy" value={money(data.revenue)} accent="var(--ac, #B8552F)" hint={`${data.ticketCount} tickets cobrados`} />
            <StatCard i={1} label="Ticket promedio" value={money(data.avgTicket)} />
            <StatCard i={2} label="Turno de caja" value={data.openShift ? 'Abierto' : 'Cerrado'} accent={data.openShift ? C.greenDk : C.muted} hint={data.openShift ? `desde ${timeOf(data.openShift.opened_at)}` : 'sin turno activo'} />
            <StatCard i={3} label="Alertas de stock" value={data.lowStock.length} accent={data.lowStock.length ? C.red : C.greenDk} hint={data.lowStock.length ? 'productos bajo mínimo' : 'inventario en orden'} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(280px, 360px)', gap: 16, marginTop: 16, alignItems: 'start' }}>
            {/* Caja activa */}
            <Card style={{ animation: 'fadeUp .5s .1s both' }}>
              <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 19, color: C.ink }}>Caja en operación</div>
              {data.openShift ? (
                <div style={{ marginTop: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: C.greenBg, borderRadius: 13 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: C.greenDk, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700 }}>
                      {(staff?.full_name || 'C')[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: C.ink }}>Cobrando ahora</div>
                      <div style={{ fontSize: 12.5, color: C.sub }}>Abrió a las {timeOf(data.openShift.opened_at)} · fondo {money(data.openShift.opened_cash)}</div>
                    </div>
                    <Chip tone="green">● En vivo</Chip>
                  </div>
                  <button onClick={() => onGo && onGo('rest-cajas')} style={{ marginTop: 12, padding: '9px 15px', border: `1px solid ${C.border}`, borderRadius: 10, background: 'transparent', color: C.sub, fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>
                    Ir a corte de caja →
                  </button>
                </div>
              ) : (
                <div style={{ marginTop: 12, fontSize: 13.5, color: C.muted, lineHeight: 1.6 }}>
                  No hay turno de caja abierto. Abre uno en <b>Cajas y cortes</b> para empezar a registrar cobros.
                  <div><button onClick={() => onGo && onGo('rest-cajas')} style={{ marginTop: 12, padding: '9px 15px', border: `1px solid ${C.border}`, borderRadius: 10, background: 'transparent', color: C.sub, fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>Abrir turno →</button></div>
                </div>
              )}

              {/* Desglose por método */}
              <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px dashed ${C.border}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: C.muted, marginBottom: 10 }}>COBRADO HOY POR MÉTODO</div>
                {Object.keys(data.byMethod).length === 0 ? (
                  <div style={{ fontSize: 13, color: C.muted }}>Aún no hay cobros registrados hoy.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {Object.entries(data.byMethod).sort((a, b) => b[1] - a[1]).map(([m, v]) => (
                      <div key={m} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
                        <span style={{ color: C.sub }}>{METHOD_LABEL[m] || m}</span>
                        <b style={{ color: C.ink }}>{money(v)}</b>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Stock bajo */}
            <Card style={{ animation: 'fadeUp .5s .16s both' }}>
              <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 19, color: C.ink }}>Stock bajo mínimo</div>
              {data.lowStock.length === 0 ? (
                <div style={{ marginTop: 12, fontSize: 13.5, color: C.greenDk }}>✓ Todo el inventario está por encima del mínimo.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                  {data.lowStock.map((p) => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', background: C.redBg, borderRadius: 11 }}>
                      <span style={{ fontWeight: 700, color: C.ink, fontSize: 13.5 }}>{p.name}</span>
                      <Chip tone="red">{Number(p.current_stock)} {p.units?.symbol} · min {Number(p.min_stock)}</Chip>
                    </div>
                  ))}
                  <button onClick={() => onGo && onGo('rest-inv')} style={{ marginTop: 4, padding: '9px 15px', border: `1px solid ${C.border}`, borderRadius: 10, background: 'transparent', color: C.sub, fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>Ir a inventario →</button>
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
