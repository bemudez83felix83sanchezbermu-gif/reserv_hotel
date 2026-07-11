import { useState } from 'react';
import { useQuery, useMutation } from '../shared/hooks/useQuery.jsx';
import { fetchMenuAdmin, upsertMenuItem, deleteMenuItem, saveRecipe } from './data.js';
import { C, money, PageHeader, Card, Toggle, Chip, Loading, ErrorBox, Modal, Select, ImageUpload, input, label, btnPrimary, btnGhost } from './ui.jsx';
import MenuPrint from './RestMenuPrint.jsx';

const emptyItem = (categoryId) => ({ category_id: categoryId || null, name: '', price: 0, description: '', image: null, active: true });

export default function RestMenu() {
  const { data, loading, error, refresh } = useQuery('rest-menu-admin', fetchMenuAdmin);
  const [filter, setFilter] = useState('all');
  const [draft, setDraft] = useState(null);        // platillo en edición
  const [recipeRows, setRecipeRows] = useState([]); // receta del platillo en edición
  const [printing, setPrinting] = useState(false);

  const save = useMutation(async (it) => {
    const saved = await upsertMenuItem(it);
    await saveRecipe(saved.id, recipeRows);
    return saved;
  }, { invalidate: ['rest-menu-admin', 'rest-pos', 'rest-inventory'], onSuccess: () => { setDraft(null); refresh(); } });
  const remove = useMutation((id) => deleteMenuItem(id), { invalidate: ['rest-menu-admin', 'rest-pos'], onSuccess: () => { setDraft(null); refresh(); } });
  const toggleActive = useMutation((it) => upsertMenuItem({ ...it, active: !it.active }), { invalidate: ['rest-menu-admin', 'rest-pos'], onSuccess: refresh });

  const cats = data?.categories || [];
  const items = data?.items || [];
  const costMap = data?.costMap || {};
  const recipeMap = data?.recipeMap || {};
  const products = data?.products || [];
  const catName = (id) => cats.find((c) => c.id === id)?.name || 'Sin categoría';
  const shown = filter === 'all' ? items : items.filter((i) => i.category_id === filter);

  const openEdit = (it) => {
    setDraft({ ...it });
    setRecipeRows((recipeMap[it.id] || []).map((r) => ({ product_id: r.product_id, qty: r.qty })));
  };
  const openNew = () => { setDraft(emptyItem(filter !== 'all' ? filter : cats[0]?.id)); setRecipeRows([]); };

  // costo de la receta en edición (en vivo)
  const draftCost = recipeRows.reduce((a, r) => {
    const p = products.find((x) => x.id === r.product_id);
    return a + (p ? Number(p.avg_cost) * Number(r.qty || 0) : 0);
  }, 0);
  const draftProfit = Number(draft?.price || 0) - draftCost;

  return (
    <div style={{ padding: '30px 34px 44px', animation: 'fadeIn .35s ease both' }}>
      <PageHeader
        title="Menú"
        subtitle={`${items.length} platillos · costeo por receta y ganancia`}
        right={<div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setPrinting(true)} style={btnGhost}>🖨 Imprimir menú</button>
          <button onClick={openNew} style={btnPrimary}>+ Nuevo platillo</button>
        </div>}
      />
      <ErrorBox error={error || save.error || remove.error} />

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 18 }}>
        {[{ id: 'all', name: 'Todas' }, ...cats].map((c) => {
          const on = filter === c.id;
          return (
            <button key={c.id} onClick={() => setFilter(c.id)} style={{
              padding: '7px 14px', borderRadius: 999, cursor: 'pointer', fontSize: 12.5, fontWeight: 700, fontFamily: 'Karla, sans-serif',
              border: `1.5px solid ${on ? 'var(--ac, #B8552F)' : C.border}`,
              background: on ? 'var(--ac, #B8552F)' : C.paper, color: on ? '#FBF6EA' : C.sub,
            }}>{c.name}{c.id !== 'all' ? ` · ${items.filter((i) => i.category_id === c.id).length}` : ''}</button>
          );
        })}
      </div>

      {loading && !data ? <Loading /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14, marginTop: 18 }}>
          {shown.map((it, i) => {
            const cm = costMap[it.id];
            const cost = cm ? Number(cm.cost) : 0;
            const hasRecipe = cm && cm.ingredients > 0;
            const profit = Number(it.price) - cost;
            const margin = it.price > 0 && hasRecipe ? Math.round((profit / it.price) * 100) : null;
            return (
              <Card key={it.id} style={{ animation: `fadeUp .5s ${(0.04 + i * 0.03).toFixed(2)}s both`, opacity: it.active ? 1 : 0.62, padding: 0, overflow: 'hidden' }}>
                {it.image && <div style={{ height: 120, background: `#EDE3CF url(${it.image}) center/cover` }} />}
                <div style={{ padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
                    <div>
                      <Chip tone="accent">{catName(it.category_id)}</Chip>
                      <div style={{ fontSize: 15.5, fontWeight: 700, marginTop: 8, color: C.ink }}>{it.name}</div>
                    </div>
                    <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--ac, #B8552F)', flex: 'none' }}>{money(it.price)}</span>
                  </div>
                  {it.description && <div style={{ fontSize: 12.5, color: C.sub, lineHeight: 1.5, marginTop: 8, minHeight: 20 }}>{it.description}</div>}

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                    {hasRecipe ? (
                      <>
                        <Chip tone="neutral">Costo {money(cost)}</Chip>
                        <Chip tone="green">Ganancia {money(profit)}</Chip>
                        {margin != null && <Chip tone="gold">{margin}% margen</Chip>}
                      </>
                    ) : <Chip tone="neutral">Sin receta · sin costeo</Chip>}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: `1px dashed ${C.border}` }}>
                    <Toggle on={it.active} onClick={() => toggleActive.mutate(it)} labels={['Disponible', 'Oculto']} />
                    <button onClick={() => openEdit(it)} style={btnGhost}>Editar</button>
                  </div>
                </div>
              </Card>
            );
          })}
          {shown.length === 0 && <div style={{ color: C.muted, fontSize: 14, padding: 20 }}>No hay platillos en esta categoría.</div>}
        </div>
      )}

      {draft && (
        <Modal
          width={620}
          title={draft.id ? 'Editar platillo' : 'Nuevo platillo'}
          onClose={() => setDraft(null)}
          footer={<>
            {draft.id && <button onClick={() => remove.mutate(draft.id)} style={{ ...btnGhost, borderColor: '#E3B8AC', color: C.red, marginRight: 'auto' }}>Eliminar</button>}
            <button onClick={() => setDraft(null)} style={btnGhost}>Cancelar</button>
            <button onClick={() => draft.name.trim() && save.mutate(draft)} style={{ ...btnPrimary, opacity: save.loading ? 0.7 : 1 }}>{save.loading ? 'Guardando…' : 'Guardar'}</button>
          </>}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Imagen */}
            <div>
              <label style={label}>FOTO DEL PLATILLO</label>
              <ImageUpload value={draft.image} onChange={(url) => setDraft((d) => ({ ...d, image: url }))} />
            </div>

            <div>
              <label style={label}>NOMBRE</label>
              <input autoFocus value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} style={input} placeholder="Huevos con machaca" />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={label}>CATEGORÍA</label>
                <Select value={draft.category_id || ''} onChange={(v) => setDraft({ ...draft, category_id: v || null })}
                  options={cats.map((c) => ({ value: c.id, label: c.name }))} placeholder="Categoría" />
              </div>
              <div style={{ width: 130 }}>
                <label style={label}>PRECIO $</label>
                <input type="number" min="0" value={draft.price} onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) || 0 })} style={input} />
              </div>
            </div>
            <div>
              <label style={label}>DESCRIPCIÓN</label>
              <textarea value={draft.description || ''} onChange={(e) => setDraft({ ...draft, description: e.target.value })} rows={2} style={{ ...input, resize: 'vertical' }} placeholder="Opcional" />
            </div>

            {/* Receta / insumos */}
            <div style={{ borderTop: `1px dashed ${C.border}`, paddingTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink }}>Insumos por platillo (receta)</div>
                <button onClick={() => setRecipeRows([...recipeRows, { product_id: products[0]?.id, qty: 1 }])} style={{ ...btnGhost, padding: '6px 12px' }}>+ Insumo</button>
              </div>
              <div style={{ fontSize: 11.5, color: C.muted, marginTop: 4 }}>Al vender, estas cantidades se descuentan del inventario.</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                {recipeRows.length === 0 && <div style={{ fontSize: 12.5, color: C.muted }}>Sin insumos. Este platillo no descuenta inventario ni tiene costeo.</div>}
                {recipeRows.map((row, idx) => {
                  const p = products.find((x) => x.id === row.product_id);
                  const lineCost = p ? Number(p.avg_cost) * Number(row.qty || 0) : 0;
                  return (
                    <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <Select style={{ flex: 1 }} value={row.product_id}
                        onChange={(v) => setRecipeRows(recipeRows.map((r, j) => j === idx ? { ...r, product_id: v } : r))}
                        options={products.map((pr) => ({ value: pr.id, label: `${pr.name} (${pr.units?.symbol})` }))} />
                      <input type="number" min="0" step="any" value={row.qty} onChange={(e) => setRecipeRows(recipeRows.map((r, j) => j === idx ? { ...r, qty: e.target.value } : r))} style={{ ...input, width: 80 }} />
                      <span style={{ fontSize: 11.5, color: C.muted, width: 26 }}>{p?.units?.symbol}</span>
                      <span style={{ fontSize: 12, color: C.sub, width: 60, textAlign: 'right' }}>{money(lineCost)}</span>
                      <button onClick={() => setRecipeRows(recipeRows.filter((_, j) => j !== idx))} style={{ ...btnGhost, padding: '6px 9px', borderColor: '#E3B8AC', color: C.red }}>✕</button>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                <Chip tone="neutral">Costo receta {money(draftCost)}</Chip>
                <Chip tone={draftProfit >= 0 ? 'green' : 'red'}>Ganancia {money(draftProfit)}</Chip>
                {draft.price > 0 && recipeRows.length > 0 && <Chip tone="gold">{Math.round((draftProfit / draft.price) * 100)}% margen</Chip>}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {printing && <MenuPrint categories={cats} items={items} onClose={() => setPrinting(false)} />}
    </div>
  );
}
