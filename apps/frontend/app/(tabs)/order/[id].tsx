import { useMutation, useQuery } from "convex/react";
import type { Id } from "../../../../../backend/convex/_generated/dataModel";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import LoadingScreen from "@/components/loading-screen";
import { ScreenRedHeader } from "@/components/ui/screen-red-header";
import { formatUsd } from "@/lib/format";
import { api } from "@/lib/convex-api";
import { palette, radii } from "@/theme";

function statusChip(
  status: "received" | "prep" | "out_for_delivery" | "delivered" | "cancelled",
): string {
  switch (status) {
    case "received":
      return "Received";
    case "prep":
      return "Kitchen (preparing)";
    case "out_for_delivery":
      return "Out for delivery";
    case "delivered":
      return "Delivered";
    default:
      return "Cancelled";
  }
}

export default function OrderDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const orderId =
    typeof params.id === "string" && params.id.length > 0
      ? (params.id as Id<"orders">)
      : null;

  const order = useQuery(
    api.orders.getMineById,
    orderId ? { orderId } : "skip",
  );
  const cancelMine = useMutation(api.orders.cancelMine);

  if (orderId === null || order === undefined) {
    return <LoadingScreen message="Loading order…" />;
  }

  if (order === null) {
    return (
      <View style={styles.root}>
        <ScreenRedHeader title="Order" onBack={() => router.back()} />
        <View style={styles.fail}>
          <Text>Couldn&apos;t load this order.</Text>
        </View>
      </View>
    );
  }

  /** Narrowed doc for closures (nested `function` loses TS narrowing on `useQuery`). */
  const O = order;

  function confirmCancel(): void {
    Alert.alert(
      "Cancel this order?",
      O.paymentStatus === "paid"
        ? "Your card payment will be refunded automatically (usually a few days)."
        : "You can cancel while the restaurant hasn’t started your order.",
      [
        { text: "Keep order", style: "cancel" },
        {
          text: "Cancel order",
          style: "destructive",
          onPress: () => {
            void cancelMine({ orderId: O._id }).catch((err: unknown) => {
              Alert.alert(
                "Could not cancel",
                err instanceof Error ? err.message : "Try again shortly.",
              );
            });
          },
        },
      ],
    );
  }

  const canCustomerCancel = O.status === "received";

  return (
    <View style={styles.root}>
      <ScreenRedHeader title="Order" onBack={() => router.back()} />
      <ScrollView style={styles.screen} contentContainerStyle={styles.pad}>
        <Text style={styles.badge}>{statusChip(O.status)}</Text>
        <Text style={styles.total}>{formatUsd(O.totalCents)}</Text>
        {O.paymentStatus === "paid" ||
        O.paymentStatus === "refunded" ||
        O.paymentStatus === "refund_failed" ? (
          <Text style={styles.payMeta}>
            {O.paymentStatus === "paid"
              ? "Paid with card"
              : O.paymentStatus === "refunded"
                ? "Payment refunded"
                : "Refund issue — contact the store"}
          </Text>
        ) : null}
        <Text style={styles.meta}>
          Placed{" "}
          {new Date(O.createdAt).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </Text>
        {O.notes ? <Text style={styles.notes}>{O.notes}</Text> : null}

        {O.deliveryAddress ? (
          <>
            <Text style={styles.section}>Delivery address</Text>
            <View style={styles.addrCard}>
              <Text style={styles.addrLine}>{O.deliveryAddress.line1}</Text>
              {O.deliveryAddress.line2 ? (
                <Text style={styles.addrLine}>{O.deliveryAddress.line2}</Text>
              ) : null}
              <Text style={styles.addrLine}>
                {[O.deliveryAddress.city, O.deliveryAddress.region]
                  .filter(Boolean)
                  .join(", ")}
                {"  "}
                {O.deliveryAddress.postalCode}
              </Text>
              <Text style={styles.addrPhone}>{O.deliveryAddress.phone}</Text>
            </View>
          </>
        ) : null}

        <Text style={styles.section}>Items</Text>
        {O.lineItems.map((line, i) => (
          <View key={i} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{line.pizzaNameSnapshot}</Text>
              <Text style={styles.rowMeta}>
                {line.sizeLabel} · {formatUsd(line.unitFoodCents)} each
              </Text>
              <Text style={styles.rowExtra}>
                {line.extraIngredientIds.length > 0
                  ? `${line.extraIngredientIds.length} extras`
                  : ""}
              </Text>
            </View>
            <Text style={styles.qty}>×{line.quantity}</Text>
          </View>
        ))}

        {canCustomerCancel ? (
          <>
            <Text style={styles.cancelHint}>
              Need to cancel? You can do that here while the status is Received.
            </Text>
            <Pressable
              style={styles.cancelBtn}
              accessibilityRole="button"
              accessibilityLabel="Cancel order"
              onPress={confirmCancel}
            >
              <Text style={styles.cancelBtnLabel}>Cancel order</Text>
            </Pressable>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.cream },
  screen: { flex: 1, backgroundColor: palette.cream },
  pad: { padding: 22, gap: 14, paddingBottom: 44 },
  badge: {
    fontWeight: "800",
    color: palette.headerRed,
    fontSize: 17,
    textAlign: "center",
  },
  total: {
    fontSize: 32,
    fontWeight: "900",
    color: palette.text,
    textAlign: "center",
  },
  meta: { color: palette.textSecondary, textAlign: "center" },
  payMeta: {
    color: palette.textSecondary,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
  },
  cancelHint: {
    marginTop: 12,
    color: palette.textSecondary,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  cancelBtn: {
    marginTop: 8,
    alignSelf: "stretch",
    paddingVertical: 14,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: palette.headerRed,
    backgroundColor: palette.card,
    alignItems: "center",
  },
  cancelBtnLabel: {
    fontWeight: "800",
    color: palette.headerRed,
    fontSize: 16,
  },
  notes: {
    backgroundColor: palette.card,
    padding: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.border,
    color: palette.textSecondary,
    fontStyle: "italic",
  },
  section: { fontWeight: "800", fontSize: 18, marginTop: 8, color: palette.text },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    backgroundColor: palette.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 12,
  },
  rowTitle: { fontWeight: "700", fontSize: 16, color: palette.text },
  rowMeta: { marginTop: 4, color: palette.textSecondary, fontSize: 13 },
  rowExtra: { marginTop: 4, fontSize: 12, color: palette.textSecondary },
  qty: { fontWeight: "800", fontSize: 16, color: palette.text },
  fail: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  addrCard: {
    backgroundColor: palette.card,
    padding: 14,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 4,
  },
  addrLine: { fontSize: 15, color: palette.text, lineHeight: 22 },
  addrPhone: {
    marginTop: 8,
    fontWeight: "700",
    color: palette.headerRed,
    fontSize: 16,
  },
});
