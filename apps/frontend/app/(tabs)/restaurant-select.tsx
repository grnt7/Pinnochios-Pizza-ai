import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import {
  Alert,
  InteractionManager,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import { BottomCtaButton } from "@/components/ui/bottom-cta-button";
import { QuantitySelector } from "@/components/ui/quantity-selector";
import { RestaurantCard } from "@/components/ui/restaurant-card";
import { ScreenRedHeader } from "@/components/ui/screen-red-header";
import type { MockRestaurant } from "@/lib/mock-restaurants";
import { useCart } from "@/components/cart-context";
import { useOrderDraft } from "@/components/order-draft-context";
import { formatUsd } from "@/lib/format";
import { api } from "@/lib/convex-api";
import { makeLineKey, preRestaurantUnitCents, SIZE_META } from "@/lib/pricing";
import { palette } from "@/theme";
import { useMemo, useState } from "react";

function storeToVirtualRestaurant(
  store:
    | {
        storeDisplayName: string;
        deliveryFeeCents: number;
        kitchenPriceMultiplier: number;
      }
    | null
    | undefined,
): MockRestaurant | null {
  if (!store) return null;
  return {
    id: "pinnochios_main",
    name: store.storeDisplayName,
    deliveryFeeCents: store.deliveryFeeCents,
    etaMinutes: 25,
    priceMultiplier: store.kitchenPriceMultiplier,
    rating: 4.9,
  };
}

export default function RestaurantSelectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { draft, setDraft, updateDraft } = useOrderDraft();
  const { addItem } = useCart();

  const store = useQuery(api.storeSettings.getPublic);
  const ingredients = useQuery(api.menu.listIngredients);

  const virtualRestaurant = useMemo(
    () => storeToVirtualRestaurant(store ?? null),
    [store],
  );

  const [restaurantId, setRestaurantId] = useState("pinnochios_main");

  if (!draft) {
    return (
      <View style={styles.missingRoot}>
        <ScreenRedHeader title="Pickup & delivery" onBack={() => router.back()} />
        <View style={styles.missing}>
        <Text style={styles.missingTitle}>Choose a pizza first</Text>
        <Text style={styles.missingSub}>
          Open a pizza from the menu, customize it, then finish setup.
        </Text>
        <BottomCtaButton
          label="Back to menu"
          style={{ marginTop: 20, alignSelf: "stretch", flexGrow: 0 }}
          onPress={() => router.back()}
        />
      </View>
      </View>
    );
  }

  if (store === undefined || ingredients === undefined || !virtualRestaurant) {
    return (
      <View style={styles.missingRoot}>
        <ScreenRedHeader title="Pickup & delivery" onBack={() => router.back()} />
        <View style={styles.missing}>
          <Text style={styles.missingTitle}>Loading…</Text>
        </View>
      </View>
    );
  }

  const preRestaurant = preRestaurantUnitCents({
    basePriceCents: draft.basePriceCents,
    sizeKey: draft.sizeKey,
    extraIngredientIds: draft.selectedExtraIngredientIds,
    ingredients,
  });

  const restaurant = virtualRestaurant;
  const unitFood = Math.max(
    1,
    Math.round(preRestaurant * restaurant.priceMultiplier),
  );
  const total = draft.quantity * unitFood + restaurant.deliveryFeeCents;
  const addLabel = `Add to cart — ${formatUsd(total)}`;

  return (
    <View style={styles.root}>
      <ScreenRedHeader title="Pickup & delivery" onBack={() => router.back()} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.pad,
          { paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.note}>
          You&apos;re ordering from our single Pinnochio&apos;s location.
          Fees and ETA update from the shop settings.
        </Text>

        <RestaurantCard
          restaurant={restaurant}
          totalCents={total}
          selected={restaurantId === restaurant.id}
          onSelect={() => {
            setRestaurantId(restaurant.id);
            void Haptics.selectionAsync();
          }}
        />
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingBottom: Math.max(insets.bottom, 12),
            paddingHorizontal: 16,
          },
        ]}
      >
        <QuantitySelector
          quantity={draft.quantity}
          onIncrement={() =>
            updateDraft({ quantity: draft.quantity + 1 })
          }
          onDecrement={() =>
            updateDraft({
              quantity: Math.max(1, draft.quantity - 1),
            })
          }
        />
        <BottomCtaButton
          label={addLabel}
          onPress={() => {
            const foodUnit = unitFood;
            const displayName = draft.pizzaName;
            const venueName = restaurant.name;
            const lineKey = makeLineKey(
              draft.pizzaId,
              draft.sizeKey,
              draft.selectedExtraIngredientIds,
              restaurant.id,
            );
            addItem({
              lineKey,
              pizzaId: draft.pizzaId,
              name: displayName,
              priceCents: foodUnit,
              deliveryFeeCents: restaurant.deliveryFeeCents,
              sizeKey: draft.sizeKey,
              sizeLabel: `${SIZE_META[draft.sizeKey].subtitle} · ${SIZE_META[draft.sizeKey].label}`,
              restaurantId: restaurant.id,
              restaurantName: venueName,
              extraIngredientIds: [...draft.selectedExtraIngredientIds].sort(),
              quantity: draft.quantity,
            });
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setDraft(null);
            InteractionManager.runAfterInteractions(() => {
              Alert.alert(
                "Added to cart",
                `${displayName} from ${venueName}.`,
              );
              router.replace("/(tabs)/cart");
            });
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.cream },
  scroll: { flex: 1 },
  pad: { padding: 18, paddingTop: 12 },
  note: {
    marginBottom: 16,
    fontSize: 14,
    color: palette.textSecondary,
    lineHeight: 20,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 12,
    backgroundColor: palette.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.borderStrong,
  },
  missingRoot: { flex: 1, backgroundColor: palette.cream },
  missing: {
    flex: 1,
    backgroundColor: palette.cream,
    padding: 24,
    justifyContent: "center",
  },
  missingTitle: { fontSize: 20, fontWeight: "800", color: palette.text },
  missingSub: { marginTop: 8, color: palette.textSecondary, fontSize: 15 },
});
