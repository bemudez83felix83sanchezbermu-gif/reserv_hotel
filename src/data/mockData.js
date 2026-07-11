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

export const DEF_CONFIG = {
  name: 'Casa Almendra',
  tagline: 'Un refugio entre almendros y viñedos',
  accent: '#B8552F',
};

export const REVIEWS = [
  { text: 'Despertar con olor a pan recién horneado no tiene precio.', author: 'Mariana G. · CDMX' },
  { text: 'La terraza del Nogal tiene el mejor atardecer de todo el valle.', author: 'Diego y Sofía · Monterrey' },
  { text: 'Nos recibieron con vino y nos despidieron con abrazos.', author: 'Carmen L. · Guadalajara' },
  { text: 'El desayuno en el jardín vale el viaje entero.', author: 'Andrés P. · Austin, TX' },
];
