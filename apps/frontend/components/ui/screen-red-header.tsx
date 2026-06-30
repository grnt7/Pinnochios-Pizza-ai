import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Platform, Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { palette } from "@/theme";

type Props = {
  title: string;
  right?: ReactNode;
  onBack?: () => void;
  style?: ViewStyle;
};

/**
 * Red top bar used on Cart, Orders, Profile — matches home hero band.
 */
export function ScreenRedHeader({ title, right, onBack, style }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 8 }, style]}>
      <View style={styles.row}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={styles.backBtn}
          >
            <Ionicons name="chevron-back" size={26} color="#fff" />
          </Pressable>
        ) : null}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: palette.headerRed,
    paddingHorizontal: 20,
    paddingBottom: 18,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minHeight: 40,
  },
  backBtn: {
    marginRight: 4,
    marginLeft: -6,
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: Platform.OS === "ios" ? -0.3 : undefined,
  },
  right: {
    flexShrink: 0,
  },
});
