import { Ionicons } from "@expo/vector-icons";
import type { StyleProp, ViewStyle } from "react-native";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { palette, radii } from "@/theme";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  /** `header` = white pill on red band, filter is external */
  variant?: "default" | "header";
  onPressFilter?: () => void;
  filterActive?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function SearchBar({
  value,
  onChangeText,
  placeholder = "Search your pizza here",
  variant = "default",
  onPressFilter,
  filterActive,
  style,
}: Props) {
  const isHeader = variant === "header";

  const filterInline =
    !isHeader && onPressFilter !== undefined ? (
      <Pressable
        onPress={onPressFilter}
        hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel="Search and sort filters"
        style={styles.filterTap}
      >
        <View>
          <Ionicons
            name="options-outline"
            size={22}
            color={filterActive ? palette.primary : palette.textSecondary}
          />
          {filterActive ? <View style={styles.filterDot} /> : null}
        </View>
      </Pressable>
    ) : !isHeader ? (
      <Ionicons name="options-outline" size={22} color={palette.textSecondary} />
    ) : null;

  return (
    <View
      style={[
        styles.wrap,
        isHeader && styles.wrapHeader,
        style,
      ]}
    >
      <Ionicons
        name="search-outline"
        size={22}
        color={isHeader ? "#9ca3af" : palette.textSecondary}
      />
      <TextInput
        style={[styles.input, isHeader && styles.inputHeader]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#a3a3a3"
        autoCorrect={false}
        autoCapitalize="none"
      />
      {filterInline}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: palette.card,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  wrapHeader: {
    borderWidth: 0,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: palette.text,
    paddingVertical: 6,
  },
  inputHeader: {
    fontSize: 15,
    paddingVertical: 4,
  },
  filterTap: {
    justifyContent: "center",
    alignItems: "center",
  },
  filterDot: {
    position: "absolute",
    top: -1,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.primary,
    borderWidth: 1.5,
    borderColor: palette.card,
  },
});
