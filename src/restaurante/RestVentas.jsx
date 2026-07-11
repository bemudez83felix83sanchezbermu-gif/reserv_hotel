import { useState } from 'react';
import { useQuery } from '../shared/hooks/useQuery.jsx';
import { fetchSales } from './data.js';
import { C, money, timeOf, PageHeader, Card, StatCard, Chip, Loading, ErrorBox } from './ui.jsx';

const METHOD = { cash: 'Efectivo', card: 'Tarjeta', transfer: 'Transf.', room_charge: 'A cuarto', courtesy: 'Cortesía', comp: 'Casa' };
const STATUS = { paid: { l: 'Pagado', t: 'green' }, partial: { l: 'Parcial', t: 'gold' }, open: { l: 'Abierto', t: 'neutral' }, void: { l: 'Anulado', t: 'red' } };
const toISODate = (d) => d.toISOString().slice(0, 10);

export default function RestVentas() {
  const [day, setDay] = useState(toISODate(new Date()));
  const dateObj = new Date(day + 'T12:00:00');
  const { data, loading, error } = useQuery(`rest-sales-${day}`, () => fetchSales(dateObj));

  const tickets = data || [];
  const paid = tickets.filter((t) => t.status === 'paid' || t.status === 'partial');
  const revenue = paid.reduce((a, t) => a + Number(t.total || 0), 0);
  const byMethod = {};
  tickets.forEach((t) => (t.ticket_payments || []).forEach((p) => { byMethod[p.method] = (byMethod[p.method] || 0) + Number(p.amount || 0); }));
  const tips = tickets.reduce((a, t) => a + (t.ticket_payments || []).reduce((s, p) => s + Number(p.tip_amount || 0), 0), 0);

  const shift = (dir) => { const d = new Date(dateObj); d.setDate(d.getDate() + dir); setDay(toISODate(d)); };

  return (
    <div style={{ padding: '30px 34px 44px', animation: 'fadeIn .35s ease both' }}>
      <PageHeader
        title="Ventas"
        subtitle="Tickets cobrados y desglose por método de pago"
        right={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => shift(-1)} style={{ ...btnNav }}>‹</button>
            <input type="date" value={day} onChange={(e) => setDay(e.target.value)} style={{ padding: '9px 12px', border: `1px solid ${C.border}`, borderRadius: 10, background: C.field, color: C.ink, fontFamily: 'Karla, sans-serif', fontSize: 13 }} />
            <button onClick={() => shift(1)} style={{ ...btnNav }}>›</button>
          </div>
        }
      />
      <ErrorBox error={error} />

      {loading && !data ? <Loading /> : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginTop: 20 }}>
            <StatCard i={0} label="Total del día" value={money(revenue)} accent="var(--ac, #B8552F)" />
            <StatCard i={1} label="Tickets" value={paid.length} />
            <StatCard i={2} label="Ticket promedio" value={money(paid.length ? revenue / paid.length : 0)} />
            <StatCard i={3} label="Propinas" value={money(tips)} accent={C.greenDk} />
          </div>

          {Object.keys(byMethod).length > 0 && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
              {Object.entries(byMethod).sort((a, b) => b[1] - a[1]).map(([m, v]) => (
                <Chip key={m} tone="accent">{METHOD[m] || m}: {money(v)}</Chip>
              ))}
            </div>
          )}

          <Card style={{ padding: 0, overflow: 'hidden', marginTop: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.4fr 1fr auto', gap: 8, padding: '12px 18px', background: '#F7F0E1', fontSize: 10.5, fontWeight: 700, letterSpacing: 1, color: C.muted }}>
              <div>HORA</div><div>MESA</div><div>MÉTODO(S)</div><div style={{ textAlign: 'right' }}>TOTAL</div><div style={{ textAlign: 'right' }}>ESTADO</div>
            </div>
            {tickets.length === 0 && <div style={{ padding: 26, color: C.muted, fontSize: 14, textAlign: 'center' }}>Sin ventas registradas este día.</div>}
            {tickets.map((t) => {
              const st = STATUS[t.status] || { l: t.status, t: 'neutral' };
              const methods = [...new Set((t.ticket_payments || []).map((p) => METHOD[p.method] || p.method))].join(', ') || '—';
              return (
                <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.4fr 1fr auto', gap: 8, padding: '12px 18px', borderTop: `1px solid ${C.border}`, alignItems: 'center', fontSize: 13.5 }}>
                  <div style={{ color: C.sub }}>{timeOf(t.created_at)}</div>
                  <div style={{ color: C.ink, fontWeight: 700 }}>{t.orders?.tables?.num ? `Mesa ${t.orders.tables.num}` : '—'}</div>
                  <div style={{ color: C.sub }}>{methods}</div>
                  <div style={{ textAlign: 'right', fontWeight: 700, color: C.ink }}>{money(t.total)}</div>
                  <div style={{ textAlign: 'right' }}><Chip tone={st.t}>{st.l}</Chip></div>
                </div>
              );
            })}
          </Card>
        </>
      )}
    </div>
  );
}

const btnNav = { width: 34, height: 34, borderRadius: 9, border: `1px solid ${C.border}`, background: C.paper, color: C.sub, cursor: 'pointer', fontSize: 16, fontWeight: 700 };
