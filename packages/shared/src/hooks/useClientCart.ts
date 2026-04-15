import {
  AppliedCartDiscount,
  estimateDirectionBucket,
  calculateDeliveryQuote,
  calculateDiscountAmount,
  CartDiscountOption,
  CartLineItem,
  getDiscountTemplate,
  InventoryItem,
  QuoteStop,
  Store
} from "@nearnow/core";
import { readStoredJson, writeStoredJson } from "@nearnow/supabase";
import { useEffect, useMemo, useState } from "react";

const CART_STORAGE_KEY = "nearnow:client:cart";
const CART_DISCOUNTS_STORAGE_KEY = "nearnow:client:cart:discounts";

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

export function useClientCart() {
  const [items, setItems] = useState<CartLineItem[]>([]);
  const [appliedDiscountIds, setAppliedDiscountIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      readStoredJson<CartLineItem[]>(CART_STORAGE_KEY, []),
      readStoredJson<string[]>(CART_DISCOUNTS_STORAGE_KEY, [])
    ])
      .then(([storedItems, storedDiscountIds]) => {
        if (!cancelled) {
          setItems(storedItems);
          setAppliedDiscountIds(storedDiscountIds);
          setHydrated(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHydrated(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void writeStoredJson(CART_STORAGE_KEY, items);
  }, [hydrated, items]);

  useEffect(() => {
    if (!hydrated) return;
    void writeStoredJson(CART_DISCOUNTS_STORAGE_KEY, appliedDiscountIds);
  }, [appliedDiscountIds, hydrated]);

  const addItem = (store: Store, item: InventoryItem) => {
    const lineId = `${store.id}:${item.id}`;

    setItems((prev) => {
      const existing = prev.find((entry) => entry.id === lineId);
      if (existing) {
        return prev.map((entry) =>
          entry.id === lineId
            ? { ...entry, quantity: entry.quantity + 1 }
            : entry
        );
      }

      return [
        ...prev,
        {
          id: lineId,
          storeId: store.id,
          storeName: store.name,
          storeCategory: store.category,
          storeDistanceKm: store.distanceKm,
          storeDiscountKeys: store.enabledDiscountKeys,
          storeImage: store.image,
          productId: item.id,
          name: item.name,
          price: item.price,
          unit: item.unit,
          quantity: 1
        }
      ];
    });
  };

  const updateQuantity = (lineId: string, nextQuantity: number) => {
    setItems((prev) =>
      nextQuantity <= 0
        ? prev.filter((item) => item.id !== lineId)
        : prev.map((item) =>
            item.id === lineId ? { ...item, quantity: nextQuantity } : item
          )
    );
  };

  const clear = () => {
    setItems([]);
    setAppliedDiscountIds([]);
  };

  const groupedItems = useMemo(() => {
    const groups = new Map<
      string,
      {
        storeId: string;
        storeName: string;
        storeCategory: string;
        storeDistanceKm: number;
        storeDiscountKeys?: CartLineItem["storeDiscountKeys"];
        storeImage?: string;
        items: CartLineItem[];
      }
    >();

    items.forEach((item) => {
      const existing = groups.get(item.storeId);
      if (existing) {
        existing.items.push(item);
        existing.storeDiscountKeys = Array.from(
          new Set([...(existing.storeDiscountKeys ?? []), ...(item.storeDiscountKeys ?? [])])
        );
        return;
      }

      groups.set(item.storeId, {
        storeId: item.storeId,
        storeName: item.storeName,
        storeCategory: item.storeCategory,
        storeDistanceKm: item.storeDistanceKm,
        storeDiscountKeys: item.storeDiscountKeys ?? [],
        storeImage: item.storeImage,
        items: [item]
      });
    });

    return Array.from(groups.values());
  }, [items]);

  const deliveryQuote = useMemo(
    () => calculateDeliveryQuote(buildQuoteStops(items)),
    [items]
  );

  const availableDiscounts = useMemo(() => {
    return groupedItems.flatMap<CartDiscountOption>((group) => {
      const subtotal = group.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      return (group.storeDiscountKeys ?? [])
        .map((discountKey) => {
          const template = getDiscountTemplate(discountKey);
          if (!template) return null;

          const savingsAmount = calculateDiscountAmount(template, subtotal);
          if (savingsAmount <= 0) return null;

          return {
            id: `${group.storeId}:${discountKey}`,
            storeId: group.storeId,
            storeName: group.storeName,
            discountKey,
            code: template.code,
            title: template.title,
            description: template.description,
            savingsAmount
          };
        })
        .filter((discount): discount is CartDiscountOption => Boolean(discount));
    });
  }, [groupedItems]);

  useEffect(() => {
    const nextDiscountIds = new Set(availableDiscounts.map((discount) => discount.id));

    setAppliedDiscountIds((current) =>
      current.filter((discountId) => nextDiscountIds.has(discountId))
    );
  }, [availableDiscounts]);

  const appliedDiscounts = useMemo<AppliedCartDiscount[]>(
    () =>
      availableDiscounts.filter((discount) => appliedDiscountIds.includes(discount.id)),
    [appliedDiscountIds, availableDiscounts]
  );

  const discountTotal = useMemo(
    () => appliedDiscounts.reduce((sum, discount) => sum + discount.savingsAmount, 0),
    [appliedDiscounts]
  );

  const itemTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  return {
    items,
    groupedItems,
    hydrated,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    itemTotal,
    deliveryQuote,
    availableDiscounts,
    appliedDiscounts,
    discountTotal,
    grandTotal: Math.max(0, itemTotal + deliveryQuote.totalCharge - discountTotal),
    addItem,
    toggleDiscount: (discountId: string) => {
      setAppliedDiscountIds((current) =>
        current.includes(discountId)
          ? current.filter((id) => id !== discountId)
          : [...current, discountId]
      );
    },
    updateQuantity,
    clear
  };
}
