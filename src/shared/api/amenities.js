import supabase from '../supabase.js';

const products = () => supabase.schema('hotel').from('amenity_products');
const movements = () => supabase.schema('hotel').from('amenity_movements');

const MOVE_SELECT = `
  id, product_id, type, qty, unit_cost, ref_room_id, ref_reservation_id, reason, created_by, created_at,
  rooms:ref_room_id ( id, num )
`;

const STOCK_UP = new Set(['in', 'restock']);
const STOCK_DOWN = new Set(['out', 'waste']);

export async function listAmenityProducts() {
  const { data, error } = await products().select('*').order('name');
  if (error) throw error;
  return (data || []).map(fromProductRow);
}

export async function createAmenityProduct(input) {
  const { data, error } = await products()
    .insert({
      name: input.name,
      unit: input.unit || 'pza',
      current_stock: input.currentStock || 0,
      avg_cost: input.avgCost || 0,
      min_stock: input.minStock || 0,
    })
    .select('*')
    .single();
  if (error) throw error;
  return fromProductRow(data);
}

export async function updateAmenityProduct(id, patch) {
  const row = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.unit !== undefined) row.unit = patch.unit;
  if (patch.avgCost !== undefined) row.avg_cost = patch.avgCost;
  if (patch.minStock !== undefined) row.min_stock = patch.minStock;
  if (patch.active !== undefined) row.active = patch.active;
  const { data, error } = await products().update(row).eq('id', id).select('*').single();
  if (error) throw error;
  return fromProductRow(data);
}

export async function deleteAmenityProduct(id) {
  const { error } = await products().delete().eq('id', id);
  if (error) throw error;
}

export async function listAmenityMovements(productId) {
  let q = movements().select(MOVE_SELECT).order('created_at', { ascending: false });
  if (productId) q = q.eq('product_id', productId);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []).map(fromMoveRow);
}

// Inserta el movimiento y ajusta current_stock del producto en el mismo flujo
// (no hay trigger de BD para esto todavía — se simula desde el frontend).
export async function createAmenityMovement(input) {
  const { data: product, error: prodError } = await products()
    .select('id, current_stock')
    .eq('id', input.productId)
    .single();
  if (prodError) throw prodError;

  const qty = Number(input.qty);
  const delta = STOCK_UP.has(input.type) ? qty : STOCK_DOWN.has(input.type) ? -qty : qty;
  const nextStock = Number(product.current_stock) + delta;

  const { data, error } = await movements()
    .insert({
      product_id: input.productId,
      type: input.type,
      qty,
      unit_cost: input.unitCost ?? null,
      ref_room_id: input.refRoomId || null,
      ref_reservation_id: input.refReservationId || null,
      reason: input.reason || null,
      created_by: input.createdBy || null,
    })
    .select(MOVE_SELECT)
    .single();
  if (error) throw error;

  const { error: updError } = await products().update({ current_stock: nextStock }).eq('id', input.productId);
  if (updError) throw updError;

  return fromMoveRow(data);
}

function fromProductRow(row) {
  return {
    id: row.id,
    name: row.name,
    unit: row.unit,
    currentStock: Number(row.current_stock),
    avgCost: Number(row.avg_cost),
    minStock: Number(row.min_stock),
    active: row.active !== false,
    createdAt: row.created_at,
  };
}

function fromMoveRow(row) {
  return {
    id: row.id,
    productId: row.product_id,
    type: row.type,
    qty: Number(row.qty),
    unitCost: row.unit_cost != null ? Number(row.unit_cost) : null,
    refRoomId: row.ref_room_id,
    refRoomLabel: row.rooms ? `Hab. ${row.rooms.num}` : '',
    refReservationId: row.ref_reservation_id,
    reason: row.reason || '',
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}
