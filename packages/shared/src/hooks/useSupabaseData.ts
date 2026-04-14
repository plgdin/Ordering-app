import {
  clientOrders,
  deliveryMetrics,
  deliveryRuns,
  featuredStores,
  merchantMetrics,
  merchantOrders,
  Store
} from "@nearnow/core";
import { serviceRules } from "@nearnow/config";
import {
  DeliveryEarningsDetails,
  DeliveryProfileData,
  fetchClientOrders,
  fetchDeliveryEarningsDetails,
  fetchDeliveryMetrics,
  fetchDeliveryProfile,
  fetchDeliveryRuns,
  fetchMerchantMetrics,
  fetchMerchantOrders,
  fetchStoresWithInventory,
  maybeGetSupabaseClient
} from "@nearnow/supabase";
import { useEffect, useState } from "react";

function subscribeToTables(
  channelName: string,
  tables: string[],
  onChange: () => void
) {
  const client = maybeGetSupabaseClient();
  if (!client) {
    return () => {};
  }

  let channel = client.channel(channelName);

  tables.forEach((table) => {
    channel = channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table
      },
      onChange
    );
  });

  channel.subscribe();

  return () => {
    void client.removeChannel(channel);
  };
}

export function useClientStores() {
  const [stores, setStores] = useState<Store[]>(featuredStores);

  useEffect(() => {
    let cancelled = false;

    const syncStores = () => {
      void fetchStoresWithInventory()
        .then((result) => {
          if (!cancelled) {
            setStores(result);
          }
        })
        .catch(() => {});
    };

    syncStores();
    const unsubscribe = subscribeToTables(
      "client-stores-live",
      ["stores", "products"],
      syncStores
    );

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return stores;
}

export function useClientOrders() {
  const [orders, setOrders] = useState(clientOrders);

  useEffect(() => {
    let cancelled = false;

    const syncOrders = () => {
      void fetchClientOrders()
        .then((result) => {
          if (!cancelled) {
            setOrders(result);
          }
        })
        .catch(() => {});
    };

    syncOrders();
    const unsubscribe = subscribeToTables(
      "client-orders-live",
      ["orders", "order_store_groups"],
      syncOrders
    );

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return orders;
}

export function useMerchantMetrics() {
  const [metrics, setMetrics] = useState(merchantMetrics);

  useEffect(() => {
    let cancelled = false;

    const syncMetrics = () => {
      void fetchMerchantMetrics()
        .then((result) => {
          if (!cancelled) {
            setMetrics(result);
          }
        })
        .catch(() => {});
    };

    syncMetrics();
    const unsubscribe = subscribeToTables(
      "merchant-metrics-live",
      ["orders", "order_store_groups", "products"],
      syncMetrics
    );

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return metrics;
}

export function useMerchantOrders() {
  const [orders, setOrders] = useState(merchantOrders);

  useEffect(() => {
    let cancelled = false;

    const syncOrders = () => {
      void fetchMerchantOrders()
        .then((result) => {
          if (!cancelled) {
            setOrders(result);
          }
        })
        .catch(() => {});
    };

    syncOrders();
    const unsubscribe = subscribeToTables(
      "merchant-orders-live",
      ["order_store_groups"],
      syncOrders
    );

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return orders;
}

export function useDeliveryMetrics() {
  const [metrics, setMetrics] = useState(deliveryMetrics);

  useEffect(() => {
    let cancelled = false;

    const syncMetrics = () => {
      void fetchDeliveryMetrics(serviceRules.nextDayPayoutTime)
        .then((result) => {
          if (!cancelled) {
            setMetrics(result);
          }
        })
        .catch(() => {});
    };

    syncMetrics();
    const unsubscribe = subscribeToTables(
      "delivery-metrics-live",
      ["delivery_runs", "rider_payouts"],
      syncMetrics
    );

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return metrics;
}

export function useDeliveryRuns() {
  const [runs, setRuns] = useState(deliveryRuns);

  useEffect(() => {
    let cancelled = false;

    const syncRuns = () => {
      void fetchDeliveryRuns()
        .then((result) => {
          if (!cancelled) {
            setRuns(result);
          }
        })
        .catch(() => {});
    };

    syncRuns();
    const unsubscribe = subscribeToTables(
      "delivery-runs-live",
      ["delivery_runs"],
      syncRuns
    );

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return runs;
}

export function useDeliveryProfile() {
  const [profile, setProfile] = useState<DeliveryProfileData>({
    onlineWindow: "Online window: 7:00 AM to 11:30 PM",
    vehicleType: "Bike",
    preferredZone: "Central locality cluster"
  });

  useEffect(() => {
    let cancelled = false;

    const syncProfile = () => {
      void fetchDeliveryProfile()
        .then((result) => {
          if (!cancelled && result) {
            setProfile({
              onlineWindow: result.onlineWindow,
              vehicleType: result.vehicleType,
              preferredZone: result.preferredZone
            });
          }
        })
        .catch(() => {});
    };

    syncProfile();
    const unsubscribe = subscribeToTables(
      "delivery-profile-live",
      ["delivery_partners"],
      syncProfile
    );

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return profile;
}

export function useDeliveryEarningsDetails() {
  const [details, setDetails] = useState<DeliveryEarningsDetails>({
    milestones: [
      "8 runs: unlock Rs 120 bonus",
      "12 runs: unlock Rs 220 bonus",
      "16 runs: unlock Rs 360 bonus"
    ],
    settlementLines: [
      `All accepted and completed work for today moves into the next payout cycle at ${serviceRules.nextDayPayoutTime} tomorrow.`
    ]
  });

  useEffect(() => {
    let cancelled = false;

    const syncDetails = () => {
      void fetchDeliveryEarningsDetails(serviceRules.nextDayPayoutTime)
        .then((result) => {
          if (!cancelled && result) {
            setDetails(result);
          }
        })
        .catch(() => {});
    };

    syncDetails();
    const unsubscribe = subscribeToTables(
      "delivery-earnings-live",
      ["delivery_runs", "rider_payouts"],
      syncDetails
    );

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return details;
}
