import { useQuery } from "convex/react";
import type { Id } from "../../../../../backend/convex/_generated/dataModel";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useMemo } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BottomCtaButton } from "@/components/ui/bottom-cta-button";
import { IngredientRow } from "@/components/ui/ingredient-row";
import { QuantitySelector } from "@/components/ui/quantity-selector";
import { ScreenRedHeader } from "@/components/ui/screen-red-header";
import { SizeCard } from "@/components/ui/size-card";
import { useFavorites } from "@/components/favorites-context";
import { useOrderDraft } from "@/components/order-draft-context";
import LoadingScreen from "@/components/loading-screen";
import { formatUsd } from "@/lib/format";
import { pizzaPrepMinutes, pizzaRating } from "@/lib/pizza-display-meta";
import { api } from "@/lib/convex-api";
import {
  SIZE_KEYS,
  baseWithSize,
  preRestaurantUnitCents,
  type SizeKey,
} from "@/lib/pricing";
import { palette, radii } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";

export default function PizzaDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string }>();
  const { draft, setDraft, updateDraft } = useOrderDraft();
  const { isFavorite, toggleFavorite } = useFavorites();

  const pizzaId =
    typeof params.id === "string" && params.id.length > 0
      ? (params.id as Id<"pizzas">)
      : null;

  const pizza = useQuery(
    api.menu.getPizzaById,
    pizzaId !== null ? { id: pizzaId } : "skip",
  );

  const ingredients = useQuery(api.menu.listIngredients);

  const defaultSet = useMemo(
    () =>
      pizza
        ? new Set(pizza.defaultIngredientIds.map((x) => x))
        : new Set<string>(),
    [pizza],
  );

  const includedIngredients = useMemo(
    () =>
      ingredients?.filter((i) => defaultSet.has(i._id)) ?? [],
    [ingredients, defaultSet],
  );

  const optionalIngredients = useMemo(
    () =>
      ingredients?.filter((i) => !defaultSet.has(i._id)) ?? [],
    [ingredients, defaultSet],
  );

  useEffect(() => {
    if (!pizza) return;
    setDraft({
      pizzaId: pizza._id,
      pizzaName: pizza.name,
      basePriceCents: pizza.basePriceCents,
      imageUrl: pizza.imageUrl ?? null,
      defaultIngredientIds: pizza.defaultIngredientIds,
      sizeKey: "medium",
      quantity: 1,
      selectedExtraIngredientIds: [],
    });
  }, [pizza?._id, pizza?.basePriceCents, pizza?.name, setDraft]);

  const favorite = pizza ? isFavorite(pizza._id) : false;

  useEffect(() => {
    if (pizzaId === null) {
      Alert.alert("Missing pizza", "Go back and pick an item.");
    }
  }, [pizzaId]);

  if (pizzaId === null || pizza === undefined || ingredients === undefined) {
    return <LoadingScreen message="Loading pizza…" />;
  }

  if (pizza === null) {
    return (
      <View style={styles.fallback}>
        <Text>This pizza isn&apos;t available.</Text>
      </View>
    );
  }

  if (!draft || draft.pizzaId !== pizza._id) {
    return <LoadingScreen message="Preparing…" />;
  }

  const preRestaurantUnit = preRestaurantUnitCents({
    basePriceCents: pizza.basePriceCents,
    sizeKey: draft.sizeKey,
    extraIngredientIds: draft.selectedExtraIngredientIds,
    ingredients,
  });

  const subtotalCents = draft.quantity * preRestaurantUnit;

  const onSize = (sizeKey: SizeKey) => updateDraft({ sizeKey });

  const headerRight = pizza ? (
    <View style={styles.headerActions}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          favorite ? "Remove from favorites" : "Add to favorites"
        }
        onPress={() => void toggleFavorite(pizza._id)}
        hitSlop={10}
      >
        <Ionicons
          name={favorite ? "heart" : "heart-outline"}
          size={24}
          color={favorite ? "#fff" : "rgba(255,255,255,0.85)"}
        />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Share"
        onPress={() =>
          void Share.share({
            message: `${pizza.name} — ${pizza.description}`,
          })
        }
        hitSlop={10}
      >
        <Ionicons name="share-outline" size={24} color="#fff" />
      </Pressable>
    </View>
  ) : null;

  return (
    <View style={styles.root}>
      <ScreenRedHeader
        title={pizza.name}
        onBack={() => router.back()}
        right={headerRight}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollPad,
          { paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          {pizza.imageUrl ? (
            <Image
              source={{ uri: pizza.imageUrl }}
              style={styles.heroImg}
              contentFit="cover"
            />
          ) : (
            <View style={styles.heroPlaceholder}>
              <Ionicons name="pizza-outline" size={88} color={palette.primary} />
            </View>
          )}
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="star" size={14} color={palette.headerRed} />
          <Text style={styles.meta}>{pizzaRating(pizza.slug ?? pizza._id)}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Ionicons name="time-outline" size={14} color={palette.textSecondary} />
          <Text style={styles.meta}>
            {pizzaPrepMinutes(pizza.slug ?? pizza._id)} min
          </Text>
        </View>
        <Text style={styles.desc}>{pizza.description}</Text>

        <Text style={styles.sectionTitle}>Size</Text>
        <View style={styles.sizeRow}>
          {SIZE_KEYS.map((key) => (
            <SizeCard
              key={key}
              sizeKey={key}
              priceCents={baseWithSize(pizza.basePriceCents, key)}
              selected={draft.sizeKey === key}
              onSelect={() => onSize(key)}
            />
          ))}
        </View>

        {includedIngredients.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Included</Text>
            {includedIngredients.map((ing) => (
              <View key={ing._id} style={styles.includedRow}>
                <Text style={styles.includedName}>{ing.name}</Text>
                <Text style={styles.includedBadge}>Included</Text>
              </View>
            ))}
          </>
        ) : null}

        {optionalIngredients.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Add ingredients</Text>
            {optionalIngredients.map((ing) => {
              const selected = draft.selectedExtraIngredientIds.includes(
                ing._id,
              );
              return (
                <IngredientRow
                  key={ing._id}
                  name={ing.name}
                  detail="250 gm"
                  extraCents={ing.additionalPriceCents ?? 0}
                  selected={selected}
                  onToggle={() => {
                    const cur = draft.selectedExtraIngredientIds;
                    if (selected) {
                      updateDraft({
                        selectedExtraIngredientIds: cur.filter(
                          (x) => x !== ing._id,
                        ),
                      });
                    } else {
                      updateDraft({
                        selectedExtraIngredientIds: [...cur, ing._id],
                      });
                    }
                  }}
                />
              );
            })}
          </>
        ) : null}
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
          label={`Restaurant — ${formatUsd(subtotalCents)}`}
          onPress={() => router.push("/(tabs)/restaurant-select")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.cream },
  scroll: { flex: 1 },
  scrollPad: { paddingHorizontal: 18, paddingTop: 8 },
  hero: {
    borderRadius: radii.lg,
    overflow: "hidden",
    marginBottom: 16,
    backgroundColor: palette.primaryMuted,
  },
  heroImg: { width: "100%", height: 240 },
  heroPlaceholder: {
    height: 240,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 26,
    fontWeight: "800",
    color: palette.text,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    flexWrap: "wrap",
    gap: 6,
  },
  meta: { fontSize: 14, color: palette.textSecondary, fontWeight: "600" },
  metaDot: { color: palette.textSecondary },
  desc: {
    marginTop: 12,
    fontSize: 15,
    color: palette.textSecondary,
    lineHeight: 22,
  },
  sectionTitle: {
    marginTop: 22,
    marginBottom: 10,
    fontSize: 18,
    fontWeight: "800",
    color: palette.text,
  },
  sizeRow: { flexDirection: "row", gap: 10 },
  includedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: palette.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: 8,
  },
  includedName: { fontWeight: "700", color: palette.text },
  includedBadge: { fontWeight: "600", color: palette.headerRed, fontSize: 13 },
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
  headerActions: { flexDirection: "row", alignItems: "center", gap: 16 },
  fallback: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
});
