# NearNow

NearNow is a React Native monorepo for a locality-first commerce platform with three apps:

- `client-app`: customer ordering app
- `merchant-app`: store management app
- `delivery-app`: rider operations app

This foundation is built with Expo and React Native so the same React codebase can ship to Android and iOS app stores without using Flutter.

## Product scope included here

- Grocery, pharmacy, bakery, daily essentials, and local store ordering
- Radius-based delivery discovery for nearby stores
- Multi-store cart messaging with extra-charge logic
- Merchant dashboard for orders, stock, and campaigns
- Delivery app for runs, incentives, and next-day payouts
- Green/white visual system with animated entry transitions and tab changes

## Folder structure

```text
apps/
  client-app/
  merchant-app/
  delivery-app/
packages/
  shared/
docs/
  product-blueprint.md
```

## Current stack

- Expo SDK 55
- React Native 0.83
- React 19.2
- TypeScript

These versions match the current Expo SDK 55 line and Expo monorepo guidance in the official docs:

- https://docs.expo.dev/get-started/create-a-project/
- https://docs.expo.dev/guides/monorepos/
- https://docs.expo.dev/versions/latest/

## How to start

1. Install dependencies from the repo root with `npm install`
2. Start the customer app with `npm run dev:client`
3. Start the merchant app with `npm run dev:merchant`
4. Start the delivery app with `npm run dev:delivery`

## Browser preview

1. Open the customer app in a browser with `npm run web:client`
2. Open the merchant app in a browser with `npm run web:merchant`
3. Open the delivery app in a browser with `npm run web:delivery`

## Custom Android Dev Build

Use this path if Expo Go on your phone is too old for the SDK used by this project.

### Customer app

1. Cloud build: run `npm run eas:build:client:android`
2. Local dev server for the installed custom app: run `npm run devclient:client`

### Merchant app

1. Cloud build: run `npm run eas:build:merchant:android`
2. Local dev server for the installed custom app: run `npm run devclient:merchant`

### Delivery app

1. Cloud build: run `npm run eas:build:delivery:android`
2. Local dev server for the installed custom app: run `npm run devclient:delivery`

### Notes

- The Android package names are currently placeholders:
  - Customer: `com.nearnow.customer`
  - Merchant: `com.nearnow.merchant`
  - Delivery: `com.nearnow.delivery`
- Replace them later with your own company/app identifiers before publishing.

## Suggested next build phases

1. Add Supabase or PostgreSQL + Node API for auth, catalogs, carts, and orders
2. Add live order tracking, maps, and route optimization
3. Add payouts, incentives, and merchant settlement workflows
4. Add admin panel, store onboarding, and compliance flows
5. Configure EAS Build for Play Store and App Store releases
