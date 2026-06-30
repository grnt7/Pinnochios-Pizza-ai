import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import type { Doc } from "../../../../backend/convex/_generated/dataModel";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ScreenRedHeader } from "@/components/ui/screen-red-header";
import { formatUsd } from "@/lib/format";
import { api } from "@/lib/convex-api";
import { palette, radii, shadows } from "@/theme";

function statusChip(status: Doc<"orders">["status"]): string {
  switch (status) {
    case "received":
      return "Received";
    case "prep":
      return "Kitchen";
    case "out_for_delivery":
      return "On the way";
    case "delivered":
      return "Delivered";
    default:
      return "Cancelled";
  }
}

export default function OrdersScreen() {
  const router = useRouter();
  const mine = useQuery(api.orders.listMine);

  return (
    <View style={styles.root}>
      <ScreenRedHeader title="Orders" />
      <View style={styles.body}>
        {mine === undefined ? (
          <ActivityIndicator style={styles.loader} color={palette.headerRed} />
        ) : mine.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons
              name="receipt-outline"
              size={72}
              color={palette.textSecondary}
            />
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptySub}>
              Orders update live — they&apos;ll show up here as soon as you place
              one.
            </Text>
          </View>
        ) : (
          <FlatList
            style={{ flex: 1 }}
            contentContainerStyle={styles.list}
            data={mine}
            keyExtractor={(item: Doc<"orders">) => item._id}
            renderItem={({ item }: { item: Doc<"orders"> }) => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Open order ${item._id}`}
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/order/[id]",
                    params: { id: item._id },
                  })
                }
                style={({ pressed }) => [
                  styles.card,
                  shadows.card,
                  pressed && { opacity: 0.95 },
                ]}
              >
                <View style={styles.rowTop}>
                  <Text style={styles.badge}>{statusChip(item.status)}</Text>
                  <Text style={styles.total}>{formatUsd(item.totalCents)}</Text>
                </View>
                <Text style={styles.ids}>
                  {new Date(item.createdAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </Text>
                <Text style={styles.preview} numberOfLines={2}>
                  {item.lineItems
                    .map((l: Doc<"orders">["lineItems"][number]) =>
                      `${l.quantity}× ${l.pizzaNameSnapshot}`,
                    )
                    .join(", ")}
                </Text>
              </Pressable>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.cream },
  body: {
    flex: 1,
    backgroundColor: palette.cream,
    paddingHorizontal: 18,
  },
  loader: { marginTop: 48 },
  list: { gap: 12, paddingTop: 16, paddingBottom: 32 },
  card: {
    backgroundColor: palette.card,
    padding: 16,
    borderRadius: radii.lg,
    borderWidth: 0,
  },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    fontWeight: "700",
    color: palette.headerRed,
    fontSize: 15,
  },
  total: { fontWeight: "800", fontSize: 18 },
  ids: {
    marginTop: 6,
    color: palette.textSecondary,
    fontSize: 13,
  },
  preview: { marginTop: 8, color: palette.text, fontSize: 14 },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: "800",
    color: palette.text,
  },
  emptySub: {
    marginTop: 8,
    textAlign: "center",
    color: palette.textSecondary,
    lineHeight: 22,
  },
});
