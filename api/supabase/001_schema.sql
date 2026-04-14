create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'client'
    check (role in ('client', 'merchant', 'delivery', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text not null default 'Home',
  house_no text,
  street text,
  area text,
  city text,
  pincode text,
  landmark text,
  directions text,
  lat numeric(10, 7),
  lng numeric(10, 7),
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  category text not null,
  description text,
  eta_min integer not null default 15,
  eta_max integer not null default 30,
  distance_km numeric(5, 2) not null default 0,
  rating numeric(2, 1) not null default 0,
  delivery_tag text,
  highlight text,
  image_url text,
  locality_radius_km integer not null default 25,
  otc_only boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.store_staff (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'owner'
    check (role in ('owner', 'manager', 'staff')),
  created_at timestamptz not null default now(),
  unique (store_id, user_id)
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  name text not null,
  description text,
  price numeric(10, 2) not null,
  unit text not null,
  in_stock boolean not null default true,
  is_otc boolean not null default false,
  requires_prescription boolean not null default false,
  image_url text,
  created_at timestamptz not null default now(),
  unique (store_id, name)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  address_id uuid references public.addresses(id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'packing', 'assigned', 'out_for_delivery', 'delivered', 'cancelled')),
  item_total numeric(10, 2) not null default 0,
  delivery_fee numeric(10, 2) not null default 35,
  extra_delivery_fee numeric(10, 2) not null default 0,
  total numeric(10, 2) not null default 0,
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.order_store_groups (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  store_id uuid not null references public.stores(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'packing', 'ready', 'picked_up', 'delivered', 'cancelled')),
  subtotal numeric(10, 2) not null default 0,
  pickup_sequence integer not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_store_group_id uuid not null references public.order_store_groups(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10, 2) not null,
  line_total numeric(10, 2) not null,
  created_at timestamptz not null default now()
);

create table if not exists public.delivery_partners (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references public.profiles(id) on delete cascade,
  vehicle_type text not null default 'bike',
  is_online boolean not null default false,
  todays_earnings numeric(10, 2) not null default 0,
  incentive_total numeric(10, 2) not null default 0,
  payout_time time not null default '09:00',
  created_at timestamptz not null default now()
);

create table if not exists public.delivery_runs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  rider_id uuid references public.delivery_partners(id) on delete set null,
  status text not null default 'available'
    check (status in ('available', 'accepted', 'picked_up', 'delivered', 'cancelled')),
  route_type text not null default 'single'
    check (route_type in ('single', 'stacked', 'same_route', 'split_direction')),
  pickup_count integer not null default 1,
  incentive_amount numeric(10, 2) not null default 0,
  scheduled_payout_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.rider_payouts (
  id uuid primary key default gen_random_uuid(),
  rider_id uuid not null references public.delivery_partners(id) on delete cascade,
  payout_date date not null,
  amount numeric(10, 2) not null,
  status text not null default 'pending'
    check (status in ('pending', 'processed', 'paid', 'failed')),
  created_at timestamptz not null default now()
);

create index if not exists idx_addresses_user_id on public.addresses(user_id);
create unique index if not exists idx_stores_slug_unique on public.stores(slug);
create unique index if not exists idx_store_staff_store_user_unique on public.store_staff(store_id, user_id);
create unique index if not exists idx_products_store_name_unique on public.products(store_id, name);
create index if not exists idx_products_store_id on public.products(store_id);
create index if not exists idx_orders_customer_id on public.orders(customer_id);
create index if not exists idx_order_store_groups_order_id on public.order_store_groups(order_id);
create index if not exists idx_order_items_group_id on public.order_items(order_store_group_id);
create index if not exists idx_delivery_runs_order_id on public.delivery_runs(order_id);
create index if not exists idx_delivery_runs_rider_id on public.delivery_runs(rider_id);
