import {
  AppliedCartDiscount,
  estimateDirectionBucket,
  calculateDeliveryQuote,
  CartLineItem,
  InventoryItem,
  Metric,
  OrderCard,
  QuoteStop,
  StoreDiscountKey,
  Store
} from "@nearnow/core";
import { AppRole } from "./auth";
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
  paymentStatus: "pending" | "paid";
};

export type PaymentMethod = "cod" | "online";

export type MerchantQueueItem = OrderCard & {
  groupId: string;
  orderId: string;
  rawStatus: string;
  actionLabel?: string;
  nextStatus?: "accepted" | "packing" | "ready";
};

export type DeliveryRunActionItem = OrderCard & {
  runId: string;
  orderId: string;
  rawStatus: string;
  actionLabel?: string;
  nextStatus?: "accepted" | "picked_up" | "delivered";
};

export type MerchantOnboardingInput = {
  name: string;
  category: string;
  highlight: string;
};

export type MerchantDiscountProgram = {
  storeId: string;
  storeName: string;
  discountKey: StoreDiscountKey;
  active: boolean;
};

const merchantDiscountKeys: StoreDiscountKey[] = ["combo30", "save10", "flat75"];

export type ProfileBasics = {
  fullName: string;
  phone: string;
};

type CurrentUserContext = {
  userId: string | null;
  role: AppRole | null;
  fullName: string;
  phone: string;
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
    inventory,
    enabledDiscountKeys: []
  };
}

async function fetchStoreDiscountMap(
  storeIds: string[]
): Promise<Record<string, StoreDiscountKey[]>> {
  const supabase = maybeGetSupabaseClient();
  if (!supabase || storeIds.length === 0) return {};

  try {
    const { data, error } = await supabase
      .from("store_discount_programs")
      .select("store_id, discount_key")
      .in("store_id", storeIds)
      .eq("is_active", true);

    if (error) throw error;

    return (data ?? []).reduce<Record<string, StoreDiscountKey[]>>((acc, row: any) => {
      const storeId = String(row.store_id);
      const discountKey = row.discount_key as StoreDiscountKey;

      if (!acc[storeId]) {
        acc[storeId] = [];
      }

      acc[storeId].push(discountKey);
      return acc;
    }, {});
  } catch {
    return {};
  }
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

  const stores = (data ?? []).map(mapStoreRow);
  const discountMap = await fetchStoreDiscountMap(stores.map((store) => store.id));

  return stores.map((store) => ({
    ...store,
    enabledDiscountKeys: discountMap[store.id] ?? []
  }));
}

export async function fetchCurrentClientAddress(): Promise<CheckoutAddressInput | null> {
  const supabase = maybeGetSupabaseClient();
  if (!supabase) return null;

  const context = await getCurrentUserContext();
  if (!context.userId) return null;

  const { data, error } = await supabase
    .from("addresses")
    .select("label, house_no, street, area, city, pincode, landmark, directions, lat, lng")
    .eq("user_id", context.userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    label: data.label ?? "Home",
    houseNo: data.house_no ?? "",
    street: data.street ?? "",
    area: data.area ?? "",
    city: data.city ?? "",
    pincode: data.pincode ?? "",
    landmark: data.landmark ?? "",
    directions: data.directions ?? "",
    lat: data.lat ?? undefined,
    lng: data.lng ?? undefined
  };
}

export async function saveCurrentClientAddress(address: CheckoutAddressInput) {
  const supabase = maybeGetSupabaseClient();
  if (!supabase) return null;

  const context = await getCurrentUserContext();
  if (!context.userId) return null;

  const { data: existing, error: existingError } = await supabase
    .from("addresses")
    .select("id")
    .eq("user_id", context.userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingError) throw existingError;

  if (existing?.id) {
    const { error } = await supabase
      .from("addresses")
      .update({
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
      .eq("id", existing.id);

    if (error) throw error;
    return address;
  }

  const { error } = await supabase.from("addresses").insert({
    user_id: context.userId,
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
  });

  if (error) throw error;
  return address;
}

export async function fetchCurrentProfileBasics(): Promise<ProfileBasics | null> {
  const context = await getCurrentUserContext();
  if (!context.userId) return null;

  return {
    fullName: context.fullName,
    phone: context.phone
  };
}

export async function updateCurrentProfileBasics(profile: ProfileBasics) {
  const supabase = maybeGetSupabaseClient();
  if (!supabase) return null;

  const context = await getCurrentUserContext();
  if (!context.userId) return null;

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: profile.fullName,
      phone: profile.phone
    })
    .eq("id", context.userId);

  if (error) throw error;
  return profile;
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
    direction: estimateDirectionBucket(
      `${store.storeName}:${index}`,
      store.distanceFromCustomerKm
    ),
    isAlongCurrentRoute: store.distanceFromCustomerKm <= 1
  }));
}

function nextMerchantAction(status: string) {
  switch (status) {
    case "pending":
      return { label: "Accept order", nextStatus: "accepted" as const };
    case "accepted":
      return { label: "Start packing", nextStatus: "packing" as const };
    case "packing":
      return { label: "Mark ready", nextStatus: "ready" as const };
    default:
      return null;
  }
}

function nextDeliveryAction(status: string) {
  switch (status) {
    case "available":
      return { label: "Accept run", nextStatus: "accepted" as const };
    case "accepted":
      return { label: "Mark picked up", nextStatus: "picked_up" as const };
    case "picked_up":
      return { label: "Mark delivered", nextStatus: "delivered" as const };
    default:
      return null;
  }
}

function tomorrowDateString() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

function slugifyStoreName(name: string) {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return base || `store-${Date.now()}`;
}

async function getCurrentUserContext(): Promise<CurrentUserContext> {
  const supabase = maybeGetSupabaseClient();
  if (!supabase) {
    return {
      userId: null,
      role: null,
      fullName: "",
      phone: ""
    };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      userId: null,
      role: null,
      fullName: "",
      phone: ""
    };
  }

  const { data } = await supabase
    .from("profiles")
    .select("role, full_name, phone")
    .eq("id", user.id)
    .maybeSingle();

  return {
    userId: user.id,
    role: (data?.role as AppRole | undefined) ?? null,
    fullName: data?.full_name ?? "",
    phone: data?.phone ?? ""
  };
}

async function getMerchantStoreIds() {
  const supabase = maybeGetSupabaseClient();
  if (!supabase) return null;

  const context = await getCurrentUserContext();
  if (!context.userId) return null;
  if (context.role === "admin") return null;

  const { data, error } = await supabase
    .from("store_staff")
    .select("store_id")
    .eq("user_id", context.userId);

  if (error) throw error;

  return (data ?? []).map((row: any) => String(row.store_id));
}

async function getOrCreateDeliveryPartnerRow() {
  const supabase = getSupabaseClient();
  const context = await getCurrentUserContext();

  if (!context.userId) {
    throw new Error("Please sign in as a rider first.");
  }

  const { data: existing, error: selectError } = await supabase
    .from("delivery_partners")
    .select("id, vehicle_type, is_online")
    .eq("user_id", context.userId)
    .maybeSingle();

  if (selectError) throw selectError;
  if (existing) return existing;

  const { data: created, error: insertError } = await supabase
    .from("delivery_partners")
    .insert({
      user_id: context.userId,
      vehicle_type: "bike",
      is_online: false
    })
    .select("id, vehicle_type, is_online")
    .single();

  if (insertError) throw insertError;
  return created;
}

async function syncOrderStatus(orderId: string) {
  const supabase = maybeGetSupabaseClient();
  if (!supabase) return;

  const [{ data: groups, error: groupsError }, { data: run, error: runError }] =
    await Promise.all([
      supabase
        .from("order_store_groups")
        .select("status")
        .eq("order_id", orderId),
      supabase
        .from("delivery_runs")
        .select("status")
        .eq("order_id", orderId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
    ]);

  if (groupsError) throw groupsError;
  if (runError) throw runError;

  const statuses = (groups ?? []).map((group: any) => String(group.status));
  let nextStatus = "pending";

  if (run?.status === "delivered" || statuses.every((status) => status === "delivered")) {
    nextStatus = "delivered";
  } else if (run?.status === "picked_up") {
    nextStatus = "out_for_delivery";
  } else if (run?.status === "accepted") {
    nextStatus = "assigned";
  } else if (statuses.some((status) => status === "packing")) {
    nextStatus = "packing";
  } else if (statuses.some((status) => status === "ready")) {
    nextStatus = "confirmed";
  } else if (statuses.some((status) => status === "accepted")) {
    nextStatus = "confirmed";
  } else if (statuses.every((status) => status === "cancelled")) {
    nextStatus = "cancelled";
  }

  const { error } = await supabase
    .from("orders")
    .update({ status: nextStatus })
    .eq("id", orderId);

  if (error) throw error;
}

async function ensureDeliveryRunForOrder(orderId: string) {
  const supabase = maybeGetSupabaseClient();
  if (!supabase) return;

  const { data: existing, error: existingError } = await supabase
    .from("delivery_runs")
    .select("id")
    .eq("order_id", orderId)
    .in("status", ["available", "accepted", "picked_up"])
    .limit(1)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing) return;

  const { data: groups, error: groupsError } = await supabase
    .from("order_store_groups")
    .select("status")
    .eq("order_id", orderId);

  if (groupsError) throw groupsError;
  if (!groups?.length) return;

  const allReady = groups.every((group: any) =>
    ["ready", "picked_up", "delivered"].includes(String(group.status))
  );

  if (!allReady) return;

  const pickupCount = groups.length;
  const { error } = await supabase.from("delivery_runs").insert({
    order_id: orderId,
    status: "available",
    route_type: pickupCount > 1 ? "stacked" : "single",
    pickup_count: pickupCount,
    incentive_amount: pickupCount > 1 ? 172 : 74,
    scheduled_payout_date: tomorrowDateString()
  });

  if (error) throw error;
}

export async function createClientOrder(
  items: CartLineItem[],
  address: CheckoutAddressInput,
  paymentMethod: PaymentMethod,
  appliedDiscounts: AppliedCartDiscount[] = []
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
  const discountTotal = appliedDiscounts.reduce(
    (sum, discount) => sum + discount.savingsAmount,
    0
  );

  const savedAddress = await saveCurrentClientAddress(address);
  if (!savedAddress) {
    throw new Error("Unable to save your delivery address.");
  }

  const { data: addressRow, error: addressError } = await supabase
    .from("addresses")
    .select("id")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (addressError) throw addressError;

  const total = Math.max(0, itemTotal + quote.totalCharge - discountTotal);
  const paymentStatus = "pending";
  const discountSummary =
    appliedDiscounts.length > 0
      ? ` Discounts applied: ${appliedDiscounts
          .map((discount) => `${discount.code} (-Rs ${discount.savingsAmount})`)
          .join(", ")}.`
      : "";
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
      payment_status: paymentStatus,
      notes: `Payment method: ${paymentMethod}. ${quote.explanation}${discountSummary}`
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

  await syncOrderStatus(orderRow.id);

  return {
    orderId: String(orderRow.id).slice(0, 8).toUpperCase(),
    amount: formatCurrency(total),
    paymentStatus
  };
}

export async function fetchMerchantDiscountPrograms(): Promise<MerchantDiscountProgram[]> {
  const stores = await fetchMerchantStores();

  return stores.flatMap((store) =>
    merchantDiscountKeys.map((discountKey) => ({
      storeId: store.id,
      storeName: store.name,
      discountKey,
      active: (store.enabledDiscountKeys ?? []).includes(discountKey)
    }))
  );
}

export async function setMerchantDiscountProgram(
  storeId: string,
  discountKey: StoreDiscountKey,
  active: boolean
) {
  const supabase = getSupabaseClient();

  if (active) {
    const { error } = await supabase
      .from("store_discount_programs")
      .upsert(
        {
          store_id: storeId,
          discount_key: discountKey,
          is_active: true
        },
        { onConflict: "store_id,discount_key" }
      );

    if (error) throw error;
    return;
  }

  const { error } = await supabase
    .from("store_discount_programs")
    .delete()
    .eq("store_id", storeId)
    .eq("discount_key", discountKey);

  if (error) throw error;
}

export async function fetchClientOrders(limit = 10): Promise<OrderCard[]> {
  const supabase = maybeGetSupabaseClient();
  if (!supabase) return [];

  const context = await getCurrentUserContext();
  if (!context.userId) return [];

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
    .eq("customer_id", context.userId)
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

  const storeIds = await getMerchantStoreIds();
  if (storeIds && storeIds.length === 0) {
    return [
      { label: "Today's orders", value: "0", trend: "No store linked" },
      { label: "Packed in SLA", value: "0%", trend: "No store linked" },
      { label: "Catalog live", value: "0", trend: "No store linked" }
    ];
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  let orderGroupsQuery = supabase
    .from("order_store_groups")
    .select("status, created_at, store_id");
  let productsQuery = supabase.from("products").select("store_id");

  if (storeIds && storeIds.length > 0) {
    orderGroupsQuery = orderGroupsQuery.in("store_id", storeIds);
    productsQuery = productsQuery.in("store_id", storeIds);
  }

  const [{ data: orderGroups, error: orderError }, { data: products, error: productError }] =
    await Promise.all([
      orderGroupsQuery.gte("created_at", todayStart.toISOString()),
      productsQuery
    ]);

  if (orderError) throw orderError;
  if (productError) throw productError;

  const safeOrderGroups = orderGroups ?? [];
  const packedCount = safeOrderGroups.filter((group: any) =>
    ["ready", "picked_up", "delivered"].includes(String(group.status))
  ).length;
  const sla =
    safeOrderGroups.length > 0
      ? Math.round((packedCount / safeOrderGroups.length) * 100)
      : 0;

  return [
    { label: "Today's orders", value: String(safeOrderGroups.length), trend: "Live" },
    { label: "Packed in SLA", value: `${sla}%`, trend: "Live" },
    { label: "Catalog live", value: String((products ?? []).length), trend: "Synced" }
  ];
}

export async function fetchMerchantOrders(limit = 10): Promise<MerchantQueueItem[]> {
  const supabase = maybeGetSupabaseClient();
  if (!supabase) return [];

  const storeIds = await getMerchantStoreIds();
  if (storeIds && storeIds.length === 0) return [];

  let query = supabase
    .from("order_store_groups")
    .select(
      `
      id,
      order_id,
      status,
      subtotal,
      store_id,
      stores (
        name
      )
    `
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (storeIds && storeIds.length > 0) {
    query = query.in("store_id", storeIds);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data ?? []).map((group: any) => {
    const action = nextMerchantAction(group.status);
    return {
      groupId: String(group.id),
      orderId: String(group.order_id),
      rawStatus: String(group.status),
      id: String(group.id).slice(0, 8).toUpperCase(),
      title: `${group.stores?.name ?? "Store"} basket`,
      subtitle: `Current status: ${mapOrderStatus(group.status)}`,
      status:
        group.status === "pending" || group.status === "accepted"
          ? "High priority"
          : mapOrderStatus(group.status),
      amount: formatCurrency(Number(group.subtotal ?? 0)),
      actionLabel: action?.label,
      nextStatus: action?.nextStatus
    };
  });
}

export async function fetchMerchantStores(): Promise<Store[]> {
  const supabase = maybeGetSupabaseClient();
  if (!supabase) return [];

  const storeIds = await getMerchantStoreIds();
  if (storeIds && storeIds.length === 0) return [];

  let query = supabase
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
    .order("created_at", { ascending: false });

  if (storeIds && storeIds.length > 0) {
    query = query.in("id", storeIds);
  } else {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) throw error;

  const stores = (data ?? []).map(mapStoreRow);
  const discountMap = await fetchStoreDiscountMap(stores.map((store) => store.id));

  return stores.map((store) => ({
    ...store,
    enabledDiscountKeys: discountMap[store.id] ?? []
  }));
}

export async function createMerchantStore(input: MerchantOnboardingInput) {
  const supabase = getSupabaseClient();
  const context = await getCurrentUserContext();

  if (!context.userId) {
    throw new Error("Please sign in first.");
  }

  const { data: storeId, error: storeError } = await supabase.rpc(
    "create_store_with_owner",
    {
      p_name: input.name,
      p_category: input.category,
      p_highlight: input.highlight
    }
  );
  if (storeError) throw storeError;

  const stores = await fetchMerchantStores();
  return stores.find((entry) => entry.id === String(storeId)) ?? null;
}

export async function updateMerchantOrderStatus(
  groupId: string,
  nextStatus: "accepted" | "packing" | "ready" | "cancelled"
) {
  const supabase = getSupabaseClient();

  const { data: group, error: fetchError } = await supabase
    .from("order_store_groups")
    .select("id, order_id")
    .eq("id", groupId)
    .single();

  if (fetchError) throw fetchError;

  const { error } = await supabase
    .from("order_store_groups")
    .update({ status: nextStatus })
    .eq("id", groupId);

  if (error) throw error;

  if (nextStatus === "ready") {
    await ensureDeliveryRunForOrder(String(group.order_id));
  }

  await syncOrderStatus(String(group.order_id));
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

  const partner = await getOrCreateDeliveryPartnerRow().catch(() => null);
  let runsQuery = supabase
    .from("delivery_runs")
    .select("status, incentive_amount, created_at")
    .gte("created_at", todayStart.toISOString());
  let payoutsQuery = supabase
    .from("rider_payouts")
    .select("amount, payout_date")
    .order("payout_date", { ascending: true })
    .limit(1);

  if (partner?.id) {
    runsQuery = runsQuery.eq("rider_id", partner.id);
    payoutsQuery = payoutsQuery.eq("rider_id", partner.id);
  }

  const [{ data: runs, error: runsError }, { error: payoutsError }] =
    await Promise.all([runsQuery, payoutsQuery]);

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

export async function fetchDeliveryRuns(limit = 10): Promise<DeliveryRunActionItem[]> {
  const supabase = maybeGetSupabaseClient();
  if (!supabase) return [];

  const partner = await getOrCreateDeliveryPartnerRow().catch(() => null);
  let query = supabase
    .from("delivery_runs")
    .select("id, order_id, status, route_type, pickup_count, incentive_amount, rider_id")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (partner?.id) {
    query = query.or(`status.eq.available,rider_id.eq.${partner.id}`);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data ?? []).map((run: any) => {
    const action = nextDeliveryAction(run.status);
    return {
      runId: String(run.id),
      orderId: String(run.order_id),
      rawStatus: String(run.status),
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
      amount: formatCurrency(Number(run.incentive_amount ?? 0)),
      actionLabel: action?.label,
      nextStatus: action?.nextStatus
    };
  });
}

export async function fetchDeliveryEarningsDetails(
  nextPayoutTime: string
): Promise<DeliveryEarningsDetails | null> {
  const supabase = maybeGetSupabaseClient();
  if (!supabase) return null;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const partner = await getOrCreateDeliveryPartnerRow().catch(() => null);
  let runsQuery = supabase
    .from("delivery_runs")
    .select("status, incentive_amount, created_at")
    .gte("created_at", todayStart.toISOString());
  let payoutsQuery = supabase
    .from("rider_payouts")
    .select("payout_date, amount, status")
    .order("payout_date", { ascending: true })
    .limit(1);

  if (partner?.id) {
    runsQuery = runsQuery.eq("rider_id", partner.id);
    payoutsQuery = payoutsQuery.eq("rider_id", partner.id);
  }

  const [{ data: runs, error: runsError }, { data: payouts, error: payoutsError }] =
    await Promise.all([runsQuery, payoutsQuery]);

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
  const partner = await getOrCreateDeliveryPartnerRow().catch(() => null);
  if (!partner) return null;

  return {
    onlineWindow: partner.is_online ? "Currently online" : "Currently offline",
    vehicleType: String(partner.vehicle_type ?? "Bike"),
    preferredZone: "Assigned local zone"
  };
}

export async function acceptDeliveryRun(runId: string) {
  const supabase = getSupabaseClient();
  const partner = await getOrCreateDeliveryPartnerRow();

  const { data: run, error: fetchError } = await supabase
    .from("delivery_runs")
    .select("id, order_id")
    .eq("id", runId)
    .single();

  if (fetchError) throw fetchError;

  const { error } = await supabase
    .from("delivery_runs")
    .update({
      rider_id: partner.id,
      status: "accepted"
    })
    .eq("id", runId);

  if (error) throw error;

  const { error: partnerError } = await supabase
    .from("delivery_partners")
    .update({ is_online: true })
    .eq("id", partner.id);

  if (partnerError) throw partnerError;

  await syncOrderStatus(String(run.order_id));
}

export async function updateDeliveryRunStatus(
  runId: string,
  nextStatus: "picked_up" | "delivered"
) {
  const supabase = getSupabaseClient();
  const partner = await getOrCreateDeliveryPartnerRow();

  const { data: run, error: fetchError } = await supabase
    .from("delivery_runs")
    .select("id, order_id, incentive_amount")
    .eq("id", runId)
    .eq("rider_id", partner.id)
    .single();

  if (fetchError) throw fetchError;

  const { error } = await supabase
    .from("delivery_runs")
    .update({ status: nextStatus })
    .eq("id", runId)
    .eq("rider_id", partner.id);

  if (error) throw error;

  if (nextStatus === "picked_up") {
    const { error: groupsError } = await supabase
      .from("order_store_groups")
      .update({ status: "picked_up" })
      .eq("order_id", run.order_id);

    if (groupsError) throw groupsError;
  }

  if (nextStatus === "delivered") {
    const { error: groupsError } = await supabase
      .from("order_store_groups")
      .update({ status: "delivered" })
      .eq("order_id", run.order_id);

    if (groupsError) throw groupsError;

    const { error: payoutError } = await supabase
      .from("rider_payouts")
      .insert({
        rider_id: partner.id,
        payout_date: tomorrowDateString(),
        amount: Number(run.incentive_amount ?? 0),
        status: "pending"
      });

    if (payoutError) throw payoutError;
  }

  await syncOrderStatus(String(run.order_id));
}
