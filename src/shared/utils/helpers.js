export const fmt = (n) => '$' + Math.round(Number(n) || 0).toLocaleString('es-MX');

export const initials = (name) =>
  (name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
export const fmtAbs = (a) => {
  const t = new Date(a * 86400000 + 43200000);
  return t.getDate() + ' ' + MONTHS[t.getMonth()];
};

export const roomLabel = (rooms, id) => {
  const r = rooms.find((x) => x.id === id);
  return r ? ((r.num === 'Casa' ? '' : 'Hab. ' + r.num + ' · ') + r.name) : 'Habitación';
};

export const STATE_COLORS = {
  libre:     { bg: '#EAF2E6', bd: '#A9C6A1', fg: '#3F6E4C', dot: '#4C8A5C', label: 'Disponible' },
  ocupada:   { bg: '#F6E3DE', bd: '#D49B8B', fg: '#93402D', dot: '#C0503C', label: 'Ocupada' },
  pendiente: { bg: '#F7ECD8', bd: '#DEBE85', fg: '#8A6420', dot: '#D9A13B', label: 'Reservada · sin check-in' },
  bloqueada: { bg: '#E8E3DC', bd: '#B3A386', fg: '#5C5546', dot: '#8A7A63', label: 'Bloqueada' },
};

export const dAbsOf = (isoDate) => Math.floor(Date.parse(isoDate + 'T12:00:00') / 86400000);

export const todayIso = () => new Date().toISOString().slice(0, 10);

export const addDaysIso = (iso, n) => {
  const d = new Date(iso + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

export const capitalize = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
