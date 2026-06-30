import * as React from "react";

import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useMutation, useAction } from "convex/react";
import { useRouter } from "expo-router";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  CheckoutNativeCardPay,
  type CheckoutConvexCartPayload,
} from "@/components/checkout-native-card-pay";
import { ScreenRedHeader } from "@/components/ui/screen-red-header";
import { useCart } from "@/components/cart-context";
import { formatUsd } from "@/lib/format";
import { api } from "@/lib/convex-api";
import { palette, radii } from "@/theme";

function phoneDigitsOk(phone: string): boolean {
  return phone.replace(/\D/g, "").length >= 10;
}


export default function CheckoutScreen() {
  const router = useRouter();
  const { lines, totalCents, clearCart } = useCart();
  const [notes, setNotes] = React.useState("");
  const [line1, setLine1] = React.useState("");
  const [line2, setLine2] = React.useState("");
  const [city, setCity] = React.useState("");
  const [region, setRegion] = React.useState("");
  const [postalCode, setPostalCode] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const placeOrder = useMutation(api.orders.placeOrder);
  const createCheckoutSession = useAction(
    api.stripeCheckout.createCheckoutSessionForWeb,
  );

  const [submittingStripe, setSubmittingStripe] = React.useState(false);
  const [submittingManual, setSubmittingManual] = React.useState(false);

  const stripePk = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
  const canNativeStripe = stripePk.trim().length > 0;

  function buildCartPayload(): CheckoutConvexCartPayload {
    return {
      notes: notes.trim() || undefined,
      deliveryAddress: {
        line1: line1.trim(),
        line2: line2.trim() || undefined,
        city: city.trim(),
        region: region.trim(),
        postalCode: postalCode.trim(),
        phone: phone.trim(),
      },
      lines: lines.map((l) => ({
        pizzaId: l.pizzaId,
        name: l.name,
        quantity: l.quantity,
        foodUnitPriceCents: l.priceCents,
        deliveryFeeCents: l.deliveryFeeCents,
        sizeKey: l.sizeKey,
        sizeLabel: l.sizeLabel,
        restaurantIdSnapshot: l.restaurantId,
        restaurantNameSnapshot: l.restaurantName,
        extraIngredientIds: l.extraIngredientIds,
      })),
    };
  }

  const deliveryComplete = React.useMemo(() => {
    return (
      line1.trim().length >= 3 &&
      city.trim().length >= 2 &&
      region.trim().length >= 2 &&
      postalCode.trim().length >= 3 &&
      phoneDigitsOk(phone)
    );
  }, [city, line1, phone, postalCode, region]);

  if (lines.length === 0) {
    return (
      <View style={styles.root}>
        <ScreenRedHeader title="Checkout" onBack={() => router.back()} />
        <ScrollView contentContainerStyle={styles.emptyPad}>
          <Text style={styles.emptySub}>
            Your cart is empty. Add pizzas from the menu, then review here before
            you place your order.
          </Text>
          <Pressable
            accessibilityRole="button"
            style={styles.secondary}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.secondaryText}>Browse menu</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            style={styles.ghostBtn}
            onPress={() => router.replace("/(tabs)/cart")}
          >
            <Text style={styles.ghostText}>View cart</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  async function onPayWebStripe() {
    if (lines.length === 0 || !deliveryComplete || Platform.OS !== "web") {
      return;
    }
    if (typeof window === "undefined") return;
    setSubmittingStripe(true);
    try {
      const payload = buildCartPayload();
      const { url } = await createCheckoutSession(payload);
      window.location.assign(url);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Could not start checkout";
      Alert.alert("Checkout failed", msg);
    } finally {
      setSubmittingStripe(false);
    }
  }

  async function onManualPlaceOrder() {
    if (lines.length === 0 || !deliveryComplete) return;
    setSubmittingManual(true);
    try {
      const payload = buildCartPayload();
      await placeOrder(payload);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      clearCart();
      Alert.alert("Order placed", "Track progress under Orders.");
      router.replace("/(tabs)/orders");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Could not place order";
      Alert.alert("Order failed", msg);
    } finally {
      setSubmittingManual(false);
    }
  }

  const canSubmitBase = deliveryComplete && lines.length > 0;

  const webPayBusy = submittingStripe;
  const webCanPayStripe = canSubmitBase && !webPayBusy;
  const nativeManualBusy = submittingManual;
  const manualCanTap = canSubmitBase && !nativeManualBusy && !submittingStripe;

  return (
    <View style={styles.root}>
      <ScreenRedHeader title="Checkout" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.pad}>
        <Text style={styles.sub}>
          {Platform.OS === "web"
            ? "Secure payment with Stripe Checkout in your browser."
            : canNativeStripe
              ? "Pay with Apple Pay / Google Pay or your card via Stripe."
              : "Add EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY for in-app Stripe payments."}
        </Text>

        <Text style={styles.section}>Delivery address</Text>
        <Text style={styles.hint}>Required so we know where to bring your order.</Text>

        <Text style={styles.label}>Street address</Text>
        <TextInput
          style={styles.field}
          placeholder="Street and number"
          value={line1}
          onChangeText={setLine1}
          autoComplete="street-address"
        />

        <Text style={styles.label}>Apartment, suite (optional)</Text>
        <TextInput
          style={styles.field}
          placeholder="Apt / floor / buzzer code"
          value={line2}
          onChangeText={setLine2}
        />

        <Text style={styles.label}>City</Text>
        <TextInput
          style={styles.field}
          placeholder="City"
          value={city}
          onChangeText={setCity}
        />

        <Text style={styles.label}>State / province</Text>
        <TextInput
          style={styles.field}
          placeholder="NY, ON…"
          value={region}
          onChangeText={setRegion}
        />

        <Text style={styles.label}>ZIP / postal code</Text>
        <TextInput
          style={styles.field}
          placeholder="Postal code"
          value={postalCode}
          onChangeText={setPostalCode}
          autoCapitalize="characters"
        />

        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={styles.field}
          placeholder="Mobile number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          autoComplete="tel"
        />

        <Text style={styles.section}>Order notes</Text>
        <TextInput
          style={styles.input}
          placeholder="Allergies, door code, napkins…"
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <View style={styles.summary}>
          <Text style={styles.summaryLabel}>Total</Text>
          <Text style={styles.summaryAmt}>{formatUsd(totalCents)}</Text>
        </View>

        {Platform.OS === "web" ? (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !webCanPayStripe }}
            disabled={!webCanPayStripe}
            style={[styles.primary, !webCanPayStripe && styles.primaryDisabled]}
            onPress={() => void onPayWebStripe()}
          >
            <Ionicons name="card-outline" size={22} color="#fff" />
            <Text style={styles.primaryText}>
              {webPayBusy ? "Redirecting…" : "Pay with card"}
            </Text>
          </Pressable>
        ) : (
          <>
            <CheckoutNativeCardPay
              cart={buildCartPayload()}
              disabled={!canSubmitBase || !canNativeStripe}
              onPaid={(result: { orderId: string; totalCents: number }) => {
                clearCart();
                Alert.alert(
                  "Order placed",
                  "Thanks! You can track it under Orders.",
                );
                router.replace({
                  pathname: "/(tabs)/order/[id]",
                  params: { id: result.orderId },
                });
              }}
            />
            {!canNativeStripe && (
              <Text style={styles.warn}>
                Set EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY in apps/frontend/.env and rebuild the dev client to enable Stripe.
              </Text>
            )}
          </>
        )}

        {((typeof __DEV__ !== "undefined" && __DEV__) ||
          Platform.OS === "web") && (
          <>
            <Text style={styles.altLabel}>
              Older flow (pay at delivery) — Convex may disable this when ALLOW_UNPAID_ORDERS is false.
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !manualCanTap }}
              disabled={!manualCanTap}
              style={[styles.secondaryOutline, !manualCanTap && styles.primaryDisabled]}
              onPress={() => void onManualPlaceOrder()}
            >
              <Text style={styles.secondaryOutlineText}>
                {nativeManualBusy ? "Placing…" : "Place order without prepaid card"}
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.cream },
  pad: { padding: 20, gap: 6, paddingBottom: 36 },
  emptyPad: {
    padding: 24,
    gap: 16,
    paddingBottom: 40,
    flexGrow: 1,
    justifyContent: "center",
  },
  emptySub: {
    fontSize: 16,
    lineHeight: 22,
    color: palette.textSecondary,
  },
  title: { fontSize: 26, fontWeight: "800", color: palette.text },
  sub: {
    color: palette.textSecondary,
    fontSize: 15,
    marginBottom: 12,
    lineHeight: 21,
  },
  section: { marginTop: 18, marginBottom: 4, fontWeight: "800", color: palette.text, fontSize: 17 },
  hint: { fontSize: 13, color: palette.textSecondary, marginBottom: 8 },
  label: { marginTop: 10, marginBottom: 4, fontWeight: "700", color: palette.text },
  field: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.md,
    padding: 14,
    backgroundColor: palette.card,
    fontSize: 16,
  },
  input: {
    marginTop: 4,
    minHeight: 100,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.md,
    padding: 14,
    backgroundColor: palette.card,
    textAlignVertical: "top",
  },
  summary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 18,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: palette.borderStrong,
  },
  summaryLabel: { fontWeight: "700", color: palette.text },
  summaryAmt: { fontWeight: "900", fontSize: 22, color: palette.headerRed },
  primary: {
    marginTop: 16,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.headerRed,
    paddingVertical: 16,
    borderRadius: radii.md,
  },
  primaryDisabled: { opacity: 0.65 },
  primaryText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 17,
  },
  secondary: {
    alignItems: "center",
    backgroundColor: palette.headerRed,
    paddingVertical: 16,
    borderRadius: radii.md,
  },
  secondaryText: { color: "#fff", fontWeight: "800", fontSize: 17 },
  ghostBtn: { alignItems: "center", paddingVertical: 12 },
  ghostText: { fontWeight: "700", color: palette.headerRed, fontSize: 16 },
  warn: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 18,
    color: palette.textSecondary,
  },
  altLabel: {
    marginTop: 20,
    fontSize: 13,
    color: palette.textSecondary,
    lineHeight: 18,
  },
  secondaryOutline: {
    marginTop: 10,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    backgroundColor: palette.card,
  },
  secondaryOutlineText: {
    fontWeight: "700",
    color: palette.text,
    fontSize: 16,
  },
});
