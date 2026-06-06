-- ============================================================
-- Sprint 5D — Multi-Tenant Core (Phase 1 of 2: Nullable)
-- Lok'al Business Factory
--
-- PRODUCTION DEPLOYMENT ORDER:
--   Step 1. Deploy new application code to Vercel (backward compatible).
--   Step 2. Execute THIS file (0002a) in the production SQL Editor.
--   Step 3. Execute UPDATE businesses SET config = ... immediately after.
--   Step 4. Run REST POST-CHECKs to verify state.
--   Step 5. Execute 0002b_multitenant_notnull.sql after at least one
--           new order has been confirmed to carry business_id.
--
-- WHAT THIS FILE DOES:
--   - Creates table public.businesses (multi-tenant root)
--   - Inserts Tacos El Compache as business #1 (slug: 'compache')
--   - Adds business_id (NULLABLE) to:
--       categories, products, orders, order_items, payments
--   - Backfills all existing rows with business_id = compache UUID
--   - Replaces UNIQUE(slug) on categories with UNIQUE(business_id, slug)
--   - Creates performance indexes on business_id in all 5 tables
--   - Creates helper function current_business_id()
--
-- WHAT THIS FILE INTENTIONALLY DOES NOT DO:
--   - Does NOT add NOT NULL constraints — deferred to 0002b.
--   - Does NOT modify RLS policies — deferred to a future sprint
--     (requires fetchMenu() to be updated to use service_role first).
--
-- WHY NULLABLE FIRST:
--   Keeping business_id nullable in this phase creates a safe intermediate
--   state (S2) where both the old code and the new code can operate:
--     - Old code (pre-deploy):  inserts without business_id → NULL is allowed.
--     - New code (post-deploy): inserts with business_id via scopedInsert().
--   This means code rollback and DB rollback are independently safe.
--
-- ROLLBACK (if needed after this file runs):
--   ALTER TABLE public.payments    DROP COLUMN IF EXISTS business_id;
--   ALTER TABLE public.order_items DROP COLUMN IF EXISTS business_id;
--   ALTER TABLE public.orders      DROP COLUMN IF EXISTS business_id;
--   ALTER TABLE public.products    DROP COLUMN IF EXISTS business_id;
--   ALTER TABLE public.categories  DROP COLUMN IF EXISTS business_id;
--   ALTER TABLE public.categories  DROP CONSTRAINT IF EXISTS categories_business_slug_unique;
--   ALTER TABLE public.categories  ADD CONSTRAINT categories_slug_key UNIQUE (slug);
--   DROP INDEX IF EXISTS payments_business_idx;
--   DROP INDEX IF EXISTS order_items_business_idx;
--   DROP INDEX IF EXISTS orders_business_created_idx;
--   DROP INDEX IF EXISTS orders_business_idx;
--   DROP INDEX IF EXISTS products_business_idx;
--   DROP INDEX IF EXISTS categories_business_idx;
--   DROP FUNCTION IF EXISTS public.current_business_id();
--   DROP TABLE IF EXISTS public.businesses CASCADE;
--
-- STAGING REFERENCE:
--   0002a + 0002b together are equivalent to 0002_multitenant.sql,
--   which was validated in staging on 2026-06-06 (7/7 POST-CHECKs passed).
-- ============================================================

begin;

-- ================================================================
-- BLOQUE 1 — Tabla businesses
-- ================================================================

create table if not exists public.businesses (
  id              uuid        primary key default gen_random_uuid(),

  slug            text        not null unique
                  check (slug ~ '^[a-z0-9][a-z0-9-]{0,29}$'),

  name            text        not null,

  config          jsonb       not null default '{}',

  theme           jsonb       not null default '{}',

  dna             jsonb,

  mp_token_enc    text,

  admin_pwd_hash  text,

  active          boolean     not null default true,

  plan            text        not null default 'free'
                  check (plan in ('free', 'starter', 'pro')),

  custom_domain   text        unique,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists businesses_slug_idx
  on public.businesses(slug);

create index if not exists businesses_domain_idx
  on public.businesses(custom_domain)
  where custom_domain is not null;

-- ================================================================
-- BLOQUE 2 — Insertar Tacos El Compache como business #1
-- ================================================================

insert into public.businesses (slug, name)
values ('compache', 'Tacos el Compache de Ah Mun')
on conflict (slug) do nothing;

-- ================================================================
-- BLOQUE 3 — Agregar business_id (nullable) a todas las tablas
-- ================================================================
-- Two-step pattern per table: ADD COLUMN (nullable) → UPDATE backfill.
-- NOT NULL is applied separately in 0002b after the application layer
-- has been verified in production.

do $$
declare
  compache_id uuid;
begin

  select id into compache_id
  from public.businesses
  where slug = 'compache';

  if compache_id is null then
    raise exception 'ABORT: No se encontró el negocio compache. Verificar bloque 2.';
  end if;

  raise notice 'Migrando a multi-tenant (fase nullable). compache_id = %', compache_id;

  -- ── categories ────────────────────────────────────────────────
  alter table public.categories
    add column if not exists business_id uuid
    references public.businesses(id) on delete cascade;

  update public.categories
  set business_id = compache_id
  where business_id is null;

  -- ── products ──────────────────────────────────────────────────
  alter table public.products
    add column if not exists business_id uuid
    references public.businesses(id) on delete cascade;

  update public.products
  set business_id = compache_id
  where business_id is null;

  -- ── orders ────────────────────────────────────────────────────
  alter table public.orders
    add column if not exists business_id uuid
    references public.businesses(id) on delete cascade;

  update public.orders
  set business_id = compache_id
  where business_id is null;

  -- ── order_items ───────────────────────────────────────────────
  alter table public.order_items
    add column if not exists business_id uuid
    references public.businesses(id) on delete cascade;

  update public.order_items
  set business_id = compache_id
  where business_id is null;

  -- ── payments ──────────────────────────────────────────────────
  alter table public.payments
    add column if not exists business_id uuid
    references public.businesses(id) on delete cascade;

  update public.payments
  set business_id = compache_id
  where business_id is null;

  raise notice 'Backfill completo — todas las filas existentes tienen business_id.';
  raise notice 'Las columnas son NULLABLE en esta fase. NOT NULL se aplica en 0002b.';

end $$;

-- ================================================================
-- BLOQUE 4 — Cambiar constraint UNIQUE en categories
-- ================================================================
-- ANTES:  UNIQUE(slug)               — global, bloquearía slugs repetidos entre negocios.
-- DESPUÉS: UNIQUE(business_id, slug) — por negocio, permite slugs repetidos entre negocios.

alter table public.categories
  drop constraint if exists categories_slug_key;

alter table public.categories
  add constraint categories_business_slug_unique
  unique (business_id, slug);

-- ================================================================
-- BLOQUE 5 — Índices de performance por business_id
-- ================================================================

create index if not exists categories_business_idx
  on public.categories(business_id);

create index if not exists products_business_idx
  on public.products(business_id);

create index if not exists orders_business_idx
  on public.orders(business_id);

create index if not exists orders_business_created_idx
  on public.orders(business_id, created_at desc);

create index if not exists order_items_business_idx
  on public.order_items(business_id);

create index if not exists payments_business_idx
  on public.payments(business_id);

-- ================================================================
-- BLOQUE 6 — Función helper current_business_id()
-- ================================================================
-- Prepared for future RLS policies (Phase 3). Safe to create now —
-- it is not used by any active RLS policy in this phase.

create or replace function public.current_business_id()
returns uuid
language sql
stable
security definer
as $$
  select id
  from   public.businesses
  where  slug   = current_setting('app.business_slug', true)
  and    active = true
  limit  1;
$$;

-- ================================================================
-- RLS — NO CHANGES IN THIS PHASE
-- ================================================================
-- Existing policies from 0001_init.sql remain active:
--   categories: FOR SELECT USING (true)
--   products:   FOR SELECT USING (available = true)
--
-- These policies allow fetchMenu() via anon key to continue reading
-- all rows. The application layer applies .eq("business_id", id)
-- explicitly for tenant isolation — RLS is defense-in-depth.
--
-- RLS will be updated to use current_business_id() in a future
-- sprint, after fetchMenu() is updated to use the service_role
-- client instead of the anon client.

-- ================================================================
-- VERIFICACIÓN INLINE
-- ================================================================

do $$
declare
  biz_count     int;
  cat_null      int;
  prod_null     int;
  ord_null      int;
  items_null    int;
  pay_null      int;
  constraint_ok boolean;
begin

  -- 1. businesses tiene al menos 1 fila
  select count(*) into biz_count from public.businesses;
  if biz_count < 1 then
    raise exception 'VERIFICACIÓN FALLIDA: businesses está vacío.';
  end if;

  -- 2. Backfill completo — 0 NULLs en business_id
  select count(*) into cat_null   from public.categories  where business_id is null;
  select count(*) into prod_null  from public.products     where business_id is null;
  select count(*) into ord_null   from public.orders       where business_id is null;
  select count(*) into items_null from public.order_items  where business_id is null;
  select count(*) into pay_null   from public.payments     where business_id is null;

  if cat_null + prod_null + ord_null + items_null + pay_null > 0 then
    raise exception
      'VERIFICACIÓN FALLIDA: Filas con business_id NULL tras backfill. cat=% prod=% ord=% items=% pay=%',
      cat_null, prod_null, ord_null, items_null, pay_null;
  end if;

  -- 3. Constraint compuesto existe en categories
  select exists(
    select 1 from pg_constraint
    where conname   = 'categories_business_slug_unique'
    and   conrelid  = 'public.categories'::regclass
  ) into constraint_ok;

  if not constraint_ok then
    raise exception 'VERIFICACIÓN FALLIDA: Constraint categories_business_slug_unique no existe.';
  end if;

  -- 4. Constraint global ya no existe
  if exists(
    select 1 from pg_constraint
    where conname   = 'categories_slug_key'
    and   conrelid  = 'public.categories'::regclass
  ) then
    raise exception 'VERIFICACIÓN FALLIDA: categories_slug_key todavía existe. DROP falló.';
  end if;

  -- 5. Función current_business_id() existe
  if not exists(
    select 1 from pg_proc
    where proname      = 'current_business_id'
    and   pronamespace = 'public'::regnamespace
  ) then
    raise exception 'VERIFICACIÓN FALLIDA: Función current_business_id() no encontrada.';
  end if;

  raise notice '=== FASE 1 (NULLABLE) — TODAS LAS VERIFICACIONES PASARON ===';
  raise notice 'businesses: % fila(s)', biz_count;
  raise notice 'Backfill OK — NULL business_id: cat=% prod=% ord=% items=% pay=%',
    cat_null, prod_null, ord_null, items_null, pay_null;
  raise notice 'Constraint categories_business_slug_unique: OK';
  raise notice 'Función current_business_id(): OK';
  raise notice 'RLS: SIN CAMBIOS (políticas de 0001 activas).';
  raise notice 'SIGUIENTE PASO: Ejecutar UPDATE businesses SET config = ... y luego 0002b.';

end $$;

commit;
