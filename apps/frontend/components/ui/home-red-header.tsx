import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SearchBar } from "@/components/ui/search-bar";
import { palette, radii } from "@/theme";

type Props = {
  search: string;
  onChangeSearch: (text: string) => void;
  onPressFilter: () => void;
  filterActive?: boolean;
};

export function HomeRedHeader({
  search,
  onChangeSearch,
  onPressFilter,
  filterActive,
}: Props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useUser();
  const avatarUri = user?.imageUrl ?? undefined;

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 6 }]}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Pinnochio&apos;s Pizza</Text>
        <Pressable
          onPress={() => router.push("/(tabs)/profile")}
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          style={styles.avatarBtn}
        >
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={20} color="#fff" />
            </View>
          )}
        </Pressable>
      </View>

      <View style={styles.searchRow}>
        <SearchBar
          variant="header"
          value={search}
          onChangeText={onChangeSearch}
          style={styles.searchFlex}
        />
        <Pressable
          onPress={onPressFilter}
          accessibilityRole="button"
          accessibilityLabel="Search and sort filters"
          style={[
            styles.filterCircle,
            filterActive && styles.filterCircleActive,
          ]}
        >
          <Ionicons
            name="options-outline"
            size={22}
            color={palette.headerRed}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: palette.headerRed,
    paddingHorizontal: 18,
    paddingBottom: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: Platform.OS === "ios" ? -0.3 : undefined,
  },
  avatarBtn: {
    borderRadius: 999,
    overflow: "hidden",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.35)",
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.35)",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchFlex: {
    flex: 1,
  },
  filterCircle: {
    width: 46,
    height: 46,
    borderRadius: radii.pill,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  filterCircleActive: {
    borderWidth: 2,
    borderColor: palette.primaryMuted,
  },
});
