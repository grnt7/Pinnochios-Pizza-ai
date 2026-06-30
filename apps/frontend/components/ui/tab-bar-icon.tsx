import type { ComponentProps } from "react";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

import { palette } from "@/theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

type Props = {
  name: IconName;
  focusedName?: IconName;
  focused: boolean;
  color: string;
  size: number;
};

export function TabBarIcon({
  name,
  focusedName,
  focused,
  color,
  size,
}: Props) {
  const iconName = focused && focusedName ? focusedName : name;

  if (focused) {
    return (
      <View style={styles.pill}>
        <Ionicons name={iconName} size={size} color="#fff" />
      </View>
    );
  }

  return <Ionicons name={iconName} size={size} color={color} />;
}

const styles = StyleSheet.create({
  pill: {
    backgroundColor: palette.headerRed,
    paddingHorizontal: 22,
    paddingVertical: 8,
    borderRadius: 999,
    minWidth: 56,
    alignItems: "center",
    justifyContent: "center",
  },
});
