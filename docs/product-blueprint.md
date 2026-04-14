# NearNow Product Blueprint

## Product vision

NearNow is a locality-first commerce platform for quick fulfillment across daily essentials:

- Grocery and supermarkets
- Bakery and fresh goods
- Pharmacy for non-prescription items only
- Household needs
- Convenience and specialty local shops

The customer should feel like they can open one app and order almost anything useful within their local area.

## Core rules from your brief

- Service area is locality-based and should prioritize stores within a 25 km radius
- Non-prescription pharmacy items can be sold
- Multiple stores can be added in a single order flow
- If multiple stores are within 1 km, no extra delivery charge
- If an additional store pickup is naturally on the rider's route, no extra delivery charge
- If stores are in different directions, add an extra delivery charge
- Riders earn incentives based on completed work
- Rider payouts should be generated daily and paid the next day at 9:00 AM

## Recommended architecture

### Frontend

- React Native with Expo for Android and iOS deployment
- Monorepo with three separate apps:
  - Client app
  - Merchant app
  - Delivery app
- Shared design system and pricing logic package

### Backend

- Node.js + NestJS or Express
- PostgreSQL for transactional data
- Redis for caching and dispatch queues
- Object storage for media and invoices
- WebSockets for live order status
- Map service for routing and geofencing

### Services

- Auth and identity
- Catalog and inventory
- Cart and checkout
- Dispatch and rider assignment
- Pricing and surcharge engine
- Payments and settlement
- Notification service
- Analytics and incentive engine

## MVP modules

### Client app

- Location selection
- Category browsing
- Store listing
- Multi-store cart
- Checkout and fee explanation
- Order tracking
- Wallet, offers, settings

### Merchant app

- Order queue
- Stock alerts
- Catalog updates
- Store availability
- Promotion banners
- Settlement overview

### Delivery app

- Online/offline toggle
- Available runs
- Route stacking visibility
- Daily earnings
- Incentive ladder
- Payout schedule

## Important compliance notes

- Keep prescription medicine ordering disabled until proper compliance, document checks, and legal workflows are designed
- Review local laws for pharmacy, delivery, labor, GST, refunds, and platform liability before launch
- Confirm store licenses and item category restrictions during onboarding

## Branding direction

- Primary: green
- Secondary: white
- Text: black
- Motion: smooth entry animations, staggered cards, animated tab transitions
- Style: premium local-commerce, not generic food-delivery only

## Suggested next deliverables

1. Backend API and database schema
2. Real authentication
3. Map and address services
4. Payment gateway integration
5. Store onboarding workflow
6. Admin panel
