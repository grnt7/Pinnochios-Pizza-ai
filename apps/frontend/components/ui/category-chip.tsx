import type { StyleProp, TextStyle, ViewStyle } from "react-native";
import { Platform, Pressable, StyleSheet, Text } from "react-native";

import { palette, radii } from "@/theme";

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function CategoryChip({
  label,
  selected,
  onPress,
  style,
  textStyle,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        selected && styles.selected,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        style={[styles.text, selected && styles.textSelected, textStyle]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 18,
    minHeight: 36,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    overflow: "hidden",
  },
  selected: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  pressed: { opacity: 0.9 },
  text: {
    fontWeight: "600",
    fontSize: 14,
    color: palette.text,
    textAlign: "center",
    lineHeight: 18,
    ...(Platform.OS === "android"
      ? {
          includeFontPadding: false as const,
          textAlignVertical: "center" as const,
        }
      : {}),
  },
  textSelected: { color: "#fff" },
});
