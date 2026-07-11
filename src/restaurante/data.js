// Capa de datos del módulo Restaurante — habla con el schema `restaurante.*`
// (y `public.staff` para nombres) del proyecto Supabase Hotelero.
import supabase from '../shared/supabase.js';

const R = () => supabase.schema('restaurante');

export const dayRange = (d = new Date()) => {
  const start = new Date(d); start.setHours(0, 0, 0, 0);
  const end = new Date(start); end.setDate(end.getDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
};

// ---------- Staff (public) ----------
export async function fetchStaff() {
  const { data, error } = await supabase
    .from('staff')
    .select('id, full_name, phone, active, role_id, roles(name, restaurant_access)')
    .order('full_name');
  if (error) throw error;
  const map = {};
  (data || []).forEach((s) => { map[s.id] = s; });
  return { list: data || [], map };
}

// ---------- Menú ----------
export async function fetchMenu() {
  const [cats, items] = await Promise.all([
    R().from('categories').select('*').order('position'),
    R().from('menu_items').select('*').order('name'),
  ]);
  if (cats.error) throw cats.error;
  if (items.error) throw items.error;
  return { categories: cats.data || [], items: items.data || [] };
}

export async function upsertMenuItem(item) {
  const { data, error } = await R().from('menu_items').upsert(item).select().single();
  if (error) throw error;
  return data;
}
export async function deleteMenuItem(id) {
  const { error } = await R().from('menu_items').delete().eq('id', id);
  if (error) throw error;
}
export async function upsertCategory(cat) {
  const { data, error } = await R().from('categories').upsert(cat).select().single();
  if (error) throw error;
  return data;
}

// Menú completo para administración: platillos + costeo + recetas + insumos.
export async function fetchMenuAdmin() {
  const [cats, items, cost, recipes, prods] = await Promise.all([
    R().from('categories').select('*').order('position'),
    R().from('menu_items').select('*').order('name'),
    R().from('v_menu_item_cost').select('*'),
    R().from('recipes').select('*'),
    R().from('products').select('id, name, avg_cost, current_stock, unit_id, units(symbol)').eq('active', true).order('name'),
  ]);
  for (const q of [cats, items, cost, recipes, prods]) if (q.error) throw q.error;
  const costMap = {};
  (cost.data || []).forEach((c) => { costMap[c.menu_item_id] = c; });
  const recipeMap = {};
  (recipes.data || []).forEach((r) => { (recipeMap[r.menu_item_id] ||= []).push(r); });
  return { categories: cats.data || [], items: items.data || [], costMap, recipeMap, products: prods.data || [] };
}

// Reemplaza la receta completa de un platillo.
export async function saveRecipe(menuItemId, rows) {
  const del = await R().from('recipes').delete().eq('menu_item_id', menuItemId);
  if (del.error) throw del.error;
  const clean = rows.filter((r) => r.product_id && Number(r.qty) > 0)
    .map((r) => ({ menu_item_id: menuItemId, product_id: r.product_id, qty: Number(r.qty) }));
  if (clean.length) {
    const ins = await R().from('recipes').insert(clean);
    if (ins.error) throw ins.error;
  }
}

// ---------- Inventario ----------
export async function fetchInventory() {
  const [prods, units, moves] = await Promise.all([
    R().from('products').select('*, units(name, symbol)').order('name'),
    R().from('units').select('*').order('id'),
    R().from('stock_movements').select('*, products(name)').order('created_at', { ascending: false }).limit(40),
  ]);
  if (prods.error) throw prods.error;
  if (units.error) throw units.error;
  if (moves.error) throw moves.error;
  return { products: prods.data || [], units: units.data || [], movements: moves.data || [] };
}

export async function upsertProduct(p) {
  const { data, error } = await R().from('products').upsert(p).select().single();
  if (error) throw error;
  return data;
}

// Movimiento de inventario atómico (RPC: ajusta current_stock y avg_cost)
export async function applyStockMovement({ product_id, type, qty, unit_cost, reason, created_by }) {
  const { data, error } = await R().rpc('apply_stock_movement', {
    p_product: product_id,
    p_type: type,
    p_qty: qty,
    p_unit_cost: unit_cost ?? null,
    p_reason: reason ?? null,
    p_created_by: created_by ?? null,
  });
  if (error) throw error;
  return data;
}

// ---------- Cajas / Turnos (cortes) ----------
export async function fetchShifts() {
  const { data, error } = await R()
    .from('shifts')
    .select('*')
    .order('opened_at', { ascending: false })
    .limit(30);
  if (error) throw error;
  const open = (data || []).find((s) => !s.closed_at) || null;
  return { shifts: data || [], open };
}

export async function openShift({ opened_by, opened_cash, notes }) {
  const { data, error } = await R()
    .from('shifts')
    .insert({ opened_by, opened_cash: opened_cash ?? 0, notes: notes ?? null })
    .select().single();
  if (error) throw error;
  return data;
}

export async function closeShift({ shift_id, closed_by, closed_cash, notes }) {
  const { data, error } = await R().rpc('close_shift', {
    p_shift: shift_id,
    p_closed_by: closed_by,
    p_closed_cash: closed_cash ?? 0,
    p_notes: notes ?? null,
  });
  if (error) throw error;
  return data;
}

// Efectivo cobrado en un turno abierto (para mostrar "esperado" en vivo)
export async function fetchShiftCash(shiftId) {
  const { data, error } = await R()
    .from('ticket_payments')
    .select('amount, method, tickets!inner(order_id, orders!inner(shift_id))')
    .eq('tickets.orders.shift_id', shiftId);
  if (error) throw error;
  let cash = 0, total = 0;
  (data || []).forEach((p) => { total += Number(p.amount) || 0; if (p.method === 'cash') cash += Number(p.amount) || 0; });
  return { cash, total, count: (data || []).length };
}

// ---------- Punto de venta (POS) ----------
export async function fetchPOS() {
  const [cats, items, cost, tables, shifts] = await Promise.all([
    R().from('categories').select('*').order('position'),
    R().from('menu_items').select('*').eq('active', true).order('name'),
    R().from('v_menu_item_cost').select('*'),
    R().from('tables').select('*').eq('active', true).order('num'),
    fetchShifts(),
  ]);
  for (const q of [cats, items, cost, tables]) if (q.error) throw q.error;
  const costMap = {};
  (cost.data || []).forEach((c) => { costMap[c.menu_item_id] = c; });
  const counter = (tables.data || []).find((t) => t.num === 'Mostrador') || (tables.data || [])[0] || null;
  return { categories: cats.data || [], items: items.data || [], costMap, tables: tables.data || [], counter, openShift: shifts.open };
}

export async function checkoutSale({ server_id, shift_id, table_id, items, method, tip, reference }) {
  const { data, error } = await R().rpc('checkout_sale', {
    p_server: server_id, p_shift: shift_id, p_table: table_id,
    p_items: items, p_method: method, p_tip: tip ?? 0, p_reference: reference ?? null,
  });
  if (error) throw error;
  return data;
}

// ---------- Ventas / Tickets ----------
export async function fetchSales(date = new Date()) {
  const { start, end } = dayRange(date);
  const { data, error } = await R()
    .from('tickets')
    .select('*, ticket_payments(*), orders(shift_id, server_id, table_id, tables(num))')
    .gte('created_at', start).lt('created_at', end)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// KPIs del panel (ventas del día + inventario bajo + turno abierto)
export async function fetchDashboard(date = new Date()) {
  const [sales, inv, shifts] = await Promise.all([
    fetchSales(date),
    R().from('products').select('id, name, current_stock, min_stock, units(symbol)').order('name'),
    fetchShifts(),
  ]);
  const paid = sales.filter((t) => t.status === 'paid' || t.status === 'partial');
  const revenue = paid.reduce((a, t) => a + (Number(t.total) || 0), 0);
  const byMethod = {};
  sales.forEach((t) => (t.ticket_payments || []).forEach((p) => {
    byMethod[p.method] = (byMethod[p.method] || 0) + (Number(p.amount) || 0);
  }));
  const lowStock = (inv.data || []).filter((p) => Number(p.current_stock) < Number(p.min_stock));
  return {
    revenue,
    ticketCount: paid.length,
    avgTicket: paid.length ? revenue / paid.length : 0,
    byMethod,
    lowStock,
    openShift: shifts.open,
    tickets: sales,
  };
}
