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
api/
apps/
  client-app/
  merchant-app/
  delivery-app/
packages/
  config/
  core/
  shared/
  ui/
docs/
  product-blueprint.md
```

## Repo layout

- `apps/`: installable client, merchant, and delivery apps
- `api/`: reserved backend/API folder for future services
- `packages/ui`: shared design system, theme, and reusable visual components
- `packages/core`: shared business data, types, and pricing logic
- `packages/config`: shared app constants and business configuration
- `packages/shared`: app-specific screens and compositions built on top of the shared packages

## Repo Map

```text
apps/
  client-app/        -> real customer app wrapper and native app config
  merchant-app/      -> real merchant app wrapper and native app config
  delivery-app/      -> real delivery app wrapper and native app config

packages/
  shared/            -> app-specific screens for client, merchant, and delivery
  ui/                -> shared theme, layout shell, reusable UI components
  core/              -> shared pricing logic, types, and common data
  config/            -> shared constants such as brand values and business rules

api/
  README.md          -> placeholder for future backend/services
```

Quick mental model:

- `apps/` = what gets built and published
- `packages/shared/` = where most app screens live
- `packages/ui/` = shared look and reusable components
- `packages/core/` = shared logic and data
- `packages/config/` = shared constants and settings
- `api/` = future backend

## Current stack

- Expo SDK 55
- React Native 0.83
- React 19.2
- TypeScript

## Requirements

Before running the project on a fresh machine, install:

- Node.js 20 or newer
- npm 10 or newer
- Git
- Expo Go or a custom Android dev build if testing on phone
- An Expo account if you need EAS cloud builds

Optional but useful:

- Android Studio if you want local Android emulator/device builds
- Xcode on macOS if you want iPhone simulator or App Store builds

These versions match the current Expo SDK 55 line and Expo monorepo guidance in the official docs:

- https://docs.expo.dev/get-started/create-a-project/
- https://docs.expo.dev/guides/monorepos/
- https://docs.expo.dev/versions/latest/

## Fresh Setup After Cloning

If a teammate clones this repository from GitHub, these are the first commands to run from the repo root:

```bash
git clone <your-repo-url>
cd <your-repo-folder>
npm install
```

Then choose one of these paths:

- Normal Expo server for fast development: `npm run dev:client`, `npm run dev:merchant`, or `npm run dev:delivery`
- Browser preview: `npm run web:client`, `npm run web:merchant`, or `npm run web:delivery`
- Custom Android dev build flow: follow the `Custom Android Dev Build` section below

Recommended first check after clone:

```bash
npm run web:client
```

That is usually the fastest way to confirm the repo installed correctly on a new machine.

## How to start

1. Install dependencies from the repo root with `npm install`
2. Start the customer app with `npm run dev:client`
3. Start the merchant app with `npm run dev:merchant`
4. Start the delivery app with `npm run dev:delivery`

## Teammate Quickstart

Use these commands from the repo root:

- Customer app with normal Expo server: `npm run dev:client`
- Merchant app with normal Expo server: `npm run dev:merchant`
- Delivery app with normal Expo server: `npm run dev:delivery`
- Customer app in browser: `npm run web:client`
- Merchant app in browser: `npm run web:merchant`
- Delivery app in browser: `npm run web:delivery`
- Customer app with installed custom Android dev client: `npm run devclient:client`
- Merchant app with installed custom Android dev client: `npm run devclient:merchant`
- Delivery app with installed custom Android dev client: `npm run devclient:delivery`

## Browser preview

Use browser preview for fast UI checks on your laptop.

1. Customer app: `npm run web:client`
2. Merchant app: `npm run web:merchant`
3. Delivery app: `npm run web:delivery`

Notes:

- Expo will print a localhost URL such as `http://localhost:8082`
- Browser preview is useful for layout and quick iteration, but it is not a replacement for testing on a real phone
- If a change does not appear immediately, save the file again, refresh the browser, or restart the command

## Custom Android Dev Build

Use this path if Expo Go on your phone is too old for the SDK used by this project.

### Customer app

1. Build the installable Android dev app: `npm run eas:build:client:android`
2. Install the generated APK on the phone
3. Start the local dev server for the installed app: `npm run devclient:client`
4. Open the installed customer app on the phone and scan the QR code from that terminal

### Merchant app

1. Build the installable Android dev app: `npm run eas:build:merchant:android`
2. Install the generated APK on the phone
3. Start the local dev server for the installed app: `npm run devclient:merchant`
4. Open the installed merchant app on the phone and scan the QR code from that terminal

### Delivery app

1. Build the installable Android dev app: `npm run eas:build:delivery:android`
2. Install the generated APK on the phone
3. Start the local dev server for the installed app: `npm run devclient:delivery`
4. Open the installed delivery app on the phone and scan the QR code from that terminal

### Notes

- The Android package names are currently placeholders:
  - Customer: `com.nearnow.customer`
  - Merchant: `com.nearnow.merchant`
  - Delivery: `com.nearnow.delivery`
- Replace them later with your own company/app identifiers before publishing.
- Use the installed custom app for this flow, not `Expo Go`
- The first build is slower because EAS has to create the Android dev APK
- Before the first EAS build on a new machine, log in to Expo:
  - `npx eas-cli login`
- If the app is not linked yet for that app folder, initialize it from inside the app folder:
  - `cd apps/client-app && npx eas-cli init`
  - `cd apps/merchant-app && npx eas-cli init`
  - `cd apps/delivery-app && npx eas-cli init`

## Where To Edit

Use this cheat sheet when working in the repo:

- Change a client screen: [packages/shared/src/apps/client/screens](</d:/Application/Ordering app/packages/shared/src/apps/client/screens>)
- Change a merchant screen: [packages/shared/src/apps/merchant/screens](</d:/Application/Ordering app/packages/shared/src/apps/merchant/screens>)
- Change a delivery screen: [packages/shared/src/apps/delivery/screens](</d:/Application/Ordering app/packages/shared/src/apps/delivery/screens>)
- Change client tab layout/screen switching: [packages/shared/src/apps/client/ClientApp.tsx](</d:/Application/Ordering app/packages/shared/src/apps/client/ClientApp.tsx:1>)
- Change merchant tab layout/screen switching: [packages/shared/src/apps/merchant/MerchantApp.tsx](</d:/Application/Ordering app/packages/shared/src/apps/merchant/MerchantApp.tsx:1>)
- Change delivery tab layout/screen switching: [packages/shared/src/apps/delivery/DeliveryApp.tsx](</d:/Application/Ordering app/packages/shared/src/apps/delivery/DeliveryApp.tsx:1>)
- Change shared visual styles, reusable UI, theme, spacing, colors: [packages/ui/src](</d:/Application/Ordering app/packages/ui/src>)
- Change shared data, types, pricing logic, and business rules: [packages/core/src](</d:/Application/Ordering app/packages/core/src>)
- Change global app constants and config values: [packages/config/src/index.ts](</d:/Application/Ordering app/packages/config/src/index.ts:1>)

## Live Changes While Editing

- If you are editing a client screen, run `npm run devclient:client` or `npm run web:client`
- If you are editing a merchant screen, run `npm run devclient:merchant` or `npm run web:merchant`
- If you are editing a delivery screen, run `npm run devclient:delivery` or `npm run web:delivery`
- After saving, Expo usually hot reloads automatically
- If it does not reload, press `r` in the terminal or refresh the browser

## Suggested next build phases

1. Add Supabase or PostgreSQL + Node API for auth, catalogs, carts, and orders
2. Add live order tracking, maps, and route optimization
3. Add payouts, incentives, and merchant settlement workflows
4. Add admin panel, store onboarding, and compliance flows
5. Configure EAS Build for Play Store and App Store releases
