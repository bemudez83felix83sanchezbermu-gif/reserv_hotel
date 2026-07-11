import { useState } from 'react';
import { useQuery, useMutation } from '../shared/hooks/useQuery.jsx';
import { useAuth } from '../shared/hooks/useAuth.jsx';
import { fetchPOS, checkoutSale } from './data.js';
import { C, money, PageHeader, Card, Chip, Loading, ErrorBox, Modal, label, btnPrimary, btnGhost } from './ui.jsx';

const METHODS = [
  { v: 'cash', label: 'Efectivo' },
  { v: 'card', label: 'Tarjeta' },
  { v: 'transfer', label: 'Transferencia' },
];

export default function RestVender({ onGo }) {
  const { staff } = useAuth();
  const { data, loading, error, refresh } = useQuery('rest-pos', fetchPOS);
  const [filter, setFilter] = useState('all');
  const [cart, setCart] = useState({});          // menu_item_id -> qty
  const [pay, setPay] = useState(null);          // modal de cobro
  const [done, setDone] = useState(null);        // resultado de venta

  const checkout = useMutation((payload) => checkoutSale(payload), {
    invalidate: ['rest-pos', 'rest-inventory', 'rest-dashboard', 'rest-shifts', 'rest-menu-admin'],
    onSuccess: (res) => { setDone(res); setPay(null); setCart({}); refresh(); },
  });

  const cats = data?.categories || [];
  const items = data?.items || [];
  const costMap = data?.costMap || {};
  const openShift = data?.openShift;
  const counter = data?.counter;

  // vendible: activo y (sin receta => siempre) o (con receta y max_makeable > 0)
  const sellable = (it) => {
    const cm = costMap[it.id];
    if (!cm || cm.ingredients === 0) return true;
    return Number(cm.max_makeable) > 0;
  };
  const shownItems = (filter === 'all' ? items : items.filter((i) => i.category_id === filter));

  const add = (it) => setCart((c) => ({ ...c, [it.id]: (c[it.id] || 0) + 1 }));
  const dec = (id) => setCart((c) => { const n = (c[id] || 0) - 1; const nc = { ...c }; if (n <= 0) delete nc[id]; else nc[id] = n; return nc; });

  const cartLines = Object.entries(cart).map(([id, qty]) => {
    const it = items.find((x) => x.id === id);
    return it ? { it, qty, sub: Number(it.price) * qty } : null;
  }).filter(Boolean);
  const total = cartLines.reduce((a, l) => a + l.sub, 0);
  const count = cartLines.reduce((a, l) => a + l.qty, 0);

  const startPay = () => {
    if (!openShift) { if (onGo) onGo('rest-cajas'); return; }
    setPay({ method: 'cash', tip: 0 });
  };
  const confirmPay = () => {
    checkout.mutate({
      server_id: staff?.id, shift_id: openShift?.id, table_id: counter?.id,
      items: cartLines.map((l) => ({ menu_item_id: l.it.id, qty: l.qty })),
      method: pay.method, tip: Number(pay.tip) || 0,
    });
  };

  return (
    <div style={{ padding: '30px 34px 44px', animation: 'fadeIn .35s ease both' }}>
      <PageHeader
        title="Vender"
        subtitle="Punto de venta · toca un platillo para agregarlo a la cuenta"
        right={openShift
          ? <Chip tone="green">● Caja abierta · {staff?.full_name}</Chip>
          : <button onClick={() => onGo && onGo('rest-cajas')} style={btnGhost}>Abrir caja para cobrar →</button>}
      />
      <ErrorBox error={error || checkout.error} />

      {!openShift && (
        <div style={{ marginTop: 14, padding: '11px 16px', background: '#F6ECD5', borderRadius: 12, color: '#8A6A1E', fontSize: 13 }}>
          No hay turno de caja abierto. Puedes armar la cuenta, pero para <b>cobrar</b> necesitas abrir caja en <b>Cajas y cortes</b>.
        </div>
      )}

      {loading && !data ? <Loading /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 16, marginTop: 18, alignItems: 'start' }}>
          {/* Catálogo */}
          <div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
              {[{ id: 'all', name: 'Todas' }, ...cats].map((c) => {
                const on = filter === c.id;
                return <button key={c.id} onClick={() => setFilter(c.id)} style={{
                  padding: '6px 13px', borderRadius: 999, cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'Karla, sans-serif',
                  border: `1.5px solid ${on ? 'var(--ac, #B8552F)' : C.border}`, background: on ? 'var(--ac, #B8552F)' : C.paper, color: on ? '#FBF6EA' : C.sub,
                }}>{c.name}</button>;
              })}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
              {shownItems.map((it) => {
                const ok = sellable(it);
                const inCart = cart[it.id] || 0;
                const cm = costMap[it.id];
                return (
                  <button key={it.id} disabled={!ok} onClick={() => add(it)} style={{
                    textAlign: 'left', border: `1px solid ${inCart ? 'var(--ac,#B8552F)' : C.border}`, borderRadius: 14, overflow: 'hidden',
                    background: C.paper, cursor: ok ? 'pointer' : 'not-allowed', opacity: ok ? 1 : 0.5, padding: 0, position: 'relative',
                    boxShadow: inCart ? '0 0 0 2px var(--ac,#B8552F) inset' : 'none', fontFamily: 'Karla, sans-serif',
                  }}>
                    {it.image
                      ? <div style={{ height: 74, background: `#EDE3CF url(${it.image}) center/cover` }} />
                      : <div style={{ height: 74, background: 'linear-gradient(135deg,#F2E7D2,#E8D9BC)', display: 'grid', placeItems: 'center', color: '#B79A6A', fontSize: 22 }}>🍽️</div>}
                    <div style={{ padding: '8px 10px 10px' }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink, lineHeight: 1.25 }}>{it.name}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ac,#B8552F)' }}>{money(it.price)}</span>
                        {!ok && <span style={{ fontSize: 10, fontWeight: 700, color: C.red }}>Agotado</span>}
                        {ok && cm && cm.ingredients > 0 && cm.max_makeable <= 5 && <span style={{ fontSize: 10, color: '#8A6A1E' }}>quedan {cm.max_makeable}</span>}
                      </div>
                    </div>
                    {inCart > 0 && <div style={{ position: 'absolute', top: 6, right: 6, background: 'var(--ac,#B8552F)', color: '#fff', borderRadius: 999, minWidth: 20, height: 20, display: 'grid', placeItems: 'center', fontSize: 11.5, fontWeight: 700, padding: '0 5px' }}>{inCart}</div>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cuenta */}
          <Card style={{ position: 'sticky', top: 16, padding: 16 }}>
            <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 19, color: C.ink }}>Cuenta</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12, maxHeight: 340, overflowY: 'auto' }}>
              {cartLines.length === 0 && <div style={{ fontSize: 13, color: C.muted }}>Toca platillos para agregarlos.</div>}
              {cartLines.map((l) => (
                <div key={l.it.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.it.name}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{money(l.it.price)} c/u</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button onClick={() => dec(l.it.id)} style={qtyBtn}>−</button>
                    <span style={{ fontSize: 13, fontWeight: 700, width: 16, textAlign: 'center' }}>{l.qty}</span>
                    <button onClick={() => add(l.it)} style={qtyBtn}>+</button>
                  </div>
                  <span style={{ fontSize: 12.5, fontWeight: 700, width: 56, textAlign: 'right' }}>{money(l.sub)}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 14, paddingTop: 12, borderTop: `1px dashed ${C.border}` }}>
              <span style={{ fontSize: 13, color: C.sub }}>{count} artículo(s)</span>
              <span style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 26, color: C.ink }}>{money(total)}</span>
            </div>
            <button onClick={startPay} disabled={cartLines.length === 0} style={{ ...btnPrimary, width: '100%', marginTop: 12, opacity: cartLines.length === 0 ? 0.5 : 1 }}>
              {openShift ? 'Cobrar' : 'Abrir caja para cobrar'}
            </button>
            {cartLines.length > 0 && <button onClick={() => setCart({})} style={{ ...btnGhost, width: '100%', marginTop: 8 }}>Vaciar cuenta</button>}
          </Card>
        </div>
      )}

      {/* Modal de cobro */}
      {pay && (
        <Modal title="Cobrar" onClose={() => setPay(null)}
          footer={<>
            <button onClick={() => setPay(null)} style={btnGhost}>Cancelar</button>
            <button onClick={confirmPay} style={{ ...btnPrimary, opacity: checkout.loading ? 0.7 : 1 }}>{checkout.loading ? 'Cobrando…' : `Cobrar ${money(total)}`}</button>
          </>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ fontSize: 11, letterSpacing: 1.2, color: C.muted, fontWeight: 700 }}>TOTAL A COBRAR</div>
              <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 34, color: 'var(--ac,#B8552F)' }}>{money(total)}</div>
            </div>
            <div>
              <label style={label}>MÉTODO DE PAGO</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {METHODS.map((m) => (
                  <button key={m.v} onClick={() => setPay({ ...pay, method: m.v })} style={{
                    flex: 1, padding: '10px', borderRadius: 11, cursor: 'pointer', fontSize: 12.5, fontWeight: 700, fontFamily: 'Karla, sans-serif',
                    border: `1.5px solid ${pay.method === m.v ? 'var(--ac,#B8552F)' : C.border}`,
                    background: pay.method === m.v ? 'var(--ac,#B8552F)' : C.paper, color: pay.method === m.v ? '#FBF6EA' : C.sub,
                  }}>{m.label}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={label}>PROPINA $ (opcional)</label>
              <input type="number" min="0" value={pay.tip} onChange={(e) => setPay({ ...pay, tip: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: '11px 13px', border: `1px solid #E4D8C0`, borderRadius: 11, background: C.field, fontSize: 14, outline: 'none', fontFamily: 'Karla, sans-serif' }} />
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmación de venta */}
      {done && (
        <Modal title="Venta cobrada" onClose={() => setDone(null)}
          footer={<button onClick={() => setDone(null)} style={btnPrimary}>Nueva venta</button>}>
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: C.greenBg, color: C.greenDk, display: 'grid', placeItems: 'center', margin: '0 auto', fontSize: 30 }}>✓</div>
            <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 24, color: C.ink, marginTop: 12 }}>{money(done.total)}</div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Ticket registrado y descontado del inventario.</div>
          </div>
        </Modal>
      )}
    </div>
  );
}

const qtyBtn = { width: 24, height: 24, borderRadius: 7, border: `1px solid ${C.border}`, background: C.field, color: C.ink, cursor: 'pointer', fontSize: 14, fontWeight: 700, lineHeight: 1 };
