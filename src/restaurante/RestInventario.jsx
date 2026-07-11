import { useState } from 'react';
import { useQuery, useMutation } from '../shared/hooks/useQuery.jsx';
import { useAuth } from '../shared/hooks/useAuth.jsx';
import { fetchInventory, upsertProduct, applyStockMovement } from './data.js';
import { C, money, dateOf, PageHeader, Card, Chip, Loading, ErrorBox, Modal, Select, input, label, btnPrimary, btnGhost } from './ui.jsx';

const MOVE = [
  { v: 'in', label: 'Entrada', tone: 'green' },
  { v: 'restock', label: 'Reabasto', tone: 'green' },
  { v: 'out', label: 'Salida', tone: 'neutral' },
  { v: 'waste', label: 'Merma', tone: 'red' },
  { v: 'adjustment', label: 'Ajuste', tone: 'gold' },
];
const moveMeta = (v) => MOVE.find((m) => m.v === v) || { label: v, tone: 'neutral' };

export default function RestInventario() {
  const { staff } = useAuth();
  const { data, loading, error, refresh } = useQuery('rest-inventory', fetchInventory);
  const [prodDraft, setProdDraft] = useState(null);
  const [moveDraft, setMoveDraft] = useState(null);

  const saveProd = useMutation((p) => upsertProduct(p), { invalidate: 'rest-inventory', onSuccess: () => { setProdDraft(null); refresh(); } });
  const doMove = useMutation((m) => applyStockMovement(m), { invalidate: 'rest-inventory', onSuccess: () => { setMoveDraft(null); refresh(); } });

  const products = data?.products || [];
  const units = data?.units || [];
  const movements = data?.movements || [];
  const low = products.filter((p) => Number(p.current_stock) < Number(p.min_stock));
  const invValue = products.reduce((a, p) => a + Number(p.current_stock) * Number(p.avg_cost), 0);

  const newProduct = () => setProdDraft({ name: '', unit_id: units[0]?.id, current_stock: 0, avg_cost: 0, min_stock: 0, active: true });

  return (
    <div style={{ padding: '30px 34px 44px', animation: 'fadeIn .35s ease both' }}>
      <PageHeader
        title="Inventario"
        subtitle={`${products.length} productos · valor estimado ${money(invValue)}`}
        right={<button onClick={newProduct} style={btnPrimary}>+ Producto</button>}
      />
      <ErrorBox error={error || saveProd.error || doMove.error} />

      {low.length > 0 && (
        <div style={{ marginTop: 16, padding: '11px 16px', background: C.redBg, borderRadius: 12, color: '#7A3B2A', fontSize: 13.5, fontWeight: 700 }}>
          ⚠ {low.length} producto(s) bajo el mínimo: {low.map((p) => p.name).join(', ')}
        </div>
      )}

      {loading && !data ? <Loading /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(280px, 340px)', gap: 16, marginTop: 18, alignItems: 'start' }}>
          {/* Tabla de productos */}
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 8, padding: '12px 18px', background: '#F7F0E1', fontSize: 10.5, fontWeight: 700, letterSpacing: 1, color: C.muted }}>
              <div>PRODUCTO</div><div style={{ textAlign: 'right' }}>STOCK</div><div style={{ textAlign: 'right' }}>MÍNIMO</div><div style={{ textAlign: 'right' }}>COSTO PROM.</div><div />
            </div>
            {products.map((p) => {
              const lowP = Number(p.current_stock) < Number(p.min_stock);
              return (
                <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 8, padding: '12px 18px', borderTop: `1px solid ${C.border}`, alignItems: 'center', fontSize: 13.5 }}>
                  <div>
                    <div style={{ fontWeight: 700, color: C.ink }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{p.units?.name}</div>
                  </div>
                  <div style={{ textAlign: 'right', fontWeight: 700, color: lowP ? C.red : C.ink }}>{Number(p.current_stock)} {p.units?.symbol}</div>
                  <div style={{ textAlign: 'right', color: C.sub }}>{Number(p.min_stock)}</div>
                  <div style={{ textAlign: 'right', color: C.sub }}>{money(p.avg_cost)}</div>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button onClick={() => setMoveDraft({ product_id: p.id, product: p, type: 'in', qty: 1, unit_cost: p.avg_cost, reason: '' })} title="Movimiento" style={{ ...btnGhost, padding: '6px 10px' }}>± Stock</button>
                    <button onClick={() => setProdDraft({ ...p })} style={{ ...btnGhost, padding: '6px 10px' }}>Editar</button>
                  </div>
                </div>
              );
            })}
            {products.length === 0 && <div style={{ padding: 24, color: C.muted, fontSize: 14 }}>Sin productos todavía.</div>}
          </Card>

          {/* Movimientos recientes */}
          <Card>
            <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 18, color: C.ink }}>Movimientos recientes</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12, maxHeight: 460, overflowY: 'auto' }}>
              {movements.length === 0 && <div style={{ fontSize: 13, color: C.muted }}>Sin movimientos aún.</div>}
              {movements.map((m) => {
                const meta = moveMeta(m.type);
                return (
                  <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '8px 10px', background: C.field, borderRadius: 10 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.products?.name}</div>
                      <div style={{ fontSize: 10.5, color: C.muted }}>{dateOf(m.created_at)}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 'none' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: C.sub }}>{Number(m.qty)}</span>
                      <Chip tone={meta.tone}>{meta.label}</Chip>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Modal producto */}
      {prodDraft && (
        <Modal
          title={prodDraft.id ? 'Editar producto' : 'Nuevo producto'}
          onClose={() => setProdDraft(null)}
          footer={<>
            <button onClick={() => setProdDraft(null)} style={btnGhost}>Cancelar</button>
            <button onClick={() => prodDraft.name.trim() && saveProd.mutate(prodDraft)} style={{ ...btnPrimary, opacity: saveProd.loading ? 0.7 : 1 }}>{saveProd.loading ? 'Guardando…' : 'Guardar'}</button>
          </>}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={label}>NOMBRE</label>
              <input autoFocus value={prodDraft.name} onChange={(e) => setProdDraft({ ...prodDraft, name: e.target.value })} style={input} placeholder="Tocino" />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={label}>UNIDAD</label>
                <Select value={prodDraft.unit_id} onChange={(v) => setProdDraft({ ...prodDraft, unit_id: Number(v) })}
                  options={units.map((u) => ({ value: u.id, label: `${u.name} (${u.symbol})` }))} />
              </div>
              <div style={{ width: 110 }}>
                <label style={label}>MÍN.</label>
                <input type="number" min="0" value={prodDraft.min_stock} onChange={(e) => setProdDraft({ ...prodDraft, min_stock: Number(e.target.value) || 0 })} style={input} />
              </div>
            </div>
            {!prodDraft.id && (
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={label}>STOCK INICIAL</label>
                  <input type="number" min="0" value={prodDraft.current_stock} onChange={(e) => setProdDraft({ ...prodDraft, current_stock: Number(e.target.value) || 0 })} style={input} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={label}>COSTO PROM. $</label>
                  <input type="number" min="0" value={prodDraft.avg_cost} onChange={(e) => setProdDraft({ ...prodDraft, avg_cost: Number(e.target.value) || 0 })} style={input} />
                </div>
              </div>
            )}
            {prodDraft.id && <div style={{ fontSize: 12, color: C.muted }}>El stock y el costo se ajustan con movimientos (± Stock), no directamente.</div>}
          </div>
        </Modal>
      )}

      {/* Modal movimiento */}
      {moveDraft && (
        <Modal
          title={`Movimiento · ${moveDraft.product?.name}`}
          onClose={() => setMoveDraft(null)}
          footer={<>
            <button onClick={() => setMoveDraft(null)} style={btnGhost}>Cancelar</button>
            <button onClick={() => moveDraft.qty > 0 && doMove.mutate({ product_id: moveDraft.product_id, type: moveDraft.type, qty: Number(moveDraft.qty), unit_cost: (moveDraft.type === 'in' || moveDraft.type === 'restock') ? Number(moveDraft.unit_cost) : null, reason: moveDraft.reason, created_by: staff?.id })} style={{ ...btnPrimary, opacity: doMove.loading ? 0.7 : 1 }}>{doMove.loading ? 'Aplicando…' : 'Aplicar'}</button>
          </>}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 13, color: C.sub }}>Stock actual: <b>{Number(moveDraft.product?.current_stock)} {moveDraft.product?.units?.symbol}</b></div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {MOVE.map((m) => (
                <button key={m.v} onClick={() => setMoveDraft({ ...moveDraft, type: m.v })} style={{
                  padding: '8px 13px', borderRadius: 999, cursor: 'pointer', fontSize: 12.5, fontWeight: 700, fontFamily: 'Karla, sans-serif',
                  border: `1.5px solid ${moveDraft.type === m.v ? 'var(--ac, #B8552F)' : C.border}`,
                  background: moveDraft.type === m.v ? 'var(--ac, #B8552F)' : C.paper, color: moveDraft.type === m.v ? '#FBF6EA' : C.sub,
                }}>{m.label}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={label}>{moveDraft.type === 'adjustment' ? 'DELTA (± con signo)' : 'CANTIDAD'}</label>
                <input type="number" autoFocus value={moveDraft.qty} onChange={(e) => setMoveDraft({ ...moveDraft, qty: e.target.value })} style={input} />
              </div>
              {(moveDraft.type === 'in' || moveDraft.type === 'restock') && (
                <div style={{ flex: 1 }}>
                  <label style={label}>COSTO UNIT. $</label>
                  <input type="number" min="0" value={moveDraft.unit_cost} onChange={(e) => setMoveDraft({ ...moveDraft, unit_cost: e.target.value })} style={input} />
                </div>
              )}
            </div>
            <div>
              <label style={label}>MOTIVO / NOTA</label>
              <input value={moveDraft.reason} onChange={(e) => setMoveDraft({ ...moveDraft, reason: e.target.value })} style={input} placeholder="Compra semanal, merma por caducidad…" />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
