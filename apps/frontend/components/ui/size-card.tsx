import { Pressable, StyleSheet, Text, View } from "react-native";

import { formatUsd } from "@/lib/format";
import { SIZE_META, type SizeKey } from "@/lib/pricing";
import { palette, radii } from "@/theme";

type Props = {
  sizeKey: SizeKey;
  /** Price for one unit at this size (base + proportional size only — caller computes). */
  priceCents: number;
  selected: boolean;
  onSelect: () => void;
};

export function SizeCard({ sizeKey, priceCents, selected, onSelect }: Props) {
  const meta = SIZE_META[sizeKey];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onSelect}
      style={[styles.wrap, selected && styles.wrapSelected]}
    >
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected ? <View style={styles.radioInner} /> : null}
      </View>
      <Text style={styles.dim}>{`${meta.subtitle} · ${meta.label}`}</Text>
      <Text style={styles.price}>{formatUsd(priceCents)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: palette.borderStrong,
    backgroundColor: palette.card,
    gap: 6,
  },
  wrapSelected: {
    borderColor: palette.headerRed,
    backgroundColor: palette.primaryMuted,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: palette.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: { borderColor: palette.headerRed },
  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: palette.headerRed,
  },
  dim: { fontSize: 12, color: palette.textSecondary, fontWeight: "600" },
  price: { fontSize: 15, fontWeight: "800", color: palette.text },
});
