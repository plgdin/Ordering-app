create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(new.raw_user_meta_data ->> 'role', 'client')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.current_app_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid()
$$;

alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.stores enable row level security;
alter table public.store_staff enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_store_groups enable row level security;
alter table public.order_items enable row level security;
alter table public.delivery_partners enable row level security;
alter table public.delivery_runs enable row level security;
alter table public.rider_payouts enable row level security;

drop policy if exists "profiles_self_select" on public.profiles;
create policy "profiles_self_select"
  on public.profiles
  for select
  using (auth.uid() = id or public.current_app_role() = 'admin');

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update"
  on public.profiles
  for update
  using (auth.uid() = id or public.current_app_role() = 'admin')
  with check (auth.uid() = id or public.current_app_role() = 'admin');

drop policy if exists "addresses_self_all" on public.addresses;
create policy "addresses_self_all"
  on public.addresses
  for all
  using (auth.uid() = user_id or public.current_app_role() = 'admin')
  with check (auth.uid() = user_id or public.current_app_role() = 'admin');

drop policy if exists "stores_public_read" on public.stores;
create policy "stores_public_read"
  on public.stores
  for select
  using (is_active = true or public.current_app_role() in ('merchant', 'admin'));

drop policy if exists "stores_merchant_manage" on public.stores;
create policy "stores_merchant_manage"
  on public.stores
  for all
  using (
    public.current_app_role() in ('merchant', 'admin')
    or exists (
      select 1
      from public.store_staff
      where store_staff.store_id = stores.id
        and store_staff.user_id = auth.uid()
    )
  )
  with check (
    public.current_app_role() in ('merchant', 'admin')
    or exists (
      select 1
      from public.store_staff
      where store_staff.store_id = stores.id
        and store_staff.user_id = auth.uid()
    )
  );

drop policy if exists "store_staff_self_read" on public.store_staff;
create policy "store_staff_self_read"
  on public.store_staff
  for select
  using (auth.uid() = user_id or public.current_app_role() = 'admin');

drop policy if exists "products_public_read" on public.products;
create policy "products_public_read"
  on public.products
  for select
  using (
    exists (
      select 1
      from public.stores
      where stores.id = products.store_id
        and stores.is_active = true
    )
    or public.current_app_role() in ('merchant', 'admin')
  );

drop policy if exists "products_merchant_manage" on public.products;
create policy "products_merchant_manage"
  on public.products
  for all
  using (
    public.current_app_role() in ('merchant', 'admin')
    or exists (
      select 1
      from public.store_staff
      where store_staff.store_id = products.store_id
        and store_staff.user_id = auth.uid()
    )
  )
  with check (
    public.current_app_role() in ('merchant', 'admin')
    or exists (
      select 1
      from public.store_staff
      where store_staff.store_id = products.store_id
        and store_staff.user_id = auth.uid()
    )
  );

drop policy if exists "orders_customer_read" on public.orders;
create policy "orders_customer_read"
  on public.orders
  for select
  using (
    auth.uid() = customer_id
    or public.current_app_role() in ('merchant', 'admin')
  );

drop policy if exists "orders_customer_insert" on public.orders;
create policy "orders_customer_insert"
  on public.orders
  for insert
  with check (
    auth.uid() = customer_id
    or public.current_app_role() in ('merchant', 'admin')
  );

drop policy if exists "orders_customer_update" on public.orders;
create policy "orders_customer_update"
  on public.orders
  for update
  using (
    auth.uid() = customer_id
    or public.current_app_role() in ('merchant', 'admin')
  )
  with check (
    auth.uid() = customer_id
    or public.current_app_role() in ('merchant', 'admin')
  );

drop policy if exists "order_groups_related_read" on public.order_store_groups;
create policy "order_groups_related_read"
  on public.order_store_groups
  for select
  using (
    public.current_app_role() = 'admin'
    or exists (
      select 1
      from public.orders
      where orders.id = order_store_groups.order_id
        and orders.customer_id = auth.uid()
    )
    or exists (
      select 1
      from public.store_staff
      where store_staff.store_id = order_store_groups.store_id
        and store_staff.user_id = auth.uid()
    )
  );

drop policy if exists "order_groups_store_manage" on public.order_store_groups;
create policy "order_groups_store_manage"
  on public.order_store_groups
  for all
  using (
    public.current_app_role() in ('merchant', 'admin')
    or exists (
      select 1
      from public.orders
      where orders.id = order_store_groups.order_id
        and orders.customer_id = auth.uid()
    )
    or exists (
      select 1
      from public.store_staff
      where store_staff.store_id = order_store_groups.store_id
        and store_staff.user_id = auth.uid()
    )
  )
  with check (
    public.current_app_role() in ('merchant', 'admin')
    or exists (
      select 1
      from public.orders
      where orders.id = order_store_groups.order_id
        and orders.customer_id = auth.uid()
    )
    or exists (
      select 1
      from public.store_staff
      where store_staff.store_id = order_store_groups.store_id
        and store_staff.user_id = auth.uid()
    )
  );

drop policy if exists "order_items_related_read" on public.order_items;
create policy "order_items_related_read"
  on public.order_items
  for select
  using (
    public.current_app_role() = 'admin'
    or exists (
      select 1
      from public.order_store_groups
      join public.orders on orders.id = order_store_groups.order_id
      where order_store_groups.id = order_items.order_store_group_id
        and orders.customer_id = auth.uid()
    )
    or exists (
      select 1
      from public.order_store_groups
      join public.store_staff on store_staff.store_id = order_store_groups.store_id
      where order_store_groups.id = order_items.order_store_group_id
        and store_staff.user_id = auth.uid()
    )
  );

drop policy if exists "order_items_store_manage" on public.order_items;
create policy "order_items_store_manage"
  on public.order_items
  for all
  using (
    public.current_app_role() in ('merchant', 'admin')
    or exists (
      select 1
      from public.order_store_groups
      join public.orders on orders.id = order_store_groups.order_id
      where order_store_groups.id = order_items.order_store_group_id
        and orders.customer_id = auth.uid()
    )
    or exists (
      select 1
      from public.order_store_groups
      join public.store_staff on store_staff.store_id = order_store_groups.store_id
      where order_store_groups.id = order_items.order_store_group_id
        and store_staff.user_id = auth.uid()
    )
  )
  with check (
    public.current_app_role() in ('merchant', 'admin')
    or exists (
      select 1
      from public.order_store_groups
      join public.orders on orders.id = order_store_groups.order_id
      where order_store_groups.id = order_items.order_store_group_id
        and orders.customer_id = auth.uid()
    )
    or exists (
      select 1
      from public.order_store_groups
      join public.store_staff on store_staff.store_id = order_store_groups.store_id
      where order_store_groups.id = order_items.order_store_group_id
        and store_staff.user_id = auth.uid()
    )
  );

drop policy if exists "delivery_partner_self_all" on public.delivery_partners;
create policy "delivery_partner_self_all"
  on public.delivery_partners
  for all
  using (
    auth.uid() = user_id
    or public.current_app_role() in ('delivery', 'admin')
  )
  with check (
    auth.uid() = user_id
    or public.current_app_role() in ('delivery', 'admin')
  );

drop policy if exists "delivery_runs_rider_read" on public.delivery_runs;
create policy "delivery_runs_rider_read"
  on public.delivery_runs
  for select
  using (
    public.current_app_role() in ('delivery', 'admin')
    or status = 'available'
    or exists (
      select 1
      from public.delivery_partners
      where delivery_partners.id = delivery_runs.rider_id
        and delivery_partners.user_id = auth.uid()
    )
  );

drop policy if exists "delivery_runs_rider_update" on public.delivery_runs;
create policy "delivery_runs_rider_update"
  on public.delivery_runs
  for update
  using (
    public.current_app_role() in ('delivery', 'admin')
    or exists (
      select 1
      from public.delivery_partners
      where delivery_partners.id = delivery_runs.rider_id
        and delivery_partners.user_id = auth.uid()
    )
  )
  with check (
    public.current_app_role() in ('delivery', 'admin')
    or exists (
      select 1
      from public.delivery_partners
      where delivery_partners.id = delivery_runs.rider_id
        and delivery_partners.user_id = auth.uid()
    )
  );

drop policy if exists "rider_payouts_self_read" on public.rider_payouts;
create policy "rider_payouts_self_read"
  on public.rider_payouts
  for select
  using (
    public.current_app_role() in ('delivery', 'admin')
    or exists (
      select 1
      from public.delivery_partners
      where delivery_partners.id = rider_payouts.rider_id
        and delivery_partners.user_id = auth.uid()
    )
  );
