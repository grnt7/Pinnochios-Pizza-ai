import type { PressableProps, StyleProp, ViewStyle } from "react-native";
import { Pressable, StyleSheet, Text } from "react-native";

import { palette, radii, shadows } from "@/theme";

type Props = PressableProps & {
  label: string;
  style?: StyleProp<ViewStyle>;
};

export function BottomCtaButton({ label, style, ...rest }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.btn,
        shadows.fab,
        pressed && styles.pressed,
        style,
      ]}
      {...rest}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flex: 1,
    backgroundColor: palette.headerRed,
    paddingVertical: 16,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { opacity: 0.92 },
  label: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
});
