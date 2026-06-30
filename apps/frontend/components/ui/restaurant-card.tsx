import { Pressable, StyleSheet, Text, View } from "react-native";

import { formatUsd } from "@/lib/format";
import type { MockRestaurant } from "@/lib/mock-restaurants";
import { palette, radii, shadows } from "@/theme";

type Props = {
  restaurant: MockRestaurant;
  totalCents: number;
  selected: boolean;
  onSelect: () => void;
};

export function RestaurantCard({
  restaurant,
  totalCents,
  selected,
  onSelect,
}: Props) {
  const feeLabel =
    restaurant.deliveryFeeCents === 0
      ? "Free delivery"
      : `${formatUsd(restaurant.deliveryFeeCents)} fee`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onSelect}
      style={({ pressed }) => [
        styles.card,
        shadows.card,
        selected && styles.cardSelected,
        pressed && { opacity: 0.97 },
      ]}
    >
      <View style={styles.logo}>
        <Text style={styles.logoText}>{restaurant.name.charAt(0)}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.name}>{restaurant.name}</Text>
        <Text style={styles.meta}>
          {feeLabel} · {restaurant.etaMinutes} min
        </Text>
        <Text style={styles.total}>{formatUsd(totalCents)}</Text>
      </View>
      <Text style={styles.rating}>★ {restaurant.rating.toFixed(1)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: radii.lg,
    backgroundColor: palette.card,
    borderWidth: 1.5,
    borderColor: palette.border,
    marginBottom: 12,
    gap: 12,
  },
  cardSelected: {
    borderColor: palette.headerRed,
    backgroundColor: palette.primaryMuted,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: palette.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: { fontWeight: "800", fontSize: 20, color: palette.headerRed },
  body: { flex: 1 },
  name: { fontWeight: "800", fontSize: 16, color: palette.text },
  meta: { marginTop: 4, fontSize: 13, color: palette.textSecondary },
  total: {
    marginTop: 8,
    fontWeight: "800",
    fontSize: 17,
    color: palette.headerRed,
  },
  rating: {
    fontSize: 14,
    fontWeight: "700",
    color: palette.textSecondary,
    alignSelf: "flex-end",
  },
});
