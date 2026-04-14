import { calculateDeliveryQuote, CartLineItem, InventoryItem, QuoteStop, Store } from "@nearnow/core";
import { readStoredJson, writeStoredJson } from "@nearnow/supabase";
import { useEffect, useMemo, useState } from "react";

const CART_STORAGE_KEY = "nearnow:client:cart";

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

export function useClientCart() {
  const [items, setItems] = useState<CartLineItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void readStoredJson<CartLineItem[]>(CART_STORAGE_KEY, [])
      .then((storedItems) => {
        if (!cancelled) {
          setItems(storedItems);
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
  };

  const groupedItems = useMemo(() => {
    const groups = new Map<
      string,
      {
        storeId: string;
        storeName: string;
        storeCategory: string;
        storeDistanceKm: number;
        storeImage?: string;
        items: CartLineItem[];
      }
    >();

    items.forEach((item) => {
      const existing = groups.get(item.storeId);
      if (existing) {
        existing.items.push(item);
        return;
      }

      groups.set(item.storeId, {
        storeId: item.storeId,
        storeName: item.storeName,
        storeCategory: item.storeCategory,
        storeDistanceKm: item.storeDistanceKm,
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
    grandTotal: itemTotal + deliveryQuote.totalCharge,
    addItem,
    updateQuantity,
    clear
  };
}
