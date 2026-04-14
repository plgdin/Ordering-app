import {
  calculateDeliveryQuote,
  CartLineItem,
  InventoryItem,
  Metric,
  OrderCard,
  QuoteStop,
  Store
} from "@nearnow/core";
import { getSupabaseClient, maybeGetSupabaseClient } from "./client";

export type DeliveryProfileData = {
  onlineWindow: string;
  vehicleType: string;
  preferredZone: string;
};

export type DeliveryEarningsDetails = {
  milestones: string[];
  settlementLines: string[];
};

export type CheckoutAddressInput = {
  label: string;
  houseNo: string;
  street: string;
  area: string;
  city: string;
  pincode: string;
  landmark: string;
  directions: string;
  lat?: number;
  lng?: number;
};

export type CheckoutResult = {
  orderId: string;
  amount: string;
};

function formatCurrency(value: number) {
  return `Rs ${Math.round(value)}`;
}

function mapStoreRow(row: any): Store {
  const inventory: InventoryItem[] =
    row.products?.map((product: any) => ({
      id: String(product.id),
      name: product.name,
      price: Number(product.price),
      unit: product.unit,
      inStock: Boolean(product.in_stock)
    })) ?? [];

  return {
    id: String(row.id),
    name: row.name,
    category: row.category,
    eta: `${row.eta_min}-${row.eta_max} min`,
    distanceKm: Number(row.distance_km ?? 0),
    rating: Number(row.rating ?? 0),
    deliveryTag: row.delivery_tag ?? "",
    highlight: row.highlight ?? "",
    featured: Boolean(row.is_active),
    image: row.image_url ?? undefined,
    inventory
  };
}

function mapOrderStatus(status: string) {
  switch (status) {
    case "pending":
      return "Pending";
    case "confirmed":
      return "Confirmed";
    case "packing":
      return "Packing";
    case "assigned":
      return "Assigned";
    case "out_for_delivery":
      return "Out for delivery";
    case "delivered":
      return "Delivered";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}

export async function fetchStoresWithInventory(): Promise<Store[]> {
  const supabase = maybeGetSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("stores")
    .select(
      `
      id,
      slug,
      name,
      category,
      eta_min,
      eta_max,
      distance_km,
      rating,
      delivery_tag,
      highlight,
      image_url,
      is_active,
      products (
        id,
        name,
        price,
        unit,
        in_stock
      )
    `
    )
    .eq("is_active", true)
    .order("rating", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapStoreRow);
}

function buildQuoteStops(items: CartLineItem[]): QuoteStop[] {
  const stores = new Map<
    string,
    { storeName: string; distanceFromCustomerKm: number }
  >();

  items.forEach((item) => {
    if (!stores.has(item.storeId)) {
      stores.set(item.storeId, {
        storeName: item.storeName,
        distanceFromCustomerKm: item.storeDistanceKm
      });
    }
  });

  return Array.from(stores.values()).map((store, index) => ({
    storeName: store.storeName,
    distanceFromCustomerKm: store.distanceFromCustomerKm,
    direction:
      store.distanceFromCustomerKm <= 1
        ? "same-route"
        : index % 2 === 0
          ? "east"
          : "west",
    isAlongCurrentRoute: store.distanceFromCustomerKm <= 1
  }));
}

export async function createClientOrder(
  items: CartLineItem[],
  address: CheckoutAddressInput
): Promise<CheckoutResult> {
  const supabase = getSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Please sign in before placing an order.");
  }

  if (items.length === 0) {
    throw new Error("Your cart is empty.");
  }

  const quote = calculateDeliveryQuote(buildQuoteStops(items));
  const itemTotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const { data: addressRow, error: addressError } = await supabase
    .from("addresses")
    .insert({
      user_id: user.id,
      label: address.label,
      house_no: address.houseNo,
      street: address.street,
      area: address.area,
      city: address.city,
      pincode: address.pincode,
      landmark: address.landmark,
      directions: address.directions,
      lat: address.lat,
      lng: address.lng,
      is_default: true
    })
    .select("id")
    .single();

  if (addressError) throw addressError;

  const total = itemTotal + quote.totalCharge;
  const { data: orderRow, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: user.id,
      address_id: addressRow.id,
      status: "pending",
      item_total: itemTotal,
      delivery_fee: quote.baseCharge,
      extra_delivery_fee: quote.extraCharge,
      total,
      payment_status: "pending",
      notes: quote.explanation
    })
    .select("id")
    .single();

  if (orderError) throw orderError;

  const grouped = new Map<string, CartLineItem[]>();
  items.forEach((item) => {
    const existing = grouped.get(item.storeId) ?? [];
    existing.push(item);
    grouped.set(item.storeId, existing);
  });

  for (const [storeId, storeItems] of grouped.entries()) {
    const subtotal = storeItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const { data: groupRow, error: groupError } = await supabase
      .from("order_store_groups")
      .insert({
        order_id: orderRow.id,
        store_id: storeId,
        status: "pending",
        subtotal,
        pickup_sequence: 1
      })
      .select("id")
      .single();

    if (groupError) throw groupError;

    const itemPayload = storeItems.map((item) => ({
      order_store_group_id: groupRow.id,
      product_id: item.productId,
      product_name: item.name,
      quantity: item.quantity,
      unit_price: item.price,
      line_total: item.price * item.quantity
    }));

    const { error: itemError } = await supabase
      .from("order_items")
      .insert(itemPayload);

    if (itemError) throw itemError;
  }

  return {
    orderId: String(orderRow.id).slice(0, 8).toUpperCase(),
    amount: formatCurrency(total)
  };
}

export async function fetchClientOrders(limit = 10): Promise<OrderCard[]> {
  const supabase = maybeGetSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      status,
      total,
      created_at,
      order_store_groups (
        id,
        store_id,
        stores (
          name
        )
      )
    `
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data ?? []).map((order: any) => {
    const storeNames =
      order.order_store_groups
        ?.map((group: any) => group.stores?.name)
        .filter(Boolean)
        .join(" + ") ?? "Store order";

    return {
      id: String(order.id).slice(0, 8).toUpperCase(),
      title:
        order.status === "delivered"
          ? "Order delivered"
          : `Order ${mapOrderStatus(order.status).toLowerCase()}`,
      subtitle: storeNames,
      status:
        (order.order_store_groups?.length ?? 0) > 1
          ? "Stacked order"
          : mapOrderStatus(order.status),
      amount: formatCurrency(Number(order.total ?? 0))
    };
  });
}

export async function fetchMerchantMetrics(): Promise<Metric[]> {
  const supabase = maybeGetSupabaseClient();
  if (!supabase) return [];

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    { count: orderCount, error: orderError },
    { count: packedCount, error: packedError },
    { count: productCount, error: productError }
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .gte("created_at", todayStart.toISOString()),
    supabase
      .from("order_store_groups")
      .select("*", { count: "exact", head: true })
      .in("status", ["ready", "picked_up", "delivered"]),
    supabase.from("products").select("*", { count: "exact", head: true })
  ]);

  if (orderError) throw orderError;
  if (packedError) throw packedError;
  if (productError) throw productError;

  const safeOrderCount = orderCount ?? 0;
  const safePackedCount = packedCount ?? 0;
  const safeProductCount = productCount ?? 0;
  const sla =
    safeOrderCount > 0 ? Math.round((safePackedCount / safeOrderCount) * 100) : 0;

  return [
    { label: "Today's orders", value: String(safeOrderCount), trend: "Live" },
    { label: "Packed in SLA", value: `${sla}%`, trend: "Live" },
    { label: "Catalog live", value: String(safeProductCount), trend: "Synced" }
  ];
}

export async function fetchMerchantOrders(limit = 10): Promise<OrderCard[]> {
  const supabase = maybeGetSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("order_store_groups")
    .select(
      `
      id,
      status,
      subtotal,
      stores (
        name
      )
    `
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((group: any) => ({
    id: String(group.id).slice(0, 8).toUpperCase(),
    title: `${group.stores?.name ?? "Store"} basket`,
    subtitle: `Current status: ${mapOrderStatus(group.status)}`,
    status:
      group.status === "pending" || group.status === "accepted"
        ? "High priority"
        : mapOrderStatus(group.status),
    amount: formatCurrency(Number(group.subtotal ?? 0))
  }));
}

export async function fetchMerchantStores(): Promise<Store[]> {
  return fetchStoresWithInventory();
}

export async function fetchStoreInventory(storeId: string): Promise<InventoryItem[]> {
  const supabase = maybeGetSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("products")
    .select("id, name, price, unit, in_stock")
    .eq("store_id", storeId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((product: any) => ({
    id: String(product.id),
    name: product.name,
    price: Number(product.price),
    unit: product.unit,
    inStock: Boolean(product.in_stock)
  }));
}

export async function updateProductStock(productId: string, inStock: boolean) {
  const supabase = maybeGetSupabaseClient();
  if (!supabase) return;

  const { error } = await supabase
    .from("products")
    .update({ in_stock: inStock })
    .eq("id", productId);

  if (error) throw error;
}

export async function removeProduct(productId: string) {
  const supabase = maybeGetSupabaseClient();
  if (!supabase) return;

  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) throw error;
}

export async function addProductToStore(
  storeId: string,
  item: Omit<InventoryItem, "id">
) {
  const supabase = maybeGetSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("products")
    .insert({
      store_id: storeId,
      name: item.name,
      price: item.price,
      unit: item.unit,
      in_stock: item.inStock
    })
    .select("id, name, price, unit, in_stock")
    .single();

  if (error) throw error;

  return {
    id: String(data.id),
    name: data.name,
    price: Number(data.price),
    unit: data.unit,
    inStock: Boolean(data.in_stock)
  } satisfies InventoryItem;
}

export async function fetchDeliveryMetrics(
  nextPayoutTime: string
): Promise<Metric[]> {
  const supabase = maybeGetSupabaseClient();
  if (!supabase) return [];

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [{ data: runs, error: runsError }, { error: payoutsError }] =
    await Promise.all([
      supabase
        .from("delivery_runs")
        .select("status, incentive_amount, created_at")
        .gte("created_at", todayStart.toISOString()),
      supabase
        .from("rider_payouts")
        .select("amount, payout_date")
        .order("payout_date", { ascending: true })
        .limit(1)
    ]);

  if (runsError) throw runsError;
  if (payoutsError) throw payoutsError;

  const completedRuns = (runs ?? []).filter((run: any) => run.status === "delivered");
  const earnings = completedRuns.reduce(
    (sum: number, run: any) => sum + Number(run.incentive_amount ?? 0),
    0
  );

  return [
    { label: "Today's earnings", value: formatCurrency(earnings), trend: "Live" },
    { label: "Completed runs", value: String(completedRuns.length), trend: "Live" },
    { label: "Tomorrow payout", value: nextPayoutTime, trend: "Auto-settlement" }
  ];
}

export async function fetchDeliveryRuns(limit = 10): Promise<OrderCard[]> {
  const supabase = maybeGetSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("delivery_runs")
    .select("id, status, route_type, pickup_count, incentive_amount")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((run: any) => ({
    id: String(run.id).slice(0, 8).toUpperCase(),
    title:
      Number(run.pickup_count ?? 1) > 1
        ? "Route stack available"
        : "Single pickup express",
    subtitle: `${Number(run.pickup_count ?? 1)} pickup(s) | ${String(
      run.route_type
    ).replaceAll("_", " ")}`,
    status:
      run.status === "available"
        ? "Best incentive fit"
        : mapOrderStatus(run.status),
    amount: formatCurrency(Number(run.incentive_amount ?? 0))
  }));
}

export async function fetchDeliveryEarningsDetails(
  nextPayoutTime: string
): Promise<DeliveryEarningsDetails | null> {
  const supabase = maybeGetSupabaseClient();
  if (!supabase) return null;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [{ data: runs, error: runsError }, { data: payouts, error: payoutsError }] =
    await Promise.all([
      supabase
        .from("delivery_runs")
        .select("status, incentive_amount, created_at")
        .gte("created_at", todayStart.toISOString()),
      supabase
        .from("rider_payouts")
        .select("payout_date, amount, status")
        .order("payout_date", { ascending: true })
        .limit(1)
    ]);

  if (runsError) throw runsError;
  if (payoutsError) throw payoutsError;

  const completedRuns = (runs ?? []).filter((run: any) => run.status === "delivered");
  const earnings = completedRuns.reduce(
    (sum: number, run: any) => sum + Number(run.incentive_amount ?? 0),
    0
  );
  const queuedRuns = (runs ?? []).filter((run: any) => run.status === "available").length;
  const nextPayoutDate = payouts?.[0]?.payout_date;

  return {
    milestones: [
      `${completedRuns.length} completed runs tracked today`,
      `Live incentive earnings: ${formatCurrency(earnings)}`,
      queuedRuns > 0
        ? `${queuedRuns} more run(s) are waiting in the live queue`
        : "No extra runs are waiting in queue right now"
    ],
    settlementLines: [
      `All accepted and completed work for today moves into the next payout cycle at ${nextPayoutTime} tomorrow.`,
      nextPayoutDate
        ? `Next scheduled payout date: ${nextPayoutDate}`
        : "Next payout rows will appear once rider settlements are created."
    ]
  };
}

export async function fetchDeliveryProfile(): Promise<DeliveryProfileData | null> {
  const supabase = maybeGetSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("delivery_partners")
    .select("vehicle_type, is_online")
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    onlineWindow: data.is_online ? "Currently online" : "Currently offline",
    vehicleType: String(data.vehicle_type ?? "Bike"),
    preferredZone: "Assigned local zone"
  };
}
