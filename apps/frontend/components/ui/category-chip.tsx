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
    paddingHorizontal: 20,
    minHeight: 38,
    paddingVertical: 9,
    borderRadius: radii.pill,
    backgroundColor: palette.chipInactive,
    borderWidth: 0,
    overflow: "hidden",
  },
  selected: {
    backgroundColor: palette.headerRed,
    borderColor: palette.headerRed,
  },
  pressed: { opacity: 0.9 },
  text: {
    fontWeight: "600",
    fontSize: 14,
    color: palette.chipInactiveText,
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
