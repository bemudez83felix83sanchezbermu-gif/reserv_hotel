-- ============================================================================
-- Fase 7 · Triggers de puente (bridge hotel ↔ restaurante)
-- Proyecto Supabase: Hotelero (ref qvmobumbnqdrecegdrdn)
--
-- Deja listo el bridge antes de que arranque el módulo Restaurante (proyecto
-- aparte). Idempotente: se puede correr múltiples veces sin error.
--
-- Cómo ejecutarlo: pegar completo en el SQL Editor de Supabase y ejecutar.
-- Requiere: migración inicial + esta migración corren en cualquier orden
-- relativo a 20260711_rls_by_role.sql (no dependen entre sí), pero ambas
-- necesitan la migración inicial.
--
-- Para revertir:
--   drop trigger if exists t_ticket_payments_bridge on restaurante.ticket_payments;
--   drop function if exists restaurante.tg_ticket_payment_bridge();
--   drop trigger if exists t_reservations_bootstrap on hotel.reservations;
--   drop function if exists hotel.tg_reservation_bootstrap();
-- ============================================================================

-- ============================================================================
-- 1. AFTER INSERT ON hotel.reservations -> auto folio + auto cortesía
--
-- Antes esto lo hacía el cliente (shared/api/reservations.js::createReservation
-- insertaba folios y courtesies a mano tras crear la reserva). Se mueve a un
-- trigger para que sea imposible crear una reserva sin folio/cortesía sin
-- importar el camino de inserción (UI, futuro channel manager, SQL directo).
-- SECURITY DEFINER: el folio/cortesía se crean siempre, sin depender de que el
-- rol que crea la reserva tenga también permiso 'folios'/'courtesies'.
--
-- Fórmula de cortesías idéntica a shared/utils/pricing.js::courtesyQty y a
-- supabase/seed_from_mock.sql: courtesy_qty_per_guest * guests_count *
-- (1 si courtesy_mode='per_stay', noches en otro caso).
-- ============================================================================
create or replace function hotel.tg_reservation_bootstrap()
returns trigger
language plpgsql
security definer
set search_path = hotel, public
as $$
declare
  cfg hotel.config%rowtype;
  qty int;
begin
  select * into cfg from hotel.config where id = 1;

  insert into hotel.folios (reservation_id, balance, status)
  values (new.id, new.total, 'open')
  on conflict (reservation_id) do nothing;

  qty := coalesce(cfg.courtesy_qty_per_guest, 0) * new.guests_count *
    case when cfg.courtesy_mode = 'per_stay' then 1 else (new.check_out - new.check_in) end;

  insert into hotel.courtesies (reservation_id, total_qty)
  values (new.id, qty)
  on conflict (reservation_id) do nothing;

  return new;
end;
$$;

drop trigger if exists t_reservations_bootstrap on hotel.reservations;
create trigger t_reservations_bootstrap
  after insert on hotel.reservations
  for each row execute function hotel.tg_reservation_bootstrap();

-- ============================================================================
-- 2. AFTER INSERT ON restaurante.ticket_payments -> cargo a folio / canje de cortesía
--
-- method='room_charge' -> crea hotel.folio_charges (source='restaurant', ref_type='ticket').
-- method='courtesy'    -> hotel.courtesies.used_qty += 1 (el check courtesies_used_lte_total
--                          ya existente aborta la transacción si no queda saldo).
-- SECURITY DEFINER: cajero/mesero no necesitan permiso de escritura en tablas hotel.* para
-- que el bridge funcione.
-- ============================================================================
create or replace function restaurante.tg_ticket_payment_bridge()
returns trigger
language plpgsql
security definer
set search_path = hotel, restaurante, public
as $$
begin
  if new.method = 'room_charge' then
    insert into hotel.folio_charges (folio_id, source, description, amount, ref_type, ref_id, created_by)
    values (new.folio_id, 'restaurant', 'Consumo restaurante', new.amount, 'ticket', new.ticket_id, new.received_by);
  elsif new.method = 'courtesy' then
    update hotel.courtesies
    set used_qty = used_qty + 1
    where id = new.courtesy_id;
  end if;
  return new;
end;
$$;

drop trigger if exists t_ticket_payments_bridge on restaurante.ticket_payments;
create trigger t_ticket_payments_bridge
  after insert on restaurante.ticket_payments
  for each row execute function restaurante.tg_ticket_payment_bridge();

-- ============================================================================
-- 3. Verificación
-- ============================================================================
-- insert into hotel.reservations (code, primary_guest_id, room_id, channel_id, check_in,
--   check_out, guests_count, total)
-- values ('TEST-0001', <guest_id>, <room_id>, <channel_id>, '2026-08-01', '2026-08-03', 2, 1000);
-- select * from hotel.folios where reservation_id = (select id from hotel.reservations where code = 'TEST-0001');
-- select * from hotel.courtesies where reservation_id = (select id from hotel.reservations where code = 'TEST-0001');
-- -- Ambas deben tener exactamente 1 fila creada automáticamente por el trigger.
-- delete from hotel.reservations where code = 'TEST-0001'; -- limpieza (cascada a folios/courtesies)
-- ============================================================================
