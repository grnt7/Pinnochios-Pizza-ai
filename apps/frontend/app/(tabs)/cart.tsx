import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useCart } from "@/components/cart-context";
import { ScreenRedHeader } from "@/components/ui/screen-red-header";
import { formatUsd } from "@/lib/format";
import { palette, radii, shadows } from "@/theme";

export default function CartScreen() {
  const router = useRouter();
  const {
    lines,
    increment,
    decrement,
    removeLine,
    clearCart,
    totalCents,
    itemCount,
  } = useCart();

  function checkoutStub() {
    router.push("/(tabs)/checkout");
  }

  return (
    <View style={styles.root}>
      <ScreenRedHeader
        title="Cart"
        right={
          lines.length > 0 ? (
            <Pressable accessibilityRole="button" onPress={clearCart}>
              <Text style={styles.clearHeader}>Clear</Text>
            </Pressable>
          ) : null
        }
      />
      <ScrollView style={styles.screen} contentContainerStyle={styles.pad}>
      {lines.length === 0 ? (
        <Text style={styles.empty}>Your cart is empty.</Text>
      ) : (
        <>
          {lines.map((l) => {
            const deliveryNote =
              l.deliveryFeeCents > 0
                ? ` · +${formatUsd(l.deliveryFeeCents)} delivery`
                : " · delivery included";
            return (
              <View key={l.lineKey} style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.lineTitle}>{l.name}</Text>
                  <Text style={styles.meta}>
                    {l.sizeLabel}
                    {" · "}
                    {l.restaurantName}
                  </Text>
                  <Text style={styles.linePrice}>
                    {formatUsd(l.priceCents)} each
                    {deliveryNote}
                  </Text>
                </View>

                <View style={styles.qty}>
                  <Pressable
                    style={styles.qtyBtn}
                    accessibilityRole="button"
                    accessibilityLabel={`Decrease ${l.name}`}
                    onPress={() => decrement(l.lineKey)}
                    hitSlop={8}
                  >
                    <Ionicons name="remove" size={20} />
                  </Pressable>
                  <Text style={styles.qtyVal}>{l.quantity}</Text>
                  <Pressable
                    style={styles.qtyBtn}
                    accessibilityRole="button"
                    accessibilityLabel={`Increase ${l.name}`}
                    onPress={() => increment(l.lineKey)}
                    hitSlop={8}
                  >
                    <Ionicons name="add" size={20} />
                  </Pressable>
                </View>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => removeLine(l.lineKey)}
                  hitSlop={{ top: 12, bottom: 12, left: 12 }}
                >
                  <Ionicons
                    name="trash-outline"
                    size={22}
                    color={palette.primary}
                  />
                </Pressable>
              </View>
            );
          })}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatUsd(totalCents)}</Text>
          </View>

          <Pressable
            style={[styles.checkout, lines.length === 0 && styles.disabled]}
            accessibilityRole="button"
            disabled={lines.length === 0}
            onPress={() => checkoutStub()}
          >
            <Text style={styles.checkoutLabel}>{`Go to checkout · ${itemCount} ${itemCount === 1 ? "item" : "items"}`}</Text>
          </Pressable>
        </>
      )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.cream },
  screen: { flex: 1, backgroundColor: palette.cream },
  pad: { padding: 18, paddingBottom: 40 },
  clearHeader: { fontSize: 15, fontWeight: "700", color: "#fff" },
  empty: {
    color: palette.textSecondary,
    textAlign: "center",
    marginTop: 48,
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: radii.lg,
    padding: 14,
    backgroundColor: palette.card,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: palette.border,
    ...shadows.card,
  },
  lineTitle: { fontWeight: "700", fontSize: 16, color: palette.text },
  meta: { marginTop: 2, fontSize: 13, color: palette.textSecondary },
  linePrice: { marginTop: 4, fontSize: 13, color: palette.textSecondary },
  qty: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: palette.borderStrong,
    borderRadius: 999,
  },
  qtyBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  qtyVal: { paddingHorizontal: 4, fontWeight: "700", minWidth: 24, textAlign: "center" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 20,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.borderStrong,
  },
  totalLabel: { fontWeight: "600", color: palette.textSecondary },
  totalValue: { fontWeight: "800", fontSize: 18, color: palette.text },
  checkout: {
    backgroundColor: palette.headerRed,
    paddingVertical: 16,
    borderRadius: radii.md,
    alignItems: "center",
  },
  disabled: { opacity: 0.55 },
  checkoutLabel: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 17,
  },
});
