import { Ionicons } from "@expo/vector-icons";
import type { Doc } from "../../../../backend/convex/_generated/dataModel";
import { Image } from "expo-image";
import {
  type StyleProp,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";

import { formatUsd } from "@/lib/format";
import { pizzaPrepMinutes, pizzaRating } from "@/lib/pizza-display-meta";
import { palette, radii, shadows } from "@/theme";

export type PizzaListItem = Doc<"pizzas"> & { imageUrl: string | null };

type Props = {
  pizza: PizzaListItem;
  onPressCard: () => void;
  onPressQuickAdd?: () => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * Card tap and quick-add are separate Pressables (siblings) so react-native-web
 * never renders a <button> inside a <button>.
 */
export function PizzaCard({ pizza, onPressCard, onPressQuickAdd, style }: Props) {
  const uri = pizza.imageUrl ?? undefined;
  const seed = pizza.slug || String(pizza._id);
  const prepMin = pizzaPrepMinutes(seed);
  const rating = pizzaRating(seed);

  return (
    <View style={[styles.card, shadows.card, style]}>
      <Pressable
        style={({ pressed }) => [
          styles.cardPressableArea,
          pressed && styles.cardPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${pizza.name}, ${formatUsd(pizza.basePriceCents)}`}
        onPress={onPressCard}
      >
        <Text style={styles.title} numberOfLines={2}>
          {pizza.name}
        </Text>
        <Text style={styles.price}>{formatUsd(pizza.basePriceCents)}</Text>

        <View style={styles.imageWrap}>
          {uri ? (
            <Image source={{ uri }} style={styles.image} contentFit="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="pizza-outline" size={40} color={palette.primary} />
            </View>
          )}
        </View>
      </Pressable>

      <View style={styles.footer}>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons
              name="time-outline"
              size={14}
              color={palette.textSecondary}
            />
            <Text style={styles.metaText}>{prepMin} min</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="star" size={13} color={palette.headerRed} />
            <Text style={styles.metaText}>{rating}</Text>
          </View>
        </View>
        {onPressQuickAdd ? (
          <Pressable
            style={styles.addBtn}
            accessibilityRole="button"
            accessibilityLabel={`Add ${pizza.name}`}
            onPress={onPressQuickAdd}
            hitSlop={6}
          >
            <Ionicons name="add" size={22} color="#fff" />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radii.lg,
    backgroundColor: palette.card,
    borderWidth: 0,
    padding: 12,
    minHeight: 200,
    maxWidth: "100%",
  },
  cardPressableArea: {
    flexGrow: 1,
  },
  cardPressed: { opacity: 0.96 },
  title: {
    fontWeight: "700",
    fontSize: 15,
    color: palette.text,
    minHeight: 40,
  },
  price: {
    marginTop: 4,
    fontWeight: "800",
    fontSize: 16,
    color: palette.headerRed,
  },
  imageWrap: {
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
  },
  image: {
    width: 118,
    height: 118,
    borderRadius: 59,
    backgroundColor: palette.primaryMuted,
  },
  imagePlaceholder: {
    width: 118,
    height: 118,
    borderRadius: 59,
    backgroundColor: palette.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: palette.textSecondary,
    fontWeight: "500",
  },
  addBtn: {
    backgroundColor: palette.headerRed,
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.fab,
  },
});
