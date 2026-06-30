import { useClerk, useUser } from "@clerk/expo";
import Constants from "expo-constants";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenRedHeader } from "@/components/ui/screen-red-header";
import { palette, radii } from "@/theme";

function resolveAdminDashboardUrl(): string {
  const fromProcess =
    typeof process.env.EXPO_PUBLIC_ADMIN_URL === "string"
      ? process.env.EXPO_PUBLIC_ADMIN_URL
      : "";
  const extraRaw = Constants.expoConfig?.extra?.EXPO_PUBLIC_ADMIN_URL;
  const fromExtra = typeof extraRaw === "string" ? extraRaw : "";
  return (fromProcess || fromExtra).trim();
}

async function openAdminDashboard(adminUrl: string) {
  try {
    const can = await Linking.canOpenURL(adminUrl);
    if (!can) {
      Alert.alert(
        "Cannot open admin",
        "This device cannot open that URL. On a physical phone, try your computer’s LAN IP instead of localhost in EXPO_PUBLIC_ADMIN_URL.",
      );
      return;
    }
    await Linking.openURL(adminUrl);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Something went wrong";
    Alert.alert("Open failed", msg);
  }
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();

  const role =
    typeof user?.publicMetadata?.role === "string"
      ? user.publicMetadata.role
      : "";
  const isAdmin = role === "admin";
  const adminUrl = resolveAdminDashboardUrl();

  return (
    <View style={styles.root}>
      <ScreenRedHeader
        title="Account"
        onBack={() => router.back()}
      />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.pad}
      >
        <Text style={styles.label}>Signed in as</Text>
        <Text style={styles.email}>
          {user?.primaryEmailAddress?.emailAddress ?? user?.username ?? "Guest"}
        </Text>

        <Pressable
          style={styles.linkRow}
          accessibilityRole="button"
          onPress={() => router.push("/(tabs)/favorites")}
        >
          <Text style={styles.linkRowLabel}>Favorites</Text>
          <Text style={styles.linkRowHint}>Saved pizzas for quick reorder</Text>
        </Pressable>

        {isAdmin && adminUrl ? (
          <Pressable
            style={styles.kitchen}
            accessibilityRole="button"
            accessibilityLabel="Open kitchen admin dashboard"
            onPress={() => void openAdminDashboard(adminUrl)}
          >
            <Text style={styles.kitchenLabel}>Kitchen dashboard</Text>
            <Text style={styles.kitchenHint}>
              Opens the web admin for this shop
            </Text>
          </Pressable>
        ) : null}

        {isAdmin &&
        !adminUrl &&
        typeof __DEV__ !== "undefined" &&
        __DEV__ ? (
          <Text style={styles.devHint}>
            Set EXPO_PUBLIC_ADMIN_URL (e.g. http://localhost:3001) in
            apps/frontend/.env to show Kitchen dashboard here.
          </Text>
        ) : null}

        <Pressable
          style={[
            styles.out,
            ((isAdmin && adminUrl) ||
              (isAdmin && typeof __DEV__ !== "undefined" && __DEV__))
              ? styles.outSpaced
              : null,
          ]}
          accessibilityRole="button"
          onPress={() => void signOut()}
        >
          <Text style={styles.outLabel}>Sign out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.cream },
  screen: {
    flex: 1,
    backgroundColor: palette.cream,
  },
  pad: {
    padding: 22,
    paddingBottom: 40,
  },
  label: { color: palette.textSecondary, fontSize: 14 },
  email: {
    fontWeight: "600",
    marginTop: 4,
    marginBottom: 16,
    fontSize: 17,
    color: palette.text,
  },
  linkRow: {
    backgroundColor: palette.card,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    marginBottom: 14,
    gap: 4,
  },
  linkRowLabel: {
    fontWeight: "800",
    fontSize: 16,
    color: palette.text,
  },
  linkRowHint: {
    fontSize: 13,
    color: palette.textSecondary,
  },
  kitchen: {
    backgroundColor: palette.card,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: palette.headerRed,
    marginBottom: 14,
    gap: 4,
  },
  kitchenLabel: {
    fontWeight: "800",
    fontSize: 16,
    color: palette.headerRed,
  },
  kitchenHint: {
    fontSize: 13,
    color: palette.textSecondary,
  },
  devHint: {
    fontSize: 13,
    lineHeight: 18,
    color: palette.textSecondary,
    marginBottom: 14,
  },
  out: {
    backgroundColor: palette.card,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.borderStrong,
  },
  outSpaced: {
    marginTop: 4,
  },
  outLabel: { fontWeight: "700", fontSize: 16, color: "#b91c1c" },
});
