-- ============================================================
-- Tacos El Compache de Ah Mun — Esquema inicial
-- Precios en CENTAVOS (integer) para evitar errores de flotante.
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- Categorías ----------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  sort_order  int  not null default 0
);

-- ---------- Productos ----------
create table if not exists public.products (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid not null references public.categories(id) on delete cascade,
  name         text not null,
  description  text not null default '',
  price_cents  int  not null check (price_cents >= 0),
  image_url    text,
  available    boolean not null default true,
  sort_order   int  not null default 0,
  created_at   timestamptz not null default now()
);
create index if not exists products_category_idx on public.products(category_id);

-- ---------- Clientes (tabla "users" del brief) ----------
create table if not exists public.customers (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  phone       text not null,
  created_at  timestamptz not null default now()
);

-- ---------- Pedidos ----------
create table if not exists public.orders (
  id                uuid primary key default gen_random_uuid(),
  customer_name     text not null,
  customer_phone    text not null,
  notes             text,
  delivery_method   text not null check (delivery_method in ('recoger','domicilio')),
  status            text not null default 'pendiente'
                    check (status in ('recibido','pendiente','pagado','cancelado')),
  subtotal_cents    int  not null check (subtotal_cents >= 0),
  total_cents       int  not null check (total_cents >= 0),
  mp_preference_id  text,
  mp_payment_id     text,
  created_at        timestamptz not null default now()
);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_created_idx on public.orders(created_at desc);

-- ---------- Líneas de pedido ----------
create table if not exists public.order_items (
  id               uuid primary key default gen_random_uuid(),
  order_id         uuid not null references public.orders(id) on delete cascade,
  product_id       uuid references public.products(id) on delete set null,
  product_name     text not null,                 -- snapshot del nombre
  unit_price_cents int  not null check (unit_price_cents >= 0),
  quantity         int  not null check (quantity > 0)
);
create index if not exists order_items_order_idx on public.order_items(order_id);

-- ---------- Pagos ----------
create table if not exists public.payments (
  id                  uuid primary key default gen_random_uuid(),
  order_id            uuid not null references public.orders(id) on delete cascade,
  provider            text not null default 'mercadopago',
  provider_payment_id text,
  status              text not null,
  amount_cents        int  not null check (amount_cents >= 0),
  raw                 jsonb,
  created_at          timestamptz not null default now()
);
create index if not exists payments_order_idx on public.payments(order_id);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.categories  enable row level security;
alter table public.products    enable row level security;
alter table public.customers   enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;
alter table public.payments    enable row level security;

-- Lectura pública (anon) del menú.
drop policy if exists "categorias visibles" on public.categories;
create policy "categorias visibles" on public.categories
  for select using (true);

drop policy if exists "productos disponibles visibles" on public.products;
create policy "productos disponibles visibles" on public.products
  for select using (available = true);

-- Las escrituras de pedidos/pagos y la administración se hacen SOLO con la
-- llave service_role desde el servidor, que omite RLS. No se crean políticas
-- de insert/update/delete para anon: queda bloqueado por defecto.
