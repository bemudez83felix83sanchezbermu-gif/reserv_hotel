import { useState } from 'react';
import { useAmenityProducts, useAmenityMovements } from '../../shared/hooks/useAmenities.jsx';

const CARD = { background: '#FFFDF7', border: '1px solid #EDE3CF', borderRadius: 18 };
const MOVE_TYPES = ['in', 'out', 'waste', 'adjustment', 'restock'];
const MOVE_LABELS = { in: 'Entrada', out: 'Salida', waste: 'Merma', adjustment: 'Ajuste', restock: 'Reabasto' };
const inputStyle = {
  padding: '9px 11px', border: '1px solid #E4D8C0', borderRadius: 9,
  fontFamily: 'Karla, sans-serif', fontSize: 12.5, background: '#FFFDF7', color: '#2E2418',
};
const chipBtn = {
  padding: '8px 14px', border: '1px solid #DACBAE', borderRadius: 9,
  background: 'transparent', color: '#2E2418',
  fontFamily: 'Karla, sans-serif', fontSize: 12, fontWeight: 700, cursor: 'pointer',
};

function ProductCard({ p, onSave, onDelete, saving }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(p);
  const low = p.currentStock < p.minStock;

  if (editing) {
    return (
      <div style={{ ...CARD, padding: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} style={inputStyle} placeholder="Nombre" />
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={draft.unit} onChange={(e) => setDraft((d) => ({ ...d, unit: e.target.value }))} style={{ ...inputStyle, flex: 1 }} placeholder="Unidad" />
            <input type="number" value={draft.minStock} onChange={(e) => setDraft((d) => ({ ...d, minStock: Number(e.target.value) || 0 }))} style={{ ...inputStyle, width: 90 }} placeholder="Mín." />
            <input type="number" value={draft.avgCost} onChange={(e) => setDraft((d) => ({ ...d, avgCost: Number(e.target.value) || 0 }))} style={{ ...inputStyle, width: 90 }} placeholder="Costo" />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button onClick={() => { onSave(draft); setEditing(false); }} disabled={saving} style={{ ...chipBtn, background: 'var(--ac, #B8552F)', color: '#FBF6EA', border: 'none' }}>Guardar</button>
            <button onClick={() => { setDraft(p); setEditing(false); }} style={chipBtn}>Cancelar</button>
            <button onClick={() => onDelete(p.id)} style={{ ...chipBtn, color: '#93402D', borderColor: '#D49B8B', marginLeft: 'auto' }}>Eliminar</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...CARD, padding: 16, borderColor: low ? '#D49B8B' : '#EDE3CF' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
        <div>
          <div style={{ fontSize: 14.5, fontWeight: 700 }}>{p.name}</div>
          <div style={{ fontSize: 11.5, color: '#8A7A63', marginTop: 2 }}>{p.unit} · costo prom. ${p.avgCost.toFixed(2)}</div>
        </div>
        {low && (
          <span style={{ fontSize: 10.5, fontWeight: 700, color: '#93402D', background: '#F5E0DA', borderRadius: 999, padding: '4px 10px', height: 'fit-content' }}>
            Stock bajo
          </span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#8A7A63' }}>ACTUAL</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: low ? '#93402D' : '#3F6E4C' }}>{p.currentStock}</div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#8A7A63' }}>MÍNIMO</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{p.minStock}</div>
        </div>
      </div>
      <button onClick={() => setEditing(true)} style={{ ...chipBtn, marginTop: 12 }}>Editar</button>
    </div>
  );
}

export default function Amenidades({ rooms }) {
  const { products, saveProduct, deleteProduct, saving: savingProduct } = useAmenityProducts();
  const { movements, createMovement, saving: savingMove } = useAmenityMovements();

  const [newProduct, setNewProduct] = useState({ name: '', unit: 'pza', minStock: 0, avgCost: 0 });
  const [moveForm, setMoveForm] = useState({ productId: '', type: 'in', qty: '', refRoomId: '', reason: '' });

  const submitProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name.trim()) return;
    await saveProduct(newProduct);
    setNewProduct({ name: '', unit: 'pza', minStock: 0, avgCost: 0 });
  };

  const submitMove = async (e) => {
    e.preventDefault();
    if (!moveForm.productId || !moveForm.qty) return;
    await createMovement({
      productId: moveForm.productId,
      type: moveForm.type,
      qty: Number(moveForm.qty),
      refRoomId: moveForm.refRoomId || null,
      reason: moveForm.reason.trim(),
    });
    setMoveForm({ productId: '', type: 'in', qty: '', refRoomId: '', reason: '' });
  };

  return (
    <div style={{ padding: '30px 34px 44px', animation: 'fadeIn .35s ease both' }}>
      <div>
        <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 29 }}>Amenidades</div>
        <div style={{ fontSize: 13.5, color: '#8A7A63', marginTop: 4 }}>
          Inventario de toallas, shampoo y demás consumibles de habitación
        </div>
      </div>

      <div style={{ ...CARD, padding: 18, marginTop: 20 }}>
        <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 18 }}>Nuevo producto</div>
        <form onSubmit={submitProduct} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12, alignItems: 'center' }}>
          <input required placeholder="Nombre" value={newProduct.name} onChange={(e) => setNewProduct((f) => ({ ...f, name: e.target.value }))} style={inputStyle} />
          <input placeholder="Unidad" value={newProduct.unit} onChange={(e) => setNewProduct((f) => ({ ...f, unit: e.target.value }))} style={{ ...inputStyle, width: 90 }} />
          <input type="number" placeholder="Stock mínimo" value={newProduct.minStock} onChange={(e) => setNewProduct((f) => ({ ...f, minStock: Number(e.target.value) || 0 }))} style={{ ...inputStyle, width: 110 }} />
          <input type="number" placeholder="Costo prom." value={newProduct.avgCost} onChange={(e) => setNewProduct((f) => ({ ...f, avgCost: Number(e.target.value) || 0 }))} style={{ ...inputStyle, width: 110 }} />
          <button type="submit" disabled={savingProduct} style={{
            padding: '10px 18px', border: 'none', borderRadius: 10,
            background: 'var(--ac, #B8552F)', color: '#FBF6EA',
            fontFamily: 'Karla, sans-serif', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
          }}>+ Crear</button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14, marginTop: 16 }}>
        {products.map((p) => (
          <ProductCard key={p.id} p={p} onSave={(draft) => saveProduct(draft)} onDelete={deleteProduct} saving={savingProduct} />
        ))}
        {products.length === 0 && (
          <div style={{ fontSize: 12.5, color: '#8A7A63' }}>No hay productos registrados.</div>
        )}
      </div>

      <div style={{ ...CARD, padding: 18, marginTop: 20 }}>
        <div style={{ fontFamily: 'Marcellus, Georgia, serif', fontSize: 18 }}>Registrar movimiento</div>
        <form onSubmit={submitMove} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12, alignItems: 'center' }}>
          <select required value={moveForm.productId} onChange={(e) => setMoveForm((f) => ({ ...f, productId: e.target.value }))} style={inputStyle}>
            <option value="">Producto…</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={moveForm.type} onChange={(e) => setMoveForm((f) => ({ ...f, type: e.target.value }))} style={inputStyle}>
            {MOVE_TYPES.map((t) => <option key={t} value={t}>{MOVE_LABELS[t]}</option>)}
          </select>
          <input required type="number" step="0.001" placeholder="Cantidad" value={moveForm.qty} onChange={(e) => setMoveForm((f) => ({ ...f, qty: e.target.value }))} style={{ ...inputStyle, width: 110 }} />
          <select value={moveForm.refRoomId} onChange={(e) => setMoveForm((f) => ({ ...f, refRoomId: e.target.value }))} style={inputStyle}>
            <option value="">Sin habitación</option>
            {rooms.map((r) => <option key={r.id} value={r.id}>Hab. {r.num}</option>)}
          </select>
          <input placeholder="Motivo (opcional)" value={moveForm.reason} onChange={(e) => setMoveForm((f) => ({ ...f, reason: e.target.value }))} style={{ ...inputStyle, flex: '1 1 160px' }} />
          <button type="submit" disabled={savingMove} style={{
            padding: '10px 18px', border: 'none', borderRadius: 10,
            background: 'var(--ac, #B8552F)', color: '#FBF6EA',
            fontFamily: 'Karla, sans-serif', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
          }}>+ Registrar</button>
        </form>
      </div>

      <div style={{ ...CARD, marginTop: 16, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.9fr 0.7fr 1fr 1.3fr 1fr', gap: 10, padding: '12px 18px', fontSize: 10.5, fontWeight: 700, letterSpacing: 1, color: '#8A7A63', borderBottom: '1px solid #EDE3CF' }}>
          <div>PRODUCTO</div><div>TIPO</div><div>CANT.</div><div>HABITACIÓN</div><div>MOTIVO</div><div>FECHA</div>
        </div>
        {movements.slice(0, 30).map((m) => {
          const prod = products.find((p) => p.id === m.productId);
          return (
            <div key={m.id} style={{
              display: 'grid', gridTemplateColumns: '1.2fr 0.9fr 0.7fr 1fr 1.3fr 1fr', gap: 10,
              padding: '11px 18px', fontSize: 12.5, alignItems: 'center', borderBottom: '1px solid #F2EADA',
            }}>
              <div style={{ fontWeight: 700 }}>{prod?.name || '—'}</div>
              <div>{MOVE_LABELS[m.type] || m.type}</div>
              <div>{m.qty}</div>
              <div>{m.refRoomLabel || '—'}</div>
              <div style={{ color: '#6B5D4A' }}>{m.reason || '—'}</div>
              <div style={{ color: '#8A7A63' }}>{new Date(m.createdAt).toLocaleDateString('es-MX')}</div>
            </div>
          );
        })}
        {movements.length === 0 && (
          <div style={{ padding: '18px', fontSize: 12.5, color: '#8A7A63' }}>No hay movimientos registrados.</div>
        )}
      </div>
    </div>
  );
}
