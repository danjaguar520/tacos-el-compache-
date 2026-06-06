-- ============================================================
-- Sprint 5D — Multi-Tenant Core (Phase 2 of 2: NOT NULL)
-- Lok'al Business Factory
--
-- PREREQUISITES — ALL must be true before running this file:
--   ✓ 0002a_multitenant_nullable.sql executed and verified.
--   ✓ New application code deployed to Vercel (build verified).
--   ✓ UPDATE businesses SET config = ... executed (nombre field set).
--   ✓ At least ONE new order confirmed to have business_id set
--     (query: SELECT business_id FROM orders ORDER BY created_at DESC LIMIT 1).
--   ✓ REST POST-CHECKs from Phase 1 passed.
--
-- WHAT THIS FILE DOES:
--   - Verifies 0 rows have NULL business_id in all 5 tables.
--   - Applies NOT NULL constraint to business_id in all 5 tables.
--   - Verifies the constraints are active after applying them.
--
-- WHAT THIS FILE INTENTIONALLY DOES NOT DO:
--   - Does NOT modify RLS policies — deferred to a future sprint.
--   - Does NOT add new columns, tables, or indexes.
--   - Does NOT modify existing data.
--
-- EMERGENCY ROLLBACK (< 10 seconds — re-enables old code inserts):
--   ALTER TABLE public.orders       ALTER COLUMN business_id DROP NOT NULL;
--   ALTER TABLE public.order_items  ALTER COLUMN business_id DROP NOT NULL;
--   ALTER TABLE public.payments     ALTER COLUMN business_id DROP NOT NULL;
--   ALTER TABLE public.categories   ALTER COLUMN business_id DROP NOT NULL;
--   ALTER TABLE public.products     ALTER COLUMN business_id DROP NOT NULL;
--   -- Then revert the Vercel deploy if code rollback is also needed.
-- ============================================================

begin;

-- ================================================================
-- PRE-CHECK — Abort if any NULLs exist or Phase 1 is missing
-- ================================================================

do $$
declare
  cat_null   int;
  prod_null  int;
  ord_null   int;
  items_null int;
  pay_null   int;
  total_null int;
begin

  -- Verify Phase 1 was applied (businesses table must exist and have compache)
  if not exists(select 1 from public.businesses where slug = 'compache') then
    raise exception
      'ABORT: Negocio compache no encontrado en public.businesses. '
      'Ejecutar 0002a_multitenant_nullable.sql antes de este archivo.';
  end if;

  -- Verify business_id column exists (Phase 1 added it)
  if not exists(
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'orders'
      and column_name  = 'business_id'
  ) then
    raise exception
      'ABORT: Columna business_id no existe en public.orders. '
      'Ejecutar 0002a_multitenant_nullable.sql antes de este archivo.';
  end if;

  -- Count NULLs — must be 0 (backfill + application layer must have set all values)
  select count(*) into cat_null   from public.categories  where business_id is null;
  select count(*) into prod_null  from public.products     where business_id is null;
  select count(*) into ord_null   from public.orders       where business_id is null;
  select count(*) into items_null from public.order_items  where business_id is null;
  select count(*) into pay_null   from public.payments     where business_id is null;

  total_null := cat_null + prod_null + ord_null + items_null + pay_null;

  if total_null > 0 then
    raise exception
      'ABORT: % fila(s) con business_id NULL. '
      'Verificar que el backfill esté completo y que el nuevo código esté activo. '
      'cat=% prod=% ord=% items=% pay=%',
      total_null, cat_null, prod_null, ord_null, items_null, pay_null;
  end if;

  raise notice 'PRE-CHECK OK: 0 NULLs en business_id. Procediendo con NOT NULL.';

end $$;

-- ================================================================
-- NOT NULL constraints
-- ================================================================

alter table public.categories  alter column business_id set not null;
alter table public.products     alter column business_id set not null;
alter table public.orders       alter column business_id set not null;
alter table public.order_items  alter column business_id set not null;
alter table public.payments     alter column business_id set not null;

-- ================================================================
-- POST-CHECK — Verify all 5 columns are now NOT NULL
-- ================================================================

do $$
declare
  nullable_count int;
begin

  select count(*) into nullable_count
  from information_schema.columns
  where table_schema = 'public'
    and column_name  = 'business_id'
    and table_name   in ('categories', 'products', 'orders', 'order_items', 'payments')
    and is_nullable  = 'YES';

  if nullable_count > 0 then
    raise exception
      'VERIFICACIÓN FALLIDA: % columna(s) business_id siguen siendo nullable tras SET NOT NULL.',
      nullable_count;
  end if;

  raise notice '=== FASE 2 (NOT NULL) — TODAS LAS VERIFICACIONES PASARON ===';
  raise notice 'NOT NULL activo en: categories, products, orders, order_items, payments.';
  raise notice 'Schema multi-tenant completo.';
  raise notice 'RLS definitivo pendiente en Fase 3 (sprint futuro).';
  raise notice '';
  raise notice 'Rollback de emergencia (si necesario):';
  raise notice '  ALTER TABLE orders       ALTER COLUMN business_id DROP NOT NULL;';
  raise notice '  ALTER TABLE order_items  ALTER COLUMN business_id DROP NOT NULL;';
  raise notice '  ALTER TABLE payments     ALTER COLUMN business_id DROP NOT NULL;';
  raise notice '  ALTER TABLE categories   ALTER COLUMN business_id DROP NOT NULL;';
  raise notice '  ALTER TABLE products     ALTER COLUMN business_id DROP NOT NULL;';

end $$;

commit;
