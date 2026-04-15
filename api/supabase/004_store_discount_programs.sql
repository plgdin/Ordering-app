create table if not exists public.store_discount_programs (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  discount_key text not null
    check (discount_key in ('combo30', 'save10', 'flat75')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (store_id, discount_key)
);

create index if not exists idx_store_discount_programs_store_id
  on public.store_discount_programs(store_id);

alter table public.store_discount_programs enable row level security;

drop policy if exists "store_discounts_public_read" on public.store_discount_programs;
create policy "store_discounts_public_read"
  on public.store_discount_programs
  for select
  using (
    public.current_app_role() = 'admin'
    or exists (
      select 1
      from public.stores
      where stores.id = store_discount_programs.store_id
        and stores.is_active = true
    )
    or exists (
      select 1
      from public.store_staff
      where store_staff.store_id = store_discount_programs.store_id
        and store_staff.user_id = auth.uid()
    )
  );

drop policy if exists "store_discounts_merchant_manage" on public.store_discount_programs;
create policy "store_discounts_merchant_manage"
  on public.store_discount_programs
  for all
  using (
    public.current_app_role() = 'admin'
    or exists (
      select 1
      from public.store_staff
      where store_staff.store_id = store_discount_programs.store_id
        and store_staff.user_id = auth.uid()
    )
  )
  with check (
    public.current_app_role() = 'admin'
    or exists (
      select 1
      from public.store_staff
      where store_staff.store_id = store_discount_programs.store_id
        and store_staff.user_id = auth.uid()
    )
  );
