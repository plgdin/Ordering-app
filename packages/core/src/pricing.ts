import { DeliveryQuote, DirectionBucket, QuoteStop } from "./types";

const FREE_DISTANCE_LIMIT_KM = 5;
const PER_KM_CHARGE = 7;
const ENROUTE_STORE_SURCHARGE = 25;

export function calculateBaseDeliveryCharge(distanceKm: number) {
  return Math.max(0, Math.ceil(distanceKm - FREE_DISTANCE_LIMIT_KM)) * PER_KM_CHARGE;
}

export function estimateDirectionBucket(
  seed: string,
  distanceFromCustomerKm: number
): DirectionBucket {
  if (distanceFromCustomerKm <= 1) {
    return "same-route";
  }

  const buckets: DirectionBucket[] = ["north", "south", "east", "west"];
  const hash = seed.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return buckets[hash % buckets.length];
}

function isEnRouteStop(previousStop: QuoteStop, nextStop: QuoteStop) {
  return (
    previousStop.direction === "same-route" ||
    nextStop.direction === "same-route" ||
    previousStop.direction === nextStop.direction
  );
}

function estimateDistanceBetweenStops(previousStop: QuoteStop, nextStop: QuoteStop) {
  if (isEnRouteStop(previousStop, nextStop)) {
    return Math.max(
      1,
      Math.ceil(
        Math.abs(
          previousStop.distanceFromCustomerKm - nextStop.distanceFromCustomerKm
        )
      )
    );
  }

  return Math.max(
    1,
    Math.ceil(
      previousStop.distanceFromCustomerKm + nextStop.distanceFromCustomerKm
    )
  );
}

export function calculateDeliveryQuote(stops: QuoteStop[]): DeliveryQuote {
  if (stops.length === 0) {
    return {
      baseCharge: 0,
      extraCharge: 0,
      totalCharge: 0,
      explanation: "Add items to see the live delivery breakdown.",
      freeBecauseClustered: true,
      freeBecauseOnRoute: false,
      travelledDistanceKm: 0,
      freeDistanceLimitKm: FREE_DISTANCE_LIMIT_KM,
      chargeableDistanceKm: 0,
      perKmCharge: PER_KM_CHARGE
    };
  }

  const sortedStops = [...stops].sort(
    (left, right) => right.distanceFromCustomerKm - left.distanceFromCustomerKm
  );
  const travelledDistanceKm = sortedStops[0]?.distanceFromCustomerKm ?? 0;
  const baseCharge = calculateBaseDeliveryCharge(travelledDistanceKm);
  let extraCharge = 0;
  let chargeableDistanceKm = Math.max(0, Math.ceil(travelledDistanceKm - FREE_DISTANCE_LIMIT_KM));
  let freeBecauseOnRoute = false;

  for (let index = 1; index < sortedStops.length; index += 1) {
    const previousStop = sortedStops[index - 1];
    const nextStop = sortedStops[index];

    if (isEnRouteStop(previousStop, nextStop)) {
      extraCharge += ENROUTE_STORE_SURCHARGE;
      freeBecauseOnRoute = true;
      continue;
    }

    const detourDistanceKm = estimateDistanceBetweenStops(previousStop, nextStop);
    chargeableDistanceKm += detourDistanceKm;
    extraCharge += detourDistanceKm * PER_KM_CHARGE;
  }

  const totalCharge = baseCharge + extraCharge;
  const freeBecauseClustered = totalCharge === 0;

  if (freeBecauseClustered) {
    return {
      baseCharge,
      extraCharge,
      totalCharge,
      explanation: "Delivery is free on this order.",
      freeBecauseClustered,
      freeBecauseOnRoute,
      travelledDistanceKm,
      freeDistanceLimitKm: FREE_DISTANCE_LIMIT_KM,
      chargeableDistanceKm,
      perKmCharge: PER_KM_CHARGE
    };
  }

  return {
    baseCharge,
    extraCharge,
    totalCharge,
    explanation:
      sortedStops.length > 1
        ? "Multi-store delivery charges are included for this order."
        : "Standard delivery charges are included for this order.",
    freeBecauseClustered,
    freeBecauseOnRoute,
    travelledDistanceKm,
    freeDistanceLimitKm: FREE_DISTANCE_LIMIT_KM,
    chargeableDistanceKm,
    perKmCharge: PER_KM_CHARGE
  };
}
