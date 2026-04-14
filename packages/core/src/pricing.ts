import { DeliveryQuote, QuoteStop } from "./types";

const BASE_CHARGE = 35;

export function calculateDeliveryQuote(stops: QuoteStop[]): DeliveryQuote {
  if (stops.length <= 1) {
    return {
      baseCharge: BASE_CHARGE,
      extraCharge: 0,
      totalCharge: BASE_CHARGE,
      explanation: "Single-store order. Standard local delivery applies.",
      freeBecauseClustered: false,
      freeBecauseOnRoute: false
    };
  }

  const freeBecauseClustered = stops.every(
    (stop) => stop.distanceFromCustomerKm <= 1
  );
  const freeBecauseOnRoute = stops.some((stop) => stop.isAlongCurrentRoute);
  const directionCount = new Set(stops.map((stop) => stop.direction)).size;

  if (freeBecauseClustered) {
    return {
      baseCharge: BASE_CHARGE,
      extraCharge: 0,
      totalCharge: BASE_CHARGE,
      explanation:
        "All selected stores are within 1 km, so the order stays on the base delivery fee.",
      freeBecauseClustered,
      freeBecauseOnRoute
    };
  }

  if (freeBecauseOnRoute || directionCount === 1) {
    return {
      baseCharge: BASE_CHARGE,
      extraCharge: 0,
      totalCharge: BASE_CHARGE,
      explanation:
        "The extra pickup fits the rider's route, so no additional delivery charge is added.",
      freeBecauseClustered,
      freeBecauseOnRoute
    };
  }

  const extraCharge = 20 + Math.max(0, directionCount - 2) * 10;

  return {
    baseCharge: BASE_CHARGE,
    extraCharge,
    totalCharge: BASE_CHARGE + extraCharge,
    explanation:
      "The selected stores are in different directions, so an extra multi-store charge is applied.",
    freeBecauseClustered,
    freeBecauseOnRoute
  };
}
