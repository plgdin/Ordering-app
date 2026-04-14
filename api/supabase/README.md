# Supabase Setup

This project is prepared to use Supabase through the shared workspace package:

- `packages/supabase`

SQL setup files are included here:

- `api/supabase/001_schema.sql`
- `api/supabase/002_auth_and_rls.sql`
- `api/supabase/003_seed.sql`

Use Supabase for:

- authentication
- database tables
- realtime updates
- storage

## First setup

1. Create a Supabase project in the Supabase dashboard
2. Copy the project URL
3. Copy the publishable key or anon key
4. Add those values to:
   - `apps/client-app/.env.local`
   - `apps/merchant-app/.env.local`
   - `apps/delivery-app/.env.local`

## SQL run order

Run these files in the Supabase SQL editor in this order:

1. `001_schema.sql`
2. `002_auth_and_rls.sql`
3. `003_seed.sql`

If you already ran older versions of these SQL files before this update, rerun:

- `001_schema.sql`
- `002_auth_and_rls.sql`

The current build reads mainly from:

- `stores`
- `products`
- `orders`
- `order_store_groups`
- `order_items`
- `delivery_runs`
- `delivery_partners`
- `rider_payouts`

## Shared client package

Use imports from:

- `@nearnow/supabase`

Available helpers:

- `getSupabaseClient()`
- `maybeGetSupabaseClient()`
- `isSupabaseConfigured()`
- `registerSupabaseAutoRefresh()`

## Suggested next backend steps

1. Add auth screens and role-based onboarding
2. Add cart persistence and checkout writes
3. Add realtime order status subscriptions
4. Add merchant-to-rider dispatch assignment flow
5. Add storage buckets for store and product images
