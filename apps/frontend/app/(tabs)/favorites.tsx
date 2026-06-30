import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import type { PizzaListItem } from "@/components/ui/pizza-card";
import { PizzaCard } from "@/components/ui/pizza-card";
import { ScreenRedHeader } from "@/components/ui/screen-red-header";
import { useFavorites } from "@/components/favorites-context";
import LoadingScreen from "@/components/loading-screen";
import { api } from "@/lib/convex-api";
import { palette } from "@/theme";

export default function FavoritesScreen() {
  const router = useRouter();
  const { favoriteIds, loaded } = useFavorites();

  const pizzas = useQuery(
    api.menu.getPizzasByIds,
    loaded && favoriteIds.length > 0 ? { ids: favoriteIds } : "skip",
  );

  if (!loaded) {
    return <LoadingScreen message="Loading favorites…" />;
  }

  if (!pizzas) {
    return <LoadingScreen message="Loading pizzas…" />;
  }

  if (favoriteIds.length === 0 || pizzas.length === 0) {
    return (
      <View style={styles.root}>
        <ScreenRedHeader title="Favorites" onBack={() => router.back()} />
        <View style={styles.emptyWrap}>
          <Ionicons name="heart-outline" size={72} color={palette.textSecondary} />
          <Text style={styles.title}>No favorites yet</Text>
          <Text style={styles.sub}>
            Tap the heart on a pizza to save it here for quick ordering.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScreenRedHeader title="Favorites" onBack={() => router.back()} />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.pad}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {pizzas.map((p: PizzaListItem) => (
            <PizzaCard
              key={p._id}
              style={styles.cell}
              pizza={p}
              onPressCard={() =>
                router.push({
                  pathname: "/(tabs)/pizza/[id]",
                  params: { id: p._id },
                })
              }
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.cream },
  screen: { flex: 1, backgroundColor: palette.cream },
  pad: { padding: 16, paddingBottom: 40 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  cell: { width: "47%", flex: undefined, maxWidth: "48%" },
  emptyWrap: {
    flex: 1,
    backgroundColor: palette.cream,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  title: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: "800",
    color: palette.text,
  },
  sub: {
    marginTop: 8,
    textAlign: "center",
    color: palette.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
});
