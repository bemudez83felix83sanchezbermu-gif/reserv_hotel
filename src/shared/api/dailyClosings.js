import supabase from '../supabase.js';

const closings = () => supabase.schema('hotel').from('daily_closings');
const ACTIVE_STATUSES = ['confirmada', 'llega-hoy', 'en-casa', 'finalizada'];

export async function listDailyClosings() {
  const { data, error } = await closings().select('*').order('date', { ascending: false }).limit(60);
  if (error) throw error;
  return (data || []).map(fromRow);
}

export async function getDailyClosing(date) {
  const { data, error } = await closings().select('*').eq('date', date).maybeSingle();
  if (error) throw error;
  return data ? fromRow(data) : null;
}

// Agregados reales para el día — todo calculado en vivo desde las tablas de negocio.
// restaurant_revenue queda en 0 hasta que el POS del restaurante esté operativo (no se fabrica).
export async function computeDailyPreview(date, taxRate) {
  const [{ data: res, error: resErr }, { data: pool, error: poolErr }, { data: tickets, error: ticketsErr }] = await Promise.all([
    supabase.schema('hotel').from('reservations')
      .select('total, discount_total, status')
      .eq('check_in', date),
    supabase.schema('hotel').from('pool_bookings')
      .select('price, status')
      .eq('date', date),
    supabase.schema('restaurante').from('tickets')
      .select('total, status, closed_at')
      .gte('closed_at', `${date}T00:00:00`).lt('closed_at', `${date}T23:59:59.999`),
  ]);
  if (resErr) throw resErr;
  if (poolErr) throw poolErr;
  if (ticketsErr) throw ticketsErr;

  const activeRes = (res || []).filter((r) => ACTIVE_STATUSES.includes(r.status));
  const roomsRevenue = activeRes.reduce((sum, r) => sum + Number(r.total || 0), 0);
  const discountsTotal = activeRes.reduce((sum, r) => sum + Number(r.discount_total || 0), 0);

  const activePool = (pool || []).filter((b) => b.status !== 'cancelled');
  const poolRevenue = activePool.reduce((sum, b) => sum + Number(b.price || 0), 0);

  const paidTickets = (tickets || []).filter((t) => t.status === 'paid');
  const restaurantRevenue = paidTickets.reduce((sum, t) => sum + Number(t.total || 0), 0);

  const taxCollected = roomsRevenue * (taxRate ?? 0);

  return { roomsRevenue, restaurantRevenue, poolRevenue, discountsTotal, courtesiesUsed: 0, taxCollected };
}

export async function closeDay({ date, staffId, notes, ...totals }) {
  const { data, error } = await closings()
    .insert({
      date,
      rooms_revenue: totals.roomsRevenue,
      restaurant_revenue: totals.restaurantRevenue,
      pool_revenue: totals.poolRevenue,
      discounts_total: totals.discountsTotal,
      courtesies_used: totals.courtesiesUsed || 0,
      tax_collected: totals.taxCollected,
      notes: notes || null,
      closed_by: staffId || null,
    })
    .select().single();
  if (error) {
    if (error.code === '23505') throw new Error('Este día ya fue cerrado.');
    throw error;
  }
  return fromRow(data);
}

function fromRow(row) {
  return {
    date: row.date,
    roomsRevenue: Number(row.rooms_revenue),
    restaurantRevenue: Number(row.restaurant_revenue),
    poolRevenue: Number(row.pool_revenue),
    discountsTotal: Number(row.discounts_total),
    courtesiesUsed: row.courtesies_used,
    taxCollected: Number(row.tax_collected),
    notes: row.notes || '',
    closedBy: row.closed_by,
    closedAt: row.closed_at,
  };
}
