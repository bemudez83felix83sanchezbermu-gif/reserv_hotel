import { dAbsOf, addDaysIso } from './helpers.js';

export const nightsBetween = (checkIn, checkOut) => Math.max(0, dAbsOf(checkOut) - dAbsOf(checkIn));

export const nightDates = (checkIn, checkOut) => {
  const n = nightsBetween(checkIn, checkOut);
  return Array.from({ length: n }, (_, i) => addDaysIso(checkIn, i));
};

// Precio por noche aplicando temporadas activas para ese tipo de habitación.
// Si hay overrides para la noche, el último (por created_at) reemplaza el precio base;
// los multiplicadores de esa misma noche se aplican después, en cadena.
export function nightlyPrice(baseNightly, nightIso, roomTypeId, ratePeriods) {
  const forNight = (ratePeriods || []).filter((p) =>
    p.active && p.dateFrom <= nightIso && p.dateTo >= nightIso &&
    (!p.appliesToRoomTypeId || p.appliesToRoomTypeId === roomTypeId));
  let price = baseNightly;
  const overrides = forNight.filter((p) => p.kind === 'override');
  if (overrides.length) price = overrides[overrides.length - 1].value;
  forNight.filter((p) => p.kind === 'multiplier').forEach((p) => { price *= p.value; });
  return price;
}

export function roomSubtotal(baseNightly, checkIn, checkOut, roomTypeId, ratePeriods) {
  return nightDates(checkIn, checkOut).reduce((sum, night) => sum + nightlyPrice(baseNightly, night, roomTypeId, ratePeriods), 0);
}

// unitPrice es el precio de catálogo del paquete; qty son las unidades contratadas (definidas por el usuario).
export function packageLineTotal(pkg, qty, { guestsCount = 1, nights = 1 } = {}) {
  switch (pkg.unit) {
    case 'por persona / día': return pkg.price * guestsCount * nights * qty;
    case 'por persona': return pkg.price * guestsCount * qty;
    case 'por pareja': return pkg.price * Math.ceil(guestsCount / 2) * qty;
    case 'por estancia':
    default: return pkg.price * qty;
  }
}

export function discountAmount(discount, subtotal) {
  const raw = discount.kind === 'percentage' ? subtotal * (discount.value / 100) : discount.value;
  return Math.max(0, Math.min(raw, subtotal));
}

export function totalDiscount(selectedDiscounts, subtotal) {
  let remaining = subtotal;
  let total = 0;
  selectedDiscounts.forEach((d) => {
    const amt = discountAmount(d, remaining);
    total += amt;
    remaining -= amt;
  });
  return total;
}

// Fórmula fijada en Configuración: config.courtesy_mode + config.courtesy_qty_per_guest.
// 'per_stay' = una sola vez por huésped; 'per_night'/'per_day' = por cada noche de la estancia.
export function courtesyQty(config, guestsCount, nights) {
  const perGuest = Number(config?.courtesy_qty_per_guest) || 0;
  const factor = config?.courtesy_mode === 'per_stay' ? 1 : nights;
  return perGuest * guestsCount * factor;
}

export function generateReservationCode(prefix) {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `${prefix || 'RES'}-${n}`;
}
