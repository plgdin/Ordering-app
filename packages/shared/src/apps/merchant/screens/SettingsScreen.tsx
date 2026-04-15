import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { serviceRules } from "@nearnow/config";
import { StoreDiscountKey, storeDiscountTemplates } from "@nearnow/core";
import { Card, Notice, SectionTitle, colors, radius, spacing } from "@nearnow/ui";
import { AuthCard } from "../../../components/AuthCard";
import { useSupabaseAuth } from "../../../hooks/useSupabaseAuth";
import {
  createMerchantStore,
  fetchCurrentProfileBasics,
  fetchMerchantStores,
  setMerchantDiscountProgram,
  updateCurrentProfileBasics
} from "@nearnow/supabase";

export function MerchantSettingsScreen() {
  const auth = useSupabaseAuth("merchant");
  const [stores, setStores] = useState<{
    id: string;
    name: string;
    enabledDiscountKeys?: StoreDiscountKey[];
  }[]>([]);
  const [storesBusy, setStoresBusy] = useState(false);
  const [storesError, setStoresError] = useState<string | null>(null);
  const [discountBusyKey, setDiscountBusyKey] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileBusy, setProfileBusy] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [draftName, setDraftName] = useState("");
  const [draftCategory, setDraftCategory] = useState("Groceries");
  const [draftHighlight, setDraftHighlight] = useState("Fast local delivery");

  useEffect(() => {
    let cancelled = false;

    if (!auth.snapshot.isSignedIn) {
      setStores([]);
      return;
    }

    setStoresBusy(true);
    setStoresError(null);
    void fetchMerchantStores()
      .then((result) => {
        if (cancelled) return;
        setStores(
          result.map((store) => ({
            id: store.id,
            name: store.name,
            enabledDiscountKeys: store.enabledDiscountKeys ?? []
          }))
        );
      })
      .catch((nextError: any) => {
        if (cancelled) return;
        setStoresError(nextError?.message ?? "Unable to load your store access.");
      })
      .finally(() => {
        if (!cancelled) setStoresBusy(false);
      });

    void fetchCurrentProfileBasics()
      .then((profile) => {
        if (cancelled || !profile) return;
        setFullName(profile.fullName);
        setPhone(profile.phone);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [auth.snapshot.isSignedIn]);

  return (
    <>
      <SectionTitle title="Store settings" />
      {auth.snapshot.isSignedIn ? (
        <>
          <Card>
            <Text style={styles.cardTitle}>Merchant profile</Text>
            {profileError ? <Notice tone="warning" text={profileError} /> : null}
            <View style={styles.formField}>
              <Text style={styles.formLabel}>Full name</Text>
              <TextInput
                style={styles.formInput}
                value={fullName}
                onChangeText={setFullName}
                placeholder="e.g. Ananya Patel"
                placeholderTextColor={colors.muted}
              />
            </View>
            <View style={styles.formField}>
              <Text style={styles.formLabel}>Phone</Text>
              <TextInput
                style={styles.formInput}
                value={phone}
                onChangeText={setPhone}
                placeholder="e.g. +91 99999 12345"
                placeholderTextColor={colors.muted}
                keyboardType="phone-pad"
              />
            </View>
            <Pressable
              style={[styles.primaryButton, profileBusy && styles.buttonDisabled]}
              disabled={profileBusy}
              onPress={() => {
                setProfileError(null);
                setProfileBusy(true);
                void updateCurrentProfileBasics({ fullName, phone })
                  .catch((nextError: any) => {
                    setProfileError(nextError?.message ?? "Unable to save profile changes.");
                  })
                  .finally(() => setProfileBusy(false));
              }}
            >
              <Text style={styles.primaryButtonText}>
                {profileBusy ? "Saving..." : "Save profile"}
              </Text>
            </Pressable>
          </Card>

          <Card>
            <Text style={styles.cardTitle}>Store ownership</Text>
            {storesError ? <Notice tone="warning" text={storesError} /> : null}
            {storesBusy ? (
              <Text style={styles.bodyText}>Loading linked stores…</Text>
            ) : stores.length > 0 ? (
              <>
                <Text style={styles.bodyText}>
                  Linked stores: {stores.map((store) => store.name).join(", ")}
                </Text>
                <Text style={styles.bodyText}>
                  Add inventory and manage orders from the Catalog and Orders tabs.
                </Text>
                {stores.map((store) => (
                  <View key={store.id} style={styles.discountBlock}>
                    <Text style={styles.discountStoreTitle}>{store.name}</Text>
                    <Text style={styles.bodyText}>
                      Turn on only the platform-approved discount programs you want customers
                      to use.
                    </Text>
                    {storeDiscountTemplates.map((template) => {
                      const active = (store.enabledDiscountKeys ?? []).includes(template.key);
                      const busyKey = `${store.id}:${template.key}`;

                      return (
                        <View key={template.key} style={styles.discountRow}>
                          <View style={styles.discountInfo}>
                            <Text style={styles.discountCode}>
                              {template.code} | {template.title}
                            </Text>
                            <Text style={styles.discountDescription}>
                              {template.description}
                            </Text>
                          </View>
                          <Pressable
                            style={[
                              styles.discountToggle,
                              active && styles.discountToggleActive,
                              discountBusyKey === busyKey && styles.buttonDisabled
                            ]}
                            disabled={discountBusyKey === busyKey}
                            onPress={() => {
                              setStoresError(null);
                              setDiscountBusyKey(busyKey);
                              void setMerchantDiscountProgram(store.id, template.key, !active)
                                .then(() => {
                                  setStores((current) =>
                                    current.map((entry) =>
                                      entry.id !== store.id
                                        ? entry
                                        : {
                                            ...entry,
                                            enabledDiscountKeys: !active
                                              ? Array.from(
                                                  new Set([
                                                    ...(entry.enabledDiscountKeys ?? []),
                                                    template.key
                                                  ])
                                                )
                                              : (entry.enabledDiscountKeys ?? []).filter(
                                                  (key) => key !== template.key
                                                )
                                          }
                                    )
                                  );
                                })
                                .catch((nextError: any) => {
                                  setStoresError(
                                    nextError?.message ??
                                      "Unable to update merchant discount settings."
                                  );
                                })
                                .finally(() => setDiscountBusyKey(null));
                            }}
                          >
                            <Text
                              style={[
                                styles.discountToggleText,
                                active && styles.discountToggleTextActive
                              ]}
                            >
                              {active ? "On" : "Off"}
                            </Text>
                          </Pressable>
                        </View>
                      );
                    })}
                  </View>
                ))}
              </>
            ) : (
              <>
                <Text style={styles.bodyText}>
                  No store is linked to this account yet. Create your first store to unlock
                  inventory and order actions.
                </Text>
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Store name</Text>
                  <TextInput
                    style={styles.formInput}
                    value={draftName}
                    onChangeText={setDraftName}
                    placeholder="e.g. More Daily Mart"
                    placeholderTextColor={colors.muted}
                  />
                </View>
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Category</Text>
                  <TextInput
                    style={styles.formInput}
                    value={draftCategory}
                    onChangeText={setDraftCategory}
                    placeholder="e.g. Groceries"
                    placeholderTextColor={colors.muted}
                  />
                </View>
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Highlight</Text>
                  <TextInput
                    style={[styles.formInput, styles.formInputMultiline]}
                    value={draftHighlight}
                    onChangeText={setDraftHighlight}
                    placeholder="Short tagline shown on the customer home feed"
                    placeholderTextColor={colors.muted}
                    multiline
                  />
                </View>
                <Pressable
                  style={[styles.primaryButton, storesBusy && styles.buttonDisabled]}
                  disabled={storesBusy || !draftName.trim()}
                  onPress={() => {
                    setStoresError(null);
                    setStoresBusy(true);
                    void createMerchantStore({
                      name: draftName.trim(),
                      category: draftCategory.trim() || "General",
                      highlight: draftHighlight.trim()
                    })
                      .then((created) => {
                        if (created) {
                          setStores([
                            {
                              id: created.id,
                              name: created.name,
                              enabledDiscountKeys: created.enabledDiscountKeys ?? []
                            }
                          ]);
                        }
                      })
                      .catch((nextError: any) => {
                        setStoresError(nextError?.message ?? "Unable to create the store.");
                      })
                      .finally(() => setStoresBusy(false));
                  }}
                >
                  <Text style={styles.primaryButtonText}>
                    {storesBusy ? "Creating..." : "Create store"}
                  </Text>
                </Pressable>
              </>
            )}
          </Card>
        </>
      ) : null}
      <Card>
        <Text style={styles.cardTitle}>Operational rules</Text>
        <Text style={styles.bodyText}>
          Store radius visibility: {serviceRules.localityRadiusKm} km service grid
        </Text>
        <Text style={styles.bodyText}>Auto-accept during peak hours: On</Text>
        <Text style={styles.bodyText}>Settlement summary refresh: Daily</Text>
      </Card>
      <AuthCard
        title="Merchant access"
        roleLabel="Merchant"
        configured={auth.snapshot.isConfigured}
        signedIn={auth.snapshot.isSignedIn}
        email={auth.snapshot.email}
        busy={auth.busy}
        error={auth.error}
        info={auth.info}
        onClearError={auth.clearError}
        onSignIn={auth.signIn}
        onSignUp={auth.signUp}
        onSignOut={auth.signOut}
        onSendReset={auth.sendReset}
        onResendConfirmation={auth.resendConfirmation}
      />
    </>
  );
}

const styles = StyleSheet.create({
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
  formField: {
    gap: 6
  },
  formLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.muted
  },
  formInput: {
    backgroundColor: colors.primaryFaint,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.ink
  },
  formInputMultiline: {
    minHeight: 72,
    textAlignVertical: "top" as never
  },
  discountBlock: {
    marginTop: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: spacing.md
  },
  discountStoreTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.ink
  },
  discountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12
  },
  discountInfo: {
    flex: 1,
    gap: 3
  },
  discountCode: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.primaryMid
  },
  discountDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted
  },
  discountToggle: {
    minWidth: 58,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primaryMid,
    paddingVertical: 8,
    alignItems: "center"
  },
  discountToggleActive: {
    backgroundColor: colors.primaryMid
  },
  discountToggleText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.primaryMid
  },
  discountToggleTextActive: {
    color: "#FFFFFF"
  },
  primaryButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: "center"
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14
  },
  buttonDisabled: {
    opacity: 0.7
  }
});
