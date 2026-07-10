export const fmt = (n) => '$' + Math.round(Number(n) || 0).toLocaleString('es-MX');

export const initials = (name) =>
  (name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

export const seedOf = (id) => {
  let n = 0;
  const t = String(id || 'x');
  for (let i = 0; i < t.length; i++) n += t.charCodeAt(i) * (i + 7) * 131;
  return n;
};

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
export const fmtAbs = (a) => {
  const t = new Date(a * 86400000 + 43200000);
  return t.getDate() + ' ' + MONTHS[t.getMonth()];
};

export const roomLabel = (rooms, id) => {
  const r = rooms.find((x) => x.id === id);
  return r ? ((r.num === 'Casa' ? '' : 'Hab. ' + r.num + ' · ') + r.name) : 'Habitación';
};

/** Pseudo-random per-building occupation used by the reservation map. */
export const roomsOf = (building, dAbs) => {
  const seed = seedOf(building.id);
  const start = Math.max(1, Number(building.start) || 101);
  const end = Math.max(start, Number(building.end) || start);
  const count = Math.min(400, end - start + 1);
  const applyL = (n) =>
    building.letter
      ? (building.letterPos === 'suf' ? String(n) + building.letter : String(building.letter) + n)
      : String(n);
  return Array.from({ length: count }, (_, i) => {
    const num = start + i;
    const label = applyL(num);
    const h = (num * 1103515245 + seed * 7919) >>> 0;
    const cyc = 6 + (h % 7);
    const occLen = 2 + ((h >> 4) % 4);
    const phase = (h >> 8) % cyc;
    const pos = (((dAbs + phase) % cyc) + cyc) % cyc;
    let st = 'libre';
    if (pos < occLen) st = 'ocupada';
    else if (pos === occLen || (pos === occLen + 1 && h % 4 === 0)) st = 'pendiente';
    const saleAbs = dAbs + (occLen - pos);
    const nextAbs = dAbs + (cyc - pos);
    return { num, label, st, h, saleAbs, nextAbs };
  });
};

export const STATE_COLORS = {
  libre:     { bg: '#EAF2E6', bd: '#A9C6A1', fg: '#3F6E4C', dot: '#4C8A5C', label: 'Disponible' },
  ocupada:   { bg: '#F6E3DE', bd: '#D49B8B', fg: '#93402D', dot: '#C0503C', label: 'Ocupada' },
  pendiente: { bg: '#F7ECD8', bd: '#DEBE85', fg: '#8A6420', dot: '#D9A13B', label: 'Pendiente de confirmación' },
};

export const dAbsOf = (isoDate) => Math.floor(Date.parse(isoDate + 'T12:00:00') / 86400000);
