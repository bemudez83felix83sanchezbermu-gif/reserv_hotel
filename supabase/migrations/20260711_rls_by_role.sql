-- ============================================================================
-- Fase 6 · RLS refinada por rol
-- Proyecto Supabase: Hotelero (ref qvmobumbnqdrecegdrdn)
--
-- Reemplaza la policy placeholder `authenticated_all` (creada en la migración
-- inicial) por policies que validan `public.staff.role_id -> public.roles.permissions`.
-- Idempotente: se puede correr múltiples veces sin error.
--
-- Cómo ejecutarlo: pegar completo en el SQL Editor de Supabase y ejecutar.
-- Requiere que la migración inicial (SQL - Migración inicial) ya haya corrido.
--
-- Para revertir (volver a la policy placeholder abierta):
--   -- por cada tabla: drop policy si existe la respectiva _select/_insert/_update/_delete
--   -- y recrear: create policy authenticated_all on <schema>.<tabla> for all
--   --   to authenticated using (true) with check (true);
--   drop function if exists public.has_permission(text, text) cascade;
--   drop function if exists public.current_schema_access(text) cascade;
--   drop function if exists public.current_restaurant_access() cascade;
--   drop function if exists public.current_hotel_access() cascade;
--   drop function if exists public.current_permissions() cascade;
--   drop function if exists public.current_role_id() cascade;
--   drop function if exists public.is_active_staff() cascade;
--   drop function if exists public.current_staff() cascade;
-- ============================================================================

-- ============================================================================
-- 1. FUNCIONES AUXILIARES (SECURITY DEFINER — leen staff/roles sin pasar por RLS)
-- ============================================================================

-- Fila completa de public.staff del usuario logueado (o ninguna fila si no existe / inactivo).
create or replace function public.current_staff()
returns public.staff
language sql stable security definer set search_path = public
as $$
  select * from public.staff where id = auth.uid() and active;
$$;

create or replace function public.current_role_id()
returns uuid
language sql stable security definer set search_path = public
as $$
  select role_id from public.staff where id = auth.uid() and active;
$$;

-- jsonb de permisos del rol actual, p.ej. {"reservations": true, "checkin": true}.
create or replace function public.current_permissions()
returns jsonb
language sql stable security definer set search_path = public
as $$
  select coalesce(r.permissions, '{}'::jsonb)
  from public.roles r
  where r.id = public.current_role_id();
$$;

create or replace function public.current_hotel_access()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce(r.hotel_access, false)
  from public.roles r
  where r.id = public.current_role_id();
$$;

create or replace function public.current_restaurant_access()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce(r.restaurant_access, false)
  from public.roles r
  where r.id = public.current_role_id();
$$;

create or replace function public.is_active_staff()
returns boolean
language sql stable security definer set search_path = public
as $$
  select public.current_role_id() is not null;
$$;

-- true si el rol actual tiene 'all', el recurso puntual, o el fallback read_all/write_all
-- (usado por 'manager'). mode: 'read' | 'write'.
create or replace function public.has_permission(resource text, mode text default 'write')
returns boolean
language sql stable security definer set search_path = public
as $$
  select
    coalesce((public.current_permissions()->>'all')::boolean, false)
    or coalesce((public.current_permissions()->>resource)::boolean, false)
    or (mode = 'read' and coalesce((public.current_permissions()->>'read_all')::boolean, false))
    or (mode = 'write' and coalesce((public.current_permissions()->>'write_all')::boolean, false));
$$;

-- Puerta de schema: hotel.* requiere hotel_access, restaurante.* requiere restaurant_access.
create or replace function public.current_schema_access(target_schema text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select case target_schema
    when 'hotel' then public.current_hotel_access()
    when 'restaurante' then public.current_restaurant_access()
    else true
  end;
$$;

-- ============================================================================
-- 2. Convención de recursos (resource key -> tablas -> vista del plan)
--
--   settings          hotel.config, feature_flags, print_templates, message_templates, i18n_labels
--   catalogs           buildings, bed_types, room_types, amenities_catalog, identification_types,
--                       sales_channels, rate_periods
--   guest_tags          guest_tags
--   rooms               rooms (+ 'housekeeping' en OR), room_blocks
--   packages            packages
--   guests              guests, guest_tag_assignments
--   companies           companies, corporate_rates
--   discounts           discount_catalog
--   pool                pool_config, pool_bookings
--   reservations        reservations, reservation_guests, reservation_packages,
--                       reservation_discounts, reservation_prints, room_changes
--   guest_requests      guest_requests
--   waitlist            waitlist
--   folios              folios, folio_charges
--   courtesies          courtesies
--   key_cards           key_cards
--   amenity_inventory   amenity_products, amenity_movements
--   housekeeping        housekeeping_tasks (+ escribe hotel.rooms.housekeeping_status)
--   communications      messages_log
--   surveys             surveys, survey_responses
--   accounting          daily_closings
--   roles / staff       public.roles / public.staff (+ excepción de fila propia)
--   notifications       public.notifications (+ excepción recipient_id = propio)
--   audit               public.audit_log (solo lectura, inmutable)
--   guests (public)     public.user_profiles (+ excepción id = propio)
--   menu / promotions / tables / inventory / shifts / orders / order_items / tickets / payments
--                       restaurante.* (ver mapeo en el loop más abajo)
--
-- Estos resource keys son el vocabulario que la vista de Roles (Fase 5.6) usará para
-- construir `permissions jsonb`. Agregar acceso a un rol no requiere nueva migración,
-- solo editar la fila de public.roles.
-- ============================================================================

-- ============================================================================
-- 3. Tablas especiales (excluidas del loop genérico — necesitan reglas propias)
-- ============================================================================

-- hotel.config: lectura abierta a cualquier staff activo (branding/labels los usa toda la UI).
drop policy if exists authenticated_all on hotel.config;
drop policy if exists config_select on hotel.config;
drop policy if exists config_write on hotel.config;
create policy config_select on hotel.config for select to authenticated using (public.is_active_staff());
create policy config_write on hotel.config for update to authenticated
  using (public.current_hotel_access() and public.has_permission('settings', 'write'))
  with check (public.current_hotel_access() and public.has_permission('settings', 'write'));

drop policy if exists authenticated_all on hotel.feature_flags;
drop policy if exists feature_flags_select on hotel.feature_flags;
drop policy if exists feature_flags_write on hotel.feature_flags;
create policy feature_flags_select on hotel.feature_flags for select to authenticated using (public.is_active_staff());
create policy feature_flags_write on hotel.feature_flags for all to authenticated
  using (public.current_hotel_access() and public.has_permission('settings', 'write'))
  with check (public.current_hotel_access() and public.has_permission('settings', 'write'));

drop policy if exists authenticated_all on hotel.i18n_labels;
drop policy if exists i18n_labels_select on hotel.i18n_labels;
drop policy if exists i18n_labels_write on hotel.i18n_labels;
create policy i18n_labels_select on hotel.i18n_labels for select to authenticated using (public.is_active_staff());
create policy i18n_labels_write on hotel.i18n_labels for all to authenticated
  using (public.current_hotel_access() and public.has_permission('settings', 'write'))
  with check (public.current_hotel_access() and public.has_permission('settings', 'write'));

-- hotel.rooms: camarista (permiso 'housekeeping') necesita poder actualizar la fila completa
-- para cambiar housekeeping_status (no hay restricción a nivel de columna vía RLS), pero no
-- crear/borrar habitaciones — eso queda solo para 'rooms'.
drop policy if exists authenticated_all on hotel.rooms;
drop policy if exists rooms_select on hotel.rooms;
drop policy if exists rooms_insert on hotel.rooms;
drop policy if exists rooms_update on hotel.rooms;
drop policy if exists rooms_delete on hotel.rooms;
create policy rooms_select on hotel.rooms for select to authenticated using (
  public.current_hotel_access() and (public.has_permission('rooms', 'read') or public.has_permission('housekeeping', 'read'))
);
create policy rooms_insert on hotel.rooms for insert to authenticated with check (
  public.current_hotel_access() and public.has_permission('rooms', 'write')
);
create policy rooms_update on hotel.rooms for update to authenticated using (
  public.current_hotel_access() and (public.has_permission('rooms', 'write') or public.has_permission('housekeeping', 'write'))
) with check (
  public.current_hotel_access() and (public.has_permission('rooms', 'write') or public.has_permission('housekeeping', 'write'))
);
create policy rooms_delete on hotel.rooms for delete to authenticated using (
  public.current_hotel_access() and public.has_permission('rooms', 'write')
);

-- public.staff: cualquier staff puede leer su propia fila (login lo necesita); escribir
-- requiere permiso 'staff' (Fase 5.7).
drop policy if exists authenticated_all on public.staff;
drop policy if exists staff_select on public.staff;
drop policy if exists staff_insert on public.staff;
drop policy if exists staff_update on public.staff;
drop policy if exists staff_delete on public.staff;
create policy staff_select on public.staff for select to authenticated using (
  id = auth.uid() or public.has_permission('staff', 'read')
);
create policy staff_insert on public.staff for insert to authenticated with check (public.has_permission('staff', 'write'));
create policy staff_update on public.staff for update to authenticated
  using (public.has_permission('staff', 'write')) with check (public.has_permission('staff', 'write'));
create policy staff_delete on public.staff for delete to authenticated using (public.has_permission('staff', 'write'));

-- public.roles: cualquier staff puede leer su propio rol (para saber sus permisos en la UI);
-- listar/editar todos los roles requiere permiso 'roles' (Fase 5.6).
drop policy if exists authenticated_all on public.roles;
drop policy if exists roles_select on public.roles;
drop policy if exists roles_insert on public.roles;
drop policy if exists roles_update on public.roles;
drop policy if exists roles_delete on public.roles;
create policy roles_select on public.roles for select to authenticated using (
  id = public.current_role_id() or public.has_permission('roles', 'read')
);
create policy roles_insert on public.roles for insert to authenticated with check (public.has_permission('roles', 'write'));
create policy roles_update on public.roles for update to authenticated
  using (public.has_permission('roles', 'write')) with check (public.has_permission('roles', 'write'));
create policy roles_delete on public.roles for delete to authenticated using (public.has_permission('roles', 'write'));

-- public.notifications: cada quien ve/marca-leído sus propias notificaciones; cualquier staff
-- activo puede crear una notificación (eventos del sistema disparados desde el cliente);
-- gestión ajena requiere permiso 'notifications'.
drop policy if exists authenticated_all on public.notifications;
drop policy if exists notifications_select on public.notifications;
drop policy if exists notifications_insert on public.notifications;
drop policy if exists notifications_update on public.notifications;
drop policy if exists notifications_delete on public.notifications;
create policy notifications_select on public.notifications for select to authenticated using (
  recipient_id = auth.uid() or public.has_permission('notifications', 'read')
);
create policy notifications_insert on public.notifications for insert to authenticated with check (public.is_active_staff());
create policy notifications_update on public.notifications for update to authenticated
  using (recipient_id = auth.uid() or public.has_permission('notifications', 'write'))
  with check (recipient_id = auth.uid() or public.has_permission('notifications', 'write'));
create policy notifications_delete on public.notifications for delete to authenticated using (
  recipient_id = auth.uid() or public.has_permission('notifications', 'write')
);

-- public.audit_log: inmutable — solo insert (cualquier staff registra su propia acción) y
-- select para quien tenga permiso 'audit'. Sin policy de update/delete (deny por default).
drop policy if exists authenticated_all on public.audit_log;
drop policy if exists audit_log_select on public.audit_log;
drop policy if exists audit_log_insert on public.audit_log;
create policy audit_log_select on public.audit_log for select to authenticated using (public.has_permission('audit', 'read'));
create policy audit_log_insert on public.audit_log for insert to authenticated with check (public.is_active_staff());

-- public.user_profiles: cuenta del huésped (App del Huésped, fuera de este plan pero la tabla
-- ya existe) — el dueño ve/edita su propio perfil; soporte de recepción vía permiso 'guests'.
drop policy if exists authenticated_all on public.user_profiles;
drop policy if exists user_profiles_select on public.user_profiles;
drop policy if exists user_profiles_insert on public.user_profiles;
drop policy if exists user_profiles_update on public.user_profiles;
drop policy if exists user_profiles_delete on public.user_profiles;
create policy user_profiles_select on public.user_profiles for select to authenticated using (
  id = auth.uid() or (public.current_hotel_access() and public.has_permission('guests', 'read'))
);
create policy user_profiles_insert on public.user_profiles for insert to authenticated with check (
  id = auth.uid() or (public.current_hotel_access() and public.has_permission('guests', 'write'))
);
create policy user_profiles_update on public.user_profiles for update to authenticated
  using (id = auth.uid() or (public.current_hotel_access() and public.has_permission('guests', 'write')))
  with check (id = auth.uid() or (public.current_hotel_access() and public.has_permission('guests', 'write')));
create policy user_profiles_delete on public.user_profiles for delete to authenticated using (
  id = auth.uid() or (public.current_hotel_access() and public.has_permission('guests', 'write'))
);

-- ============================================================================
-- 4. Loop genérico: resto de tablas de negocio en hotel.* y restaurante.*
--    (drop authenticated_all + create 4 policies select/insert/update/delete
--    validando schema_access + has_permission(resource, mode))
-- ============================================================================
do $$
declare
  m record;
begin
  for m in
    select * from (values
      -- hotel · catálogos
      ('hotel', 'buildings', 'catalogs'),
      ('hotel', 'bed_types', 'catalogs'),
      ('hotel', 'room_types', 'catalogs'),
      ('hotel', 'amenities_catalog', 'catalogs'),
      ('hotel', 'identification_types', 'catalogs'),
      ('hotel', 'sales_channels', 'catalogs'),
      ('hotel', 'rate_periods', 'catalogs'),
      ('hotel', 'guest_tags', 'guest_tags'),
      -- hotel · plantillas (settings)
      ('hotel', 'print_templates', 'settings'),
      ('hotel', 'message_templates', 'settings'),
      -- hotel · habitaciones y paquetes
      ('hotel', 'room_blocks', 'rooms'),
      ('hotel', 'packages', 'packages'),
      -- hotel · huéspedes
      ('hotel', 'guests', 'guests'),
      ('hotel', 'guest_tag_assignments', 'guests'),
      -- hotel · empresas
      ('hotel', 'companies', 'companies'),
      ('hotel', 'corporate_rates', 'companies'),
      -- hotel · descuentos
      ('hotel', 'discount_catalog', 'discounts'),
      -- hotel · alberca
      ('hotel', 'pool_config', 'pool'),
      ('hotel', 'pool_bookings', 'pool'),
      -- hotel · reservas
      ('hotel', 'reservations', 'reservations'),
      ('hotel', 'reservation_guests', 'reservations'),
      ('hotel', 'reservation_packages', 'reservations'),
      ('hotel', 'reservation_discounts', 'reservations'),
      ('hotel', 'reservation_prints', 'reservations'),
      ('hotel', 'room_changes', 'reservations'),
      ('hotel', 'guest_requests', 'guest_requests'),
      ('hotel', 'waitlist', 'waitlist'),
      -- hotel · financiero
      ('hotel', 'folios', 'folios'),
      ('hotel', 'folio_charges', 'folios'),
      ('hotel', 'courtesies', 'courtesies'),
      -- hotel · tarjetas
      ('hotel', 'key_cards', 'key_cards'),
      -- hotel · inventario amenidades
      ('hotel', 'amenity_products', 'amenity_inventory'),
      ('hotel', 'amenity_movements', 'amenity_inventory'),
      -- hotel · housekeeping
      ('hotel', 'housekeeping_tasks', 'housekeeping'),
      -- hotel · comunicación
      ('hotel', 'messages_log', 'communications'),
      ('hotel', 'surveys', 'surveys'),
      ('hotel', 'survey_responses', 'surveys'),
      -- hotel · cierre contable
      ('hotel', 'daily_closings', 'accounting'),
      -- restaurante · menú
      ('restaurante', 'categories', 'menu'),
      ('restaurante', 'units', 'menu'),
      ('restaurante', 'menu_items', 'menu'),
      ('restaurante', 'modifiers', 'menu'),
      ('restaurante', 'menu_item_modifiers', 'menu'),
      -- restaurante · promociones
      ('restaurante', 'promotions', 'promotions'),
      ('restaurante', 'promotion_menu_items', 'promotions'),
      -- restaurante · mesas
      ('restaurante', 'areas', 'tables'),
      ('restaurante', 'tables', 'tables'),
      ('restaurante', 'table_reservations', 'tables'),
      -- restaurante · inventario
      ('restaurante', 'products', 'inventory'),
      ('restaurante', 'recipes', 'inventory'),
      ('restaurante', 'stock_movements', 'inventory'),
      -- restaurante · turnos
      ('restaurante', 'shifts', 'shifts'),
      -- restaurante · comandas
      ('restaurante', 'orders', 'orders'),
      ('restaurante', 'order_table_changes', 'orders'),
      ('restaurante', 'order_items', 'order_items'),
      ('restaurante', 'order_item_modifiers', 'order_items'),
      -- restaurante · tickets y pagos
      ('restaurante', 'tickets', 'tickets'),
      ('restaurante', 'ticket_splits', 'tickets'),
      ('restaurante', 'ticket_payments', 'payments')
    ) as t(schemaname, tablename, resource)
  loop
    execute format('drop policy if exists authenticated_all on %I.%I', m.schemaname, m.tablename);
    execute format('drop policy if exists %I on %I.%I', m.tablename || '_select', m.schemaname, m.tablename);
    execute format('drop policy if exists %I on %I.%I', m.tablename || '_insert', m.schemaname, m.tablename);
    execute format('drop policy if exists %I on %I.%I', m.tablename || '_update', m.schemaname, m.tablename);
    execute format('drop policy if exists %I on %I.%I', m.tablename || '_delete', m.schemaname, m.tablename);

    execute format(
      'create policy %I on %I.%I for select to authenticated using (public.current_schema_access(%L) and public.has_permission(%L, ''read''))',
      m.tablename || '_select', m.schemaname, m.tablename, m.schemaname, m.resource
    );
    execute format(
      'create policy %I on %I.%I for insert to authenticated with check (public.current_schema_access(%L) and public.has_permission(%L, ''write''))',
      m.tablename || '_insert', m.schemaname, m.tablename, m.schemaname, m.resource
    );
    execute format(
      'create policy %I on %I.%I for update to authenticated using (public.current_schema_access(%L) and public.has_permission(%L, ''write'')) with check (public.current_schema_access(%L) and public.has_permission(%L, ''write''))',
      m.tablename || '_update', m.schemaname, m.tablename, m.schemaname, m.resource, m.schemaname, m.resource
    );
    execute format(
      'create policy %I on %I.%I for delete to authenticated using (public.current_schema_access(%L) and public.has_permission(%L, ''write''))',
      m.tablename || '_delete', m.schemaname, m.tablename, m.schemaname, m.resource
    );
  end loop;
end $$;

-- ============================================================================
-- 5. Verificación
-- ============================================================================
-- select tablename, policyname, cmd from pg_policies
-- where schemaname in ('hotel','restaurante','public') and policyname = 'authenticated_all';
-- -- Esperado: 0 filas (ninguna tabla se quedó con la policy placeholder).
--
-- Login con rol 'recepcion' (hotel_access=true, permissions={"reservations":true,"checkin":true,
-- "folios":true,"key_cards":true}) y correr como ese usuario:
--   select * from hotel.reservations limit 1;  -- debe funcionar
--   select * from public.roles;                -- debe devolver 0 filas
-- ============================================================================
