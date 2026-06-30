import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { palette, radii } from "@/theme";

type Props = {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
};

export function QuantitySelector({
  quantity,
  onIncrement,
  onDecrement,
  min = 1,
}: Props) {
  const atMin = quantity <= min;
  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
        disabled={atMin}
        onPress={onDecrement}
        style={[styles.side, atMin && styles.sideDisabled]}
        hitSlop={8}
      >
        <Ionicons name="trash-outline" size={20} color={palette.text} />
      </Pressable>
      <Text style={styles.qty}>{quantity}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        onPress={onIncrement}
        style={styles.side}
        hitSlop={8}
      >
        <Ionicons name="add" size={22} color={palette.headerRed} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.card,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    paddingHorizontal: 4,
    paddingVertical: 4,
    gap: 4,
  },
  side: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  sideDisabled: { opacity: 0.35 },
  qty: {
    fontWeight: "800",
    fontSize: 17,
    minWidth: 28,
    textAlign: "center",
    color: palette.text,
  },
});
