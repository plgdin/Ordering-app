# Supabase Setup

This project is prepared to use Supabase through the shared workspace package:

- `packages/supabase`

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

## Shared client package

Use imports from:

- `@nearnow/supabase`

Available helpers:

- `getSupabaseClient()`
- `maybeGetSupabaseClient()`
- `isSupabaseConfigured()`
- `registerSupabaseAutoRefresh()`

## Suggested next backend steps

1. Create auth tables and profile data
2. Create stores and product catalog tables
3. Create cart and order tables
4. Add realtime status updates for order tracking
5. Add row-level security policies before production
