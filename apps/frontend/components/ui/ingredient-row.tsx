import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { formatUsd } from "@/lib/format";
import { palette, radii } from "@/theme";

type Props = {
  name: string;
  /** Optional display e.g. weight — mock uses "250 gm" */
  detail?: string;
  extraCents?: number;
  selected: boolean;
  disabled?: boolean;
  onToggle: () => void;
};

export function IngredientRow({
  name,
  detail = "Add-on",
  extraCents = 0,
  selected,
  disabled,
  onToggle,
}: Props) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected, disabled: !!disabled }}
      onPress={disabled ? undefined : onToggle}
      style={[styles.row, disabled && styles.rowDisabled]}
    >
      <View style={styles.thumb}>
        <Ionicons name="leaf-outline" size={22} color={palette.headerRed} />
      </View>
      <View style={styles.mid}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.detail}>{detail}</Text>
      </View>
      <Text style={styles.price}>
        {extraCents > 0 ? `+${formatUsd(extraCents)}` : "Included"}
      </Text>
      <View style={[styles.box, selected && styles.boxOn, disabled && styles.boxDisabled]}>
        {selected ? (
          <Ionicons name="checkmark" size={18} color="#fff" />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: 10,
    gap: 10,
  },
  rowDisabled: { opacity: 0.65 },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: palette.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  mid: { flex: 1 },
  name: { fontWeight: "700", fontSize: 15, color: palette.text },
  detail: { marginTop: 2, fontSize: 12, color: palette.textSecondary },
  price: { fontWeight: "700", fontSize: 14, color: palette.text, marginRight: 4 },
  box: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: palette.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.card,
  },
  boxOn: {
    backgroundColor: palette.headerRed,
    borderColor: palette.headerRed,
  },
  boxDisabled: { opacity: 0.5 },
});
