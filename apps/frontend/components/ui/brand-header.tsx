import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Platform, StyleSheet, Text, View } from "react-native";

import { palette, shadows } from "@/theme";

const FONT_DISPLAY =
  Platform.select({
    ios: "Georgia",
    android: "serif",
    web: "Georgia",
    default: "Georgia",
  }) ?? "Georgia";

type Props = {
  /** Accessible label override (defaults to marketing name). */
  accessibilityLabel?: string;
};

/**
 * Homepage hero branding — emblem + wordmark aligned with coral delivery UI.
 */
export function BrandHeader({
  accessibilityLabel = "Pinnochio's Pizza, home menu",
}: Props) {
  return (
    <View
      style={styles.row}
      accessibilityRole="header"
      accessibilityLabel={accessibilityLabel}
    >
      <View style={[styles.logoMark, shadows.card]} accessibilityElementsHidden>
        <View style={styles.logoInner}>
          <MaterialCommunityIcons name="pizza" size={28} color="#fffbea" />
        </View>
      </View>
      <View style={styles.textBlock}>
        <Text style={styles.wordmark}>Pinnochio&apos;s Pizza</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 14,
    paddingTop: Platform.OS === "web" ? 4 : 0,
  },
  logoMark: {
    borderRadius: 16,
    backgroundColor: palette.primaryDark,
    borderWidth: 2,
    borderColor: palette.primaryMuted,
    overflow: "hidden",
  },
  logoInner: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },
  wordmark: {
    fontFamily: FONT_DISPLAY,
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: Platform.OS === "ios" ? -0.3 : undefined,
    color: palette.text,
    ...(Platform.OS === "web" ? { lineHeight: 28 as const } : {}),
  },
});