export const DEF_ROOMS = [
  {
    id: 'r1', num: '101', name: 'Alcoba Almendra', type: 'Doble clásica',
    cap: 2, m2: 28, price: 2400, bed: 'Cama queen', active: true,
    desc: 'Una habitación serena con muros de adobe encalado, textiles oaxaqueños y luz de la mañana. Perfecta para escapadas cortas entre semana.',
    amenities: ['Aire acondicionado', 'Wifi de cortesía', 'Café de olla diario', 'Baño con regadera lluvia', 'Amenidades artesanales', 'Escritorio'],
  },
  {
    id: 'r2', num: '102', name: 'Alcoba Olivo', type: 'Doble jardín',
    cap: 2, m2: 32, price: 3200, bed: 'Cama king', active: true,
    desc: 'Se abre directo al jardín de olivos. Despierta con el canto de los pájaros y desayuna bajo la pérgola a unos pasos de tu puerta.',
    amenities: ['Acceso directo al jardín', 'Aire acondicionado', 'Wifi de cortesía', 'Cafetera de prensa', 'Tina exterior', 'Bata y pantuflas'],
  },
  {
    id: 'r3', num: '201', name: 'Terraza Nogal', type: 'Superior con terraza',
    cap: 3, m2: 40, price: 4100, bed: 'King + diván', active: true,
    desc: 'Nuestra terraza privada más querida: atardeceres sobre el valle, chimenea de leña y una tina al aire libre bajo el nogal.',
    amenities: ['Terraza privada', 'Chimenea de leña', 'Tina al aire libre', 'Vista al valle', 'Minibar curado', 'Aire acondicionado'],
  },
  {
    id: 'r4', num: '202', name: 'Suite Jacaranda', type: 'Suite familiar',
    cap: 4, m2: 56, price: 5600, bed: 'King + 2 ind.', active: true,
    desc: 'Dos ambientes conectados por un patio interior con jacaranda. Espacio de sobra para viajar en familia sin renunciar a la calma.',
    amenities: ['Dos recámaras', 'Patio interior privado', 'Sala de estar', 'Tina y regadera doble', 'Minibar curado', 'Juegos de mesa'],
  },
  {
    id: 'r5', num: 'Casa', name: 'Casa del Valle', type: 'Villa con alberca',
    cap: 6, m2: 92, price: 7800, bed: '3 recámaras', active: true,
    desc: 'Una casa entera para ustedes: alberca privada, cocina abierta, asador de leña y el viñedo como único vecino.',
    amenities: ['Alberca privada', 'Cocina equipada', 'Asador de leña', 'Terraza panorámica', 'Vista al viñedo', 'Estacionamiento propio'],
  },
];

export const DEF_PKGS = [
  { id: 'p1', name: 'Desayuno de la casa', price: 280, unit: 'por persona / día', active: true, desc: 'Pan dulce recién horneado, fruta de temporada, huevos al gusto y café de olla.' },
  { id: 'p2', name: 'Ritual de spa',       price: 1450, unit: 'por persona',       active: true, desc: 'Masaje relajante de 60 minutos y circuito de aguas al atardecer.' },
  { id: 'p3', name: 'Cena en el viñedo',   price: 1900, unit: 'por pareja',        active: true, desc: 'Cuatro tiempos del chef con maridaje de vinos del valle, entre las vides.' },
  { id: 'p4', name: 'Salida tardía',       price: 450,  unit: 'por estancia',      active: true, desc: 'Disfruta tu habitación y la alberca hasta las 3:00 pm del día de salida.' },
];

export const RESERVATIONS = [
  { code: 'CA-3128', guest: 'Fernanda Ruiz',       roomId: 'r2', start: 3,  end: 7,  status: 'en-casa',    n: 2, pkgs: ['Desayuno de la casa'] },
  { code: 'CA-2981', guest: 'Familia Hernández',   roomId: 'r4', start: 4,  end: 6,  status: 'en-casa',    n: 4, pkgs: ['Salida tardía'] },
  { code: 'CA-4102', guest: 'Marco Antonio Silva', roomId: 'r1', start: 5,  end: 8,  status: 'llega-hoy',  n: 2, pkgs: ['Desayuno de la casa'] },
  { code: 'CA-4177', guest: 'Julia Béjar',         roomId: 'r3', start: 5,  end: 9,  status: 'llega-hoy',  n: 2, pkgs: ['Ritual de spa', 'Desayuno de la casa'] },
  { code: 'CA-4216', guest: 'Tom y Erin Walsh',    roomId: 'r5', start: 5,  end: 12, status: 'llega-hoy',  n: 2, pkgs: ['Cena en el viñedo'] },
  { code: 'CA-4388', guest: 'Pablo Quintana',      roomId: 'r1', start: 10, end: 13, status: 'confirmada', n: 1, pkgs: [] },
  { code: 'CA-4402', guest: 'Alicia Montes',       roomId: 'r2', start: 12, end: 15, status: 'confirmada', n: 2, pkgs: ['Desayuno de la casa'] },
  { code: 'CA-4451', guest: 'Familia Ortega',      roomId: 'r4', start: 18, end: 22, status: 'confirmada', n: 5, pkgs: ['Desayuno de la casa', 'Salida tardía'] },
  { code: 'CA-4489', guest: 'Rocío Méndez',        roomId: 'r3', start: 21, end: 24, status: 'confirmada', n: 2, pkgs: ['Ritual de spa'] },
  { code: 'CA-4513', guest: 'Daniel Kim',          roomId: 'r5', start: 25, end: 29, status: 'confirmada', n: 3, pkgs: [] },
];

export const AMEN_CATALOG = [
  'Aire acondicionado', 'Wifi de cortesía', 'Terraza privada', 'Tina al aire libre',
  'Chimenea de leña', 'Vista al valle', 'Alberca privada', 'Minibar curado',
  'Cocina equipada', 'Acceso directo al jardín', 'Bata y pantuflas',
  'Café de olla diario', 'Sala de estar', 'Escritorio',
];

export const DEF_STRUCT = {
  mode: 'edificios',
  flatCount: 24,
  buildings: [
    { id: 'b1', name: 'Edificio Valle',  start: 101, end: 150, letter: '',  letterPos: 'pre' },
    { id: 'b2', name: 'Edificio Jardín', start: 201, end: 250, letter: '',  letterPos: 'pre' },
    { id: 'b3', name: 'Edificio Viñedo', start: 1,   end: 50,  letter: 'C', letterPos: 'pre' },
  ],
};

export const DEF_CONFIG = {
  name: 'Casa Almendra',
  tagline: 'Un refugio entre almendros y viñedos',
  accent: '#B8552F',
};

export const SWATCHES = [
  ['#B8552F', 'Terracota'],
  ['#6F7D5C', 'Salvia'],
  ['#7A3B47', 'Vino'],
  ['#34506B', 'Azul noche'],
];

export const GUEST_POOL = [
  'Fernanda Ruiz', 'Marco A. Silva', 'Julia Béjar', 'Tom y Erin Walsh',
  'Alicia Montes', 'Pablo Quintana', 'Rocío Méndez', 'Daniel Kim',
  'Familia Ortega', 'Carmen Lozano',
];

export const TODAY_ISO = '2026-07-05';
export const STAFF_NAME = 'Valeria';
