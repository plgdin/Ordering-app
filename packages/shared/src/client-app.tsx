import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  Card,
  Chip,
  HeroCard,
  Notice,
  PageShell,
  SearchBar,
  SectionTitle
} from "./components";
import {
  categories,
  clientOrders,
  featuredStores,
  multiStoreStops,
  splitDirectionStops
} from "./data";
import { calculateDeliveryQuote } from "./pricing";
import { colors, spacing } from "./theme";

type ClientTab = "home" | "cart" | "orders" | "settings";

const tabs = [
  { id: "home", label: "Home" },
  { id: "cart", label: "Cart" },
  { id: "orders", label: "Orders" },
  { id: "settings", label: "Settings" }
] satisfies { id: ClientTab; label: string }[];

export function ClientApp() {
  const [activeTab, setActiveTab] = useState<ClientTab>("home");
  const routeFriendlyQuote = calculateDeliveryQuote(multiStoreStops);
  const splitDirectionQuote = calculateDeliveryQuote(splitDirectionStops);

  return (
    <PageShell
      title="NearNow"
      subtitle="Everything useful around you, delivered fast."
      activeTab={activeTab}
      onTabChange={setActiveTab}
      tabs={tabs}
    >
      {activeTab === "home" ? (
        <>
          <SearchBar label="Search stores, groceries, medicines, bakery, daily needs" />
          <HeroCard
            eyebrow="Client app"
            title="Local shopping that feels as easy as one smart cart."
            body="Browse nearby supermarkets, bakery items, and OTC pharmacy products across your locality with one smooth delivery flow."
            accent="#C4F4D7"
          />

          <View>
            <SectionTitle title="Shop by category" action="Within 25 km" />
            <View style={styles.rowWrap}>
              {categories.map((category, index) => (
                <Chip key={category} label={category} solid={index < 2} />
              ))}
            </View>
          </View>

          <View>
            <SectionTitle title="Featured nearby stores" action="See all" />
            {featuredStores.map((store) => (
              <Card key={store.id}>
                <View style={styles.storeHeader}>
                  <View style={styles.storeText}>
                    <Text style={styles.storeName}>{store.name}</Text>
                    <Text style={styles.storeMeta}>
                      {store.category} . {store.eta} . {store.distanceKm} km
                    </Text>
                  </View>
                  <Chip label={`${store.rating} rating`} solid />
                </View>
                <Text style={styles.storeHighlight}>{store.highlight}</Text>
                <Notice text={store.deliveryTag} />
              </Card>
            ))}
          </View>

          <View>
            <SectionTitle title="Smart multi-store pricing" />
            <Card>
              <Text style={styles.cardTitle}>When extra delivery is not added</Text>
              <Text style={styles.bodyText}>
                Base fee: Rs {routeFriendlyQuote.baseCharge}. Total: Rs{" "}
                {routeFriendlyQuote.totalCharge}.
              </Text>
              <Text style={styles.bodyText}>{routeFriendlyQuote.explanation}</Text>
            </Card>
            <Card>
              <Text style={styles.cardTitle}>When stores split in different directions</Text>
              <Text style={styles.bodyText}>
                Base fee: Rs {splitDirectionQuote.baseCharge}. Extra fee: Rs{" "}
                {splitDirectionQuote.extraCharge}. Total: Rs{" "}
                {splitDirectionQuote.totalCharge}.
              </Text>
              <Text style={styles.bodyText}>{splitDirectionQuote.explanation}</Text>
            </Card>
          </View>
        </>
      ) : null}

      {activeTab === "cart" ? (
        <>
          <HeroCard
            eyebrow="Cart"
            title="One basket, multiple stores, clear pricing."
            body="Customers get a visible notice before checkout whenever the order needs pickups from multiple stores."
            accent="#FFE8A3"
          />
          <Card>
            <Text style={styles.cardTitle}>Current stacked cart</Text>
            <Text style={styles.bodyText}>More Daily Mart: milk, rice, eggs</Text>
            <Text style={styles.bodyText}>
              HealthPoint Pharmacy: vitamin C, bandages, sanitizer
            </Text>
            <Text style={styles.bodyText}>Daily Crust Bakery: sandwich loaf</Text>
            <Notice text="No extra charge right now because the pickups fit the same rider route." />
          </Card>
          <Card>
            <Text style={styles.cardTitle}>Checkout notes</Text>
            <Text style={styles.bodyText}>
              Delivery ETA stays fast by showing only stores in the nearby locality.
            </Text>
            <Text style={styles.bodyText}>
              Pharmacy is limited to non-prescription products in this version.
            </Text>
          </Card>
        </>
      ) : null}

      {activeTab === "orders" ? (
        <>
          <SectionTitle title="Recent orders" />
          {clientOrders.map((order) => (
            <Card key={order.id}>
              <Text style={styles.cardTitle}>{order.title}</Text>
              <Text style={styles.bodyText}>{order.subtitle}</Text>
              <View style={styles.orderRow}>
                <Chip label={order.status} solid />
                <Text style={styles.amount}>{order.amount}</Text>
              </View>
            </Card>
          ))}
        </>
      ) : null}

      {activeTab === "settings" ? (
        <>
          <SectionTitle title="Settings and trust" />
          <Card>
            <Text style={styles.cardTitle}>Default preferences</Text>
            <Text style={styles.bodyText}>Delivery radius: 25 km</Text>
            <Text style={styles.bodyText}>Notify before extra multi-store charges: On</Text>
            <Text style={styles.bodyText}>Pharmacy mode: OTC products only</Text>
          </Card>
          <Card>
            <Text style={styles.cardTitle}>Future add-ons</Text>
            <Text style={styles.bodyText}>Wallet, subscription, reorder, loyalty rewards</Text>
            <Text style={styles.bodyText}>Live map tracking and smart substitutions</Text>
          </Card>
        </>
      ) : null}
    </PageShell>
  );
}

const styles = StyleSheet.create({
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  storeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md
  },
  storeText: {
    flex: 1,
    gap: 6
  },
  storeName: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.ink
  },
  storeMeta: {
    color: colors.muted,
    fontSize: 14
  },
  storeHighlight: {
    color: colors.ink,
    fontSize: 15,
    lineHeight: 22
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.ink
  },
  bodyText: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22
  },
  orderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  amount: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.ink
  }
});
