-- ============================================================
-- Sprint 5D-1 — Multi-Tenant Core
-- Lok'al Business Factory
--
-- INSTRUCCIONES DE EJECUCIÓN:
--   1. Ejecutar PRIMERO en un proyecto Supabase de STAGING.
--   2. Correr todos los tests de verificación al final.
--   3. Solo ejecutar en producción después de aprobación explícita de Sprint 5D-8.
--
-- QUÉ HACE ESTA MIGRACIÓN:
--   - Crea la tabla public.businesses (raíz del modelo multi-tenant)
--   - Inserta Tacos El Compache como business #1 (slug: 'compache')
--   - Agrega business_id a categories, products, orders, order_items, payments
--   - Hace backfill de todas las filas existentes a business_id = compache
--   - Reemplaza UNIQUE(slug) en categories por UNIQUE(business_id, slug)
--   - Agrega índices de performance por business_id en todas las tablas
--   - Actualiza políticas RLS para filtrar por negocio activo
--   - Agrega función helper current_business_id()
--   - Habilita RLS en la tabla businesses
--
-- QUÉ NO HACE:
--   - No modifica el checkout, el admin ni los pagos (Sprint 5D-4/5)
--   - No elimina ni renombra ninguna columna existente
--   - No cambia las políticas de orders/order_items/payments (ya bloqueadas)
--   - No guarda tokens de Mercado Pago todavía
--
-- PREREQUISITO VERIFICADO (auditoría 5D-0):
--   - categories.slug UNIQUE constraint se llama 'categories_slug_key'
--   - La tabla businesses NO existe en el proyecto actual
--   - pgcrypto ya está instalado (migration 0001_init.sql)
--   - 3 órdenes de prueba existentes → backfill aplica correctamente
-- ============================================================

begin;

-- ================================================================
-- BLOQUE 1 — Tabla businesses
-- ================================================================

create table if not exists public.businesses (
  id              uuid        primary key default gen_random_uuid(),

  -- Identificador único URL-safe del negocio.
  -- Determina el subdominio: {slug}.lok-al.mx
  slug            text        not null unique
                  check (slug ~ '^[a-z0-9][a-z0-9-]{0,29}$'),

  -- Nombre para mostrar en el panel interno de Lok'al.
  name            text        not null,

  -- Configuración del negocio serializada como JSON canónico.
  -- Origen: business.json generado por Sprint 5C Factory.
  -- Equivale a src/config/business.ts en la arquitectura per-business.
  config          jsonb       not null default '{}',

  -- Configuración visual serializada como JSON canónico.
  -- Origen: theme.json generado por Sprint 5C Factory.
  -- Equivale a src/config/theme.ts en la arquitectura per-business.
  theme           jsonb       not null default '{}',

  -- Metadata estratégica generada por Claude (businessDNA).
  -- Uso futuro: búsqueda semántica, matching, recomendaciones Lok'al.
  dna             jsonb,

  -- Token de Mercado Pago cifrado con AES-256-CBC server-side.
  -- El cifrado/descifrado ocurre en Node.js usando LOKAL_ENCRYPTION_KEY.
  -- NULL = negocio en modo demo (checkout simulado, sin cobro real).
  -- Se configura por el dueño desde /admin/configurar post-launch.
  mp_token_enc    text,

  -- Hash bcrypt de la contraseña del panel de administración.
  -- NULL = sin contraseña configurada (modo abierto, solo para staging).
  admin_pwd_hash  text,

  -- Estado del negocio. Solo los activos se sirven en producción.
  active          boolean     not null default true,

  -- Plan de suscripción. Reservado para uso futuro de Lok'al.
  plan            text        not null default 'free'
                  check (plan in ('free', 'starter', 'pro')),

  -- Dominio personalizado opcional (ej: mi-negocio.com).
  -- Cuando está configurado, anula el subdominio lok-al.mx.
  custom_domain   text        unique,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Índices de la tabla businesses
create index if not exists businesses_slug_idx
  on public.businesses(slug);

create index if not exists businesses_domain_idx
  on public.businesses(custom_domain)
  where custom_domain is not null;

-- ================================================================
-- BLOQUE 2 — Insertar Tacos El Compache como business #1
-- ================================================================
-- ON CONFLICT DO NOTHING: idempotente si se ejecuta dos veces.
-- Los campos config/theme/dna se llenan en el Sprint 5D-8 (migración producción).

insert into public.businesses (slug, name)
values ('compache', 'Tacos el Compache de Ah Mun')
on conflict (slug) do nothing;

-- ================================================================
-- BLOQUE 3 — Agregar business_id a todas las tablas
-- ================================================================
-- Usa un bloque DO para capturar el UUID de Tacos El Compache y usarlo
-- como DEFAULT y como target del backfill en la misma transacción.
--
-- El patrón es:
--   1. ADD COLUMN con DEFAULT = compache_id   → filas existentes obtienen el valor
--   2. UPDATE ... WHERE business_id IS NULL   → backfill explícito (redundante pero seguro)
--   3. ALTER COLUMN SET NOT NULL              → forzar integridad al final
--
-- El DEFAULT se elimina después del NOT NULL para no afectar futuros inserts
-- (los inserts de negocios nuevos deben proveer business_id explícitamente).

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

  raise notice 'Migrando a multi-tenant. compache_id = %', compache_id;

  -- Pattern: ADD COLUMN nullable (no DEFAULT) → UPDATE backfill → SET NOT NULL.
  -- PostgreSQL does not allow a PL/pgSQL variable as a column DEFAULT expression,
  -- so we skip the DEFAULT clause and backfill immediately with an UPDATE.

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

  raise notice 'Backfill completo para todas las tablas.';

  -- ── Agregar NOT NULL constraint ───────────────────────────────
  -- Safe at this point: the UPDATE above guarantees no NULLs remain.

  alter table public.categories  alter column business_id set not null;
  alter table public.products     alter column business_id set not null;
  alter table public.orders       alter column business_id set not null;
  alter table public.order_items  alter column business_id set not null;
  alter table public.payments     alter column business_id set not null;

  raise notice 'NOT NULL constraints aplicados.';

end $$;

-- ================================================================
-- BLOQUE 4 — Cambiar constraint UNIQUE en categories
-- ================================================================
-- ANTES: UNIQUE(slug)          — global, bloquearía dos negocios con misma categoría
-- DESPUÉS: UNIQUE(business_id, slug) — por negocio, permite slugs repetidos entre negocios
--
-- El constraint original se llama 'categories_slug_key'
-- (nombre autogenerado por PostgreSQL para "slug text not null unique" en 0001_init.sql)

alter table public.categories
  drop constraint if exists categories_slug_key;

alter table public.categories
  add constraint categories_business_slug_unique
  unique (business_id, slug);

-- NOTA: El archivo supabase/seed.sql usa ON CONFLICT (slug) — deberá actualizarse
-- en Sprint 5D-3 a: ON CONFLICT (business_id, slug). Ver comentario al final.

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
-- Lee el slug del contexto de la sesión PostgreSQL y retorna el UUID
-- correspondiente. El servidor inyecta el slug via SET LOCAL antes
-- de ejecutar queries con el anon key.
--
-- current_setting('app.business_slug', true):
--   El segundo argumento (true) = missing_ok. Si no está seteado,
--   devuelve NULL en lugar de lanzar un error. Esto hace la función
--   segura incluso cuando el contexto no está configurado.

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
-- BLOQUE 7 — Actualizar políticas RLS
-- ================================================================
-- Las políticas de 0001_init.sql usaban `using (true)` o `using (available = true)`
-- sin filtrar por negocio. Las reemplazamos para filtrar por current_business_id().
--
-- IMPORTANTE: Las tablas orders/order_items/payments NO tienen políticas anon
-- (bloqueadas por defecto en 0001). NO se modifican aquí — siguen bloqueadas.
-- Solo el service_role (servidor) puede leer/escribir esas tablas.

-- ── categories ────────────────────────────────────────────────────
drop policy if exists "categorias visibles" on public.categories;

create policy "categorias visibles"
  on public.categories
  for select
  using (
    business_id = public.current_business_id()
  );

-- ── products ──────────────────────────────────────────────────────
drop policy if exists "productos disponibles visibles" on public.products;

create policy "productos disponibles visibles"
  on public.products
  for select
  using (
    available   = true
    and business_id = public.current_business_id()
  );

-- ================================================================
-- BLOQUE 8 — RLS en tabla businesses
-- ================================================================
-- El anon key puede leer la fila del negocio activo (para cargar config/theme).
-- NO puede leer mp_token_enc ni admin_pwd_hash (esas columnas se excluyen
-- en el SELECT del servidor; la RLS no selecciona columnas, solo filas).
-- El service_role bypassa RLS y puede leer todo.

alter table public.businesses enable row level security;

drop policy if exists "business activo visible" on public.businesses;

create policy "business activo visible"
  on public.businesses
  for select
  using (
    active = true
    and slug = current_setting('app.business_slug', true)
  );

-- ================================================================
-- VERIFICACIÓN INLINE — Se ejecuta como parte del COMMIT
-- ================================================================
-- Estas sentencias fallan (raise exception) si algo salió mal,
-- forzando el rollback de toda la transacción.

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

  -- 1. businesses tiene exactamente 1 fila (compache)
  select count(*) into biz_count from public.businesses;
  if biz_count < 1 then
    raise exception 'VERIFICACIÓN FALLIDA: businesses está vacío.';
  end if;

  -- 2. Ninguna tabla tiene NULLs en business_id
  select count(*) into cat_null   from public.categories  where business_id is null;
  select count(*) into prod_null  from public.products     where business_id is null;
  select count(*) into ord_null   from public.orders       where business_id is null;
  select count(*) into items_null from public.order_items  where business_id is null;
  select count(*) into pay_null   from public.payments     where business_id is null;

  if cat_null + prod_null + ord_null + items_null + pay_null > 0 then
    raise exception 'VERIFICACIÓN FALLIDA: Filas con business_id NULL. cat=%, prod=%, ord=%, items=%, pay=%',
      cat_null, prod_null, ord_null, items_null, pay_null;
  end if;

  -- 3. El constraint compuesto existe en categories
  select exists(
    select 1 from pg_constraint
    where conname = 'categories_business_slug_unique'
    and   conrelid = 'public.categories'::regclass
  ) into constraint_ok;

  if not constraint_ok then
    raise exception 'VERIFICACIÓN FALLIDA: Constraint categories_business_slug_unique no existe.';
  end if;

  -- 4. El constraint global ya no existe
  if exists(
    select 1 from pg_constraint
    where conname = 'categories_slug_key'
    and   conrelid = 'public.categories'::regclass
  ) then
    raise exception 'VERIFICACIÓN FALLIDA: categories_slug_key todavía existe. DROP falló.';
  end if;

  -- 5. La función current_business_id existe
  if not exists(
    select 1 from pg_proc
    where proname = 'current_business_id'
    and   pronamespace = 'public'::regnamespace
  ) then
    raise exception 'VERIFICACIÓN FALLIDA: Función current_business_id() no encontrada.';
  end if;

  raise notice '=== TODAS LAS VERIFICACIONES PASARON ===';
  raise notice 'businesses: % fila(s)', biz_count;
  raise notice 'NULL business_id — cat:% prod:% ord:% items:% pay:%',
    cat_null, prod_null, ord_null, items_null, pay_null;
  raise notice 'Constraint categories_business_slug_unique: OK';
  raise notice 'Función current_business_id(): OK';

end $$;

commit;

-- ================================================================
-- NOTA PARA SPRINT 5D-3:
-- ================================================================
-- El archivo supabase/seed.sql contiene:
--   on conflict (slug) do update ...
-- Debe actualizarse a:
--   on conflict (business_id, slug) do update ...
-- y agregar business_id en el INSERT. NO modificar en este sprint.
--
-- Los archivos output/*/seed.sql del Sprint 5A también usan
--   ON CONFLICT (slug) — deben actualizarse en Sprint 5D-3.
-- ================================================================
