import * as React from "react";

import { useQuery } from "convex/react";
import type { Id } from "../../../../../backend/convex/_generated/dataModel";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import LoadingScreen from "@/components/loading-screen";
import { ScreenRedHeader } from "@/components/ui/screen-red-header";
import { useCart } from "@/components/cart-context";
import { formatUsd } from "@/lib/format";
import { api } from "@/lib/convex-api";
import { palette, radii } from "@/theme";

export default function CheckoutSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ session_id?: string | string[] }>();
  const sessionParam = params.session_id;
  const checkoutSessionId = Array.isArray(sessionParam)
    ? sessionParam[0]
    : sessionParam;

  const order = useQuery(
    api.orders.getMineByStripeCheckoutSessionId,
    checkoutSessionId
      ? { checkoutSessionId }
      : "skip",
  );

  const { clearCart } = useCart();

  React.useEffect(() => {
    if (order) {
      clearCart();
    }
  }, [clearCart, order]);

  function goToOrder(orderId: Id<"orders">) {
    router.replace({
      pathname: "/(tabs)/order/[id]",
      params: { id: String(orderId) },
    });
  }

  if (!checkoutSessionId) {
    return (
      <View style={styles.root}>
        <ScreenRedHeader title="Payment" onBack={() => router.back()} />
        <ScrollView contentContainerStyle={styles.pad}>
          <Text style={styles.title}>Missing payment reference</Text>
          <Text style={styles.body}>
            Your Convex{" "}
            <Text style={styles.mono}>STRIPE_CHECKOUT_SUCCESS_URL</Text> includes a query like{" "}
            <Text style={styles.mono}>{`session_id={CHECKOUT_SESSION_ID}`}</Text>.
          </Text>
          <PrimaryButton label="Back to checkout" onPress={() => router.replace("/(tabs)/checkout")} />
        </ScrollView>
      </View>
    );
  }

  if (order === undefined) {
    return <LoadingScreen message="Confirming Stripe payment…" />;
  }

  if (order === null) {
    return (
      <View style={styles.root}>
        <ScreenRedHeader title="Payment" onBack={() => router.back()} />
        <ScrollView contentContainerStyle={styles.pad}>
          <Text style={styles.title}>Still confirming</Text>
          <Text style={styles.body}>
            Your payment succeeded in Stripe — the kitchen ticket is usually created within a few seconds.
            Refresh this screen or open Orders.
          </Text>
          <PrimaryButton
            label="Open orders"
            onPress={() => router.replace("/(tabs)/orders")}
          />
          <GhostButton
            label="Reload"
            onPress={() =>
              router.replace(
                `/(tabs)/checkout/success?session_id=${encodeURIComponent(checkoutSessionId)}`,
              )
            }
          />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScreenRedHeader title="Payment" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.pad}>
        <Text style={styles.title}>Payment received</Text>
        <Text style={styles.body}>
          Total <Text style={styles.emph}>{formatUsd(order.totalCents)}</Text> paid.
          Tap below for full details — you can watch status from there.
        </Text>
        <PrimaryButton label="View order" onPress={() => goToOrder(order._id)} />
        <GhostButton label="Orders list" onPress={() => router.replace("/(tabs)/orders")} />
      </ScrollView>
    </View>
  );
}

function PrimaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      style={styles.primary}
      onPress={onPress}
    >
      <Text style={styles.primaryText}>{label}</Text>
    </Pressable>
  );
}

function GhostButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" style={styles.ghost} onPress={onPress}>
      <Text style={styles.ghostText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.cream },
  pad: {
    padding: 24,
    gap: 16,
    paddingBottom: 40,
    flexGrow: 1,
    justifyContent: "center",
  },
  title: { fontSize: 26, fontWeight: "800", color: palette.text },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: palette.textSecondary,
  },
  emph: { fontWeight: "800", color: palette.text },
  mono: {
    fontFamily: "monospace",
    fontWeight: "600",
    fontSize: 13,
    color: palette.headerRed,
  },
  primary: {
    marginTop: 8,
    alignItems: "center",
    backgroundColor: palette.headerRed,
    paddingVertical: 16,
    borderRadius: radii.md,
  },
  primaryText: { color: "#fff", fontWeight: "800", fontSize: 17 },
  ghost: {
    alignItems: "center",
    paddingVertical: 12,
  },
  ghostText: { fontWeight: "700", color: palette.headerRed, fontSize: 16 },
});
