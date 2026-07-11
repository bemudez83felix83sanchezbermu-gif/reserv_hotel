-- ============================================================================
-- Seed desde el mock original (src/data/mockData.js) para Casa Almendra.
-- Idempotente: cada bloque se puede correr múltiples veces sin duplicar filas.
-- Requiere que la migración inicial (catálogos base: room_types, bed_types,
-- sales_channels, hotel.config) ya se haya ejecutado.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Edificios (DEF_STRUCT)
-- ----------------------------------------------------------------------------
insert into hotel.buildings (name, num_from, num_to, letra_pre, letra_suf, position)
select 'Edificio Valle', 101, 150, null, null, 0
where not exists (select 1 from hotel.buildings where name = 'Edificio Valle');

insert into hotel.buildings (name, num_from, num_to, letra_pre, letra_suf, position)
select 'Edificio Jardín', 201, 250, null, null, 1
where not exists (select 1 from hotel.buildings where name = 'Edificio Jardín');

insert into hotel.buildings (name, num_from, num_to, letra_pre, letra_suf, position)
select 'Edificio Viñedo', 1, 50, 'C', null, 2
where not exists (select 1 from hotel.buildings where name = 'Edificio Viñedo');

-- ----------------------------------------------------------------------------
-- 2. Habitaciones (DEF_ROOMS)
-- ----------------------------------------------------------------------------
insert into hotel.rooms (num, name, room_type_id, bed_type_id, building_id, cap, m2, price, description, amenities)
select '101', 'Alcoba Almendra',
  (select id from hotel.room_types where name = 'Doble clásica'),
  (select id from hotel.bed_types where name = 'Cama queen'),
  (select id from hotel.buildings where name = 'Edificio Valle'),
  2, 28, 2400,
  'Una habitación serena con muros de adobe encalado, textiles oaxaqueños y luz de la mañana. Perfecta para escapadas cortas entre semana.',
  '["Aire acondicionado", "Wifi de cortesía", "Café de olla diario", "Baño con regadera lluvia", "Amenidades artesanales", "Escritorio"]'::jsonb
on conflict (num) do nothing;

insert into hotel.rooms (num, name, room_type_id, bed_type_id, building_id, cap, m2, price, description, amenities)
select '102', 'Alcoba Olivo',
  (select id from hotel.room_types where name = 'Doble jardín'),
  (select id from hotel.bed_types where name = 'Cama king'),
  (select id from hotel.buildings where name = 'Edificio Valle'),
  2, 32, 3200,
  'Se abre directo al jardín de olivos. Despierta con el canto de los pájaros y desayuna bajo la pérgola a unos pasos de tu puerta.',
  '["Acceso directo al jardín", "Aire acondicionado", "Wifi de cortesía", "Cafetera de prensa", "Tina exterior", "Bata y pantuflas"]'::jsonb
on conflict (num) do nothing;

insert into hotel.rooms (num, name, room_type_id, bed_type_id, building_id, cap, m2, price, description, amenities)
select '201', 'Terraza Nogal',
  (select id from hotel.room_types where name = 'Superior con terraza'),
  (select id from hotel.bed_types where name = 'King + diván'),
  (select id from hotel.buildings where name = 'Edificio Jardín'),
  3, 40, 4100,
  'Nuestra terraza privada más querida: atardeceres sobre el valle, chimenea de leña y una tina al aire libre bajo el nogal.',
  '["Terraza privada", "Chimenea de leña", "Tina al aire libre", "Vista al valle", "Minibar curado", "Aire acondicionado"]'::jsonb
on conflict (num) do nothing;

insert into hotel.rooms (num, name, room_type_id, bed_type_id, building_id, cap, m2, price, description, amenities)
select '202', 'Suite Jacaranda',
  (select id from hotel.room_types where name = 'Suite familiar'),
  (select id from hotel.bed_types where name = 'King + 2 individuales'),
  (select id from hotel.buildings where name = 'Edificio Jardín'),
  4, 56, 5600,
  'Dos ambientes conectados por un patio interior con jacaranda. Espacio de sobra para viajar en familia sin renunciar a la calma.',
  '["Dos recámaras", "Patio interior privado", "Sala de estar", "Tina y regadera doble", "Minibar curado", "Juegos de mesa"]'::jsonb
on conflict (num) do nothing;

insert into hotel.rooms (num, name, room_type_id, bed_type_id, building_id, cap, m2, price, description, amenities)
select 'Casa', 'Casa del Valle',
  (select id from hotel.room_types where name = 'Villa con alberca'),
  (select id from hotel.bed_types where name = '3 recámaras'),
  (select id from hotel.buildings where name = 'Edificio Viñedo'),
  6, 92, 7800,
  'Una casa entera para ustedes: alberca privada, cocina abierta, asador de leña y el viñedo como único vecino.',
  '["Alberca privada", "Cocina equipada", "Asador de leña", "Terraza panorámica", "Vista al viñedo", "Estacionamiento propio"]'::jsonb
on conflict (num) do nothing;

-- ----------------------------------------------------------------------------
-- 3. Paquetes (DEF_PKGS)
-- ----------------------------------------------------------------------------
insert into hotel.packages (name, price, unit, description)
select 'Desayuno de la casa', 280, 'persona_dia', 'Pan dulce recién horneado, fruta de temporada, huevos al gusto y café de olla.'
where not exists (select 1 from hotel.packages where name = 'Desayuno de la casa');

insert into hotel.packages (name, price, unit, description)
select 'Ritual de spa', 1450, 'persona', 'Masaje relajante de 60 minutos y circuito de aguas al atardecer.'
where not exists (select 1 from hotel.packages where name = 'Ritual de spa');

insert into hotel.packages (name, price, unit, description)
select 'Cena en el viñedo', 1900, 'pareja', 'Cuatro tiempos del chef con maridaje de vinos del valle, entre las vides.'
where not exists (select 1 from hotel.packages where name = 'Cena en el viñedo');

insert into hotel.packages (name, price, unit, description)
select 'Salida tardía', 450, 'estancia', 'Disfruta tu habitación y la alberca hasta las 3:00 pm del día de salida.'
where not exists (select 1 from hotel.packages where name = 'Salida tardía');

-- ----------------------------------------------------------------------------
-- 4. Huéspedes (uno por reserva del mock RESERVATIONS)
-- ----------------------------------------------------------------------------
insert into hotel.guests (first_name, last_name)
select v.first_name, v.last_name
from (values
  ('Fernanda', 'Ruiz'),
  ('Familia', 'Hernández'),
  ('Marco Antonio', 'Silva'),
  ('Julia', 'Béjar'),
  ('Tom y Erin', 'Walsh'),
  ('Pablo', 'Quintana'),
  ('Alicia', 'Montes'),
  ('Familia', 'Ortega'),
  ('Rocío', 'Méndez'),
  ('Daniel', 'Kim')
) as v(first_name, last_name)
where not exists (
  select 1 from hotel.guests g where g.first_name = v.first_name and g.last_name = v.last_name
);

-- ----------------------------------------------------------------------------
-- 5. Reservaciones de julio 2026 (DEF mock RESERVATIONS, mapeado a fechas reales)
--    total = precio de habitación * noches + paquetes contratados
-- ----------------------------------------------------------------------------
insert into hotel.reservations (
  code, primary_guest_id, room_id, channel_id, check_in, check_out,
  guests_count, status, total_before_discount, total
)
select
  v.code,
  (select id from hotel.guests where first_name = v.first_name and last_name = v.last_name),
  (select id from hotel.rooms where num = v.room_num),
  (select id from hotel.sales_channels where slug = 'direct'),
  v.check_in::date, v.check_out::date,
  v.guests_count, v.status::hotel.reservation_status,
  v.room_total + v.pkg_total, v.room_total + v.pkg_total
from (values
  ('CA-3128', 'Fernanda',      'Ruiz',      '102',  '2026-07-03', '2026-07-07', 2, 'en-casa',    12800, 2240),
  ('CA-2981', 'Familia',       'Hernández', '202',  '2026-07-04', '2026-07-06', 4, 'en-casa',    11200, 450),
  ('CA-4102', 'Marco Antonio', 'Silva',     '101',  '2026-07-05', '2026-07-08', 2, 'llega-hoy',  7200,  1680),
  ('CA-4177', 'Julia',         'Béjar',     '201',  '2026-07-05', '2026-07-09', 2, 'llega-hoy',  16400, 5140),
  ('CA-4216', 'Tom y Erin',    'Walsh',     'Casa', '2026-07-05', '2026-07-12', 2, 'llega-hoy',  54600, 1900),
  ('CA-4388', 'Pablo',         'Quintana',  '101',  '2026-07-10', '2026-07-13', 1, 'confirmada', 7200,  0),
  ('CA-4402', 'Alicia',        'Montes',    '102',  '2026-07-12', '2026-07-15', 2, 'confirmada', 9600,  1680),
  ('CA-4451', 'Familia',       'Ortega',    '202',  '2026-07-18', '2026-07-22', 5, 'confirmada', 22400, 6050),
  ('CA-4489', 'Rocío',         'Méndez',    '201',  '2026-07-21', '2026-07-24', 2, 'confirmada', 12300, 2900),
  ('CA-4513', 'Daniel',        'Kim',       'Casa', '2026-07-25', '2026-07-29', 3, 'confirmada', 31200, 0)
) as v(code, first_name, last_name, room_num, check_in, check_out, guests_count, status, room_total, pkg_total)
on conflict (code) do nothing;

-- ----------------------------------------------------------------------------
-- 6. Paquetes contratados por reserva (reservation_packages)
-- ----------------------------------------------------------------------------
insert into hotel.reservation_packages (reservation_id, package_id, qty, unit_price)
select r.id, p.id, v.qty, p.price
from (values
  ('CA-3128', 'Desayuno de la casa', 8),
  ('CA-2981', 'Salida tardía', 1),
  ('CA-4102', 'Desayuno de la casa', 6),
  ('CA-4177', 'Ritual de spa', 2),
  ('CA-4177', 'Desayuno de la casa', 8),
  ('CA-4216', 'Cena en el viñedo', 1),
  ('CA-4402', 'Desayuno de la casa', 6),
  ('CA-4451', 'Desayuno de la casa', 20),
  ('CA-4451', 'Salida tardía', 1),
  ('CA-4489', 'Ritual de spa', 2)
) as v(code, pkg_name, qty)
join hotel.reservations r on r.code = v.code
join hotel.packages p on p.name = v.pkg_name
where not exists (
  select 1 from hotel.reservation_packages rp
  where rp.reservation_id = r.id and rp.package_id = p.id
);

-- ----------------------------------------------------------------------------
-- 7. Folios (uno por reserva, balance = total)
-- ----------------------------------------------------------------------------
insert into hotel.folios (reservation_id, balance, status)
select r.id, r.total, 'open'
from hotel.reservations r
where r.code in ('CA-3128','CA-2981','CA-4102','CA-4177','CA-4216','CA-4388','CA-4402','CA-4451','CA-4489','CA-4513')
on conflict (reservation_id) do nothing;

-- ----------------------------------------------------------------------------
-- 8. Cortesías (fórmula desde hotel.config: courtesy_mode + courtesy_qty_per_guest)
-- ----------------------------------------------------------------------------
insert into hotel.courtesies (reservation_id, total_qty)
select
  r.id,
  c.courtesy_qty_per_guest * r.guests_count *
    case c.courtesy_mode
      when 'per_stay' then 1
      else (r.check_out - r.check_in)
    end
from hotel.reservations r
cross join hotel.config c
where r.code in ('CA-3128','CA-2981','CA-4102','CA-4177','CA-4216','CA-4388','CA-4402','CA-4451','CA-4489','CA-4513')
on conflict (reservation_id) do nothing;
