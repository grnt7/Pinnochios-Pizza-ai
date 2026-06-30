import { useMutation, useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { MenuSearchFilterModal } from "@/components/menu-search-filter-modal";
import {
  DEFAULT_MENU_SEARCH_FILTERS,
  menuSearchFiltersAreActive,
  pizzaMatchesPricePreset,
  type MenuSearchFiltersState,
} from "@/components/menu-search-filters";
import LoadingScreen from "@/components/loading-screen";
import { CategoryChip } from "@/components/ui/category-chip";
import { HomeRedHeader } from "@/components/ui/home-red-header";
import type { PizzaListItem } from "@/components/ui/pizza-card";
import { PizzaCard } from "@/components/ui/pizza-card";
import { api } from "@/lib/convex-api";
import { palette } from "@/theme";

export default function HomeScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | "all">("all");
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [menuFilters, setMenuFilters] = useState<MenuSearchFiltersState>(
    DEFAULT_MENU_SEARCH_FILTERS,
  );

  const pizzas = useQuery(api.menu.listPizzas);
  const ingredients = useQuery(api.menu.listIngredients);
  const seedDemoMenu = useMutation(api.menu.seedDemoMenu);
  const bootstrapStore = useMutation(api.storeSettings.bootstrapMainIfNeeded);

  useEffect(() => {
    void bootstrapStore();
  }, [bootstrapStore]);

  useEffect(() => {
    if (pizzas === undefined) return;
    if (pizzas.length === 0) void seedDemoMenu();
  }, [pizzas, seedDemoMenu]);

  const categories = useMemo(() => {
    if (!pizzas) return [] as string[];
    const set = new Set(pizzas.map((p) => p.category));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [pizzas]);

  const ingredientNameLcById = useMemo(() => {
    const map = new Map<string, string>();
    if (!ingredients) return map;
    for (const ing of ingredients) {
      map.set(String(ing._id), ing.name.toLowerCase());
    }
    return map;
  }, [ingredients]);

  const recommendedOrder = useMemo(() => {
    const map = new Map<string, number>();
    if (!pizzas) return map;
    pizzas.forEach((p, idx) => {
      map.set(String(p._id), idx);
    });
    return map;
  }, [pizzas]);

  const filtered = useMemo(() => {
    if (!pizzas) return [];
    const q = search.trim().toLowerCase();
    const narrowed = pizzas.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (!pizzaMatchesPricePreset(p.basePriceCents, menuFilters.pricePreset)) {
        return false;
      }
      if (!q) return true;
      const nameLc = p.name.toLowerCase();
      const descLc = p.description.toLowerCase();
      if (nameLc.includes(q) || descLc.includes(q)) return true;
      if (!menuFilters.includeIngredientsInSearch) return false;
      for (const rawId of p.defaultIngredientIds) {
        const n = ingredientNameLcById.get(String(rawId));
        if (n?.includes(q)) return true;
      }
      return false;
    });

    const sort = menuFilters.sort;
    if (sort === "recommended") {
      return [...narrowed].sort(
        (a, b) =>
          (recommendedOrder.get(String(a._id)) ?? 0) -
          (recommendedOrder.get(String(b._id)) ?? 0),
      );
    }
    if (sort === "price_asc") {
      return [...narrowed].sort(
        (a, b) => a.basePriceCents - b.basePriceCents,
      );
    }
    if (sort === "price_desc") {
      return [...narrowed].sort(
        (a, b) => b.basePriceCents - a.basePriceCents,
      );
    }
    return [...narrowed].sort((a, b) => a.name.localeCompare(b.name));
  }, [
    pizzas,
    search,
    category,
    menuFilters,
    recommendedOrder,
    ingredientNameLcById,
  ]);

  if (pizzas === undefined) {
    return <LoadingScreen message="Loading menu…" />;
  }

  return (
    <View style={styles.screen}>
      <HomeRedHeader
        search={search}
        onChangeSearch={setSearch}
        onPressFilter={() => setFilterModalOpen(true)}
        filterActive={menuSearchFiltersAreActive(menuFilters)}
      />

      <MenuSearchFilterModal
        visible={filterModalOpen}
        value={menuFilters}
        onClose={() => setFilterModalOpen(false)}
        onApply={setMenuFilters}
      />

      <View style={styles.body}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={["all" as const, ...categories]}
          keyExtractor={(item) => item}
          style={styles.chipsRow}
          contentContainerStyle={styles.chipsInner}
          renderItem={({ item }) => (
            <CategoryChip
              label={item === "all" ? "All" : item}
              selected={
                item === "all" ? category === "all" : category === item
              }
              onPress={() => setCategory(item)}
            />
          )}
        />

        <FlatList<PizzaListItem>
          data={filtered}
          numColumns={2}
          keyExtractor={(item) => item._id}
          columnWrapperStyle={styles.rowGap}
          contentContainerStyle={styles.grid}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={() => {}} />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>No pizzas match your filters.</Text>
          }
          renderItem={({ item }) => (
            <PizzaCard
              style={styles.cell}
              pizza={item}
              onPressCard={() =>
                router.push({
                  pathname: "/(tabs)/pizza/[id]",
                  params: { id: item._id },
                })
              }
              onPressQuickAdd={() =>
                router.push({
                  pathname: "/(tabs)/pizza/[id]",
                  params: { id: item._id },
                })
              }
            />
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.cream },
  body: {
    flex: 1,
    backgroundColor: palette.cream,
  },
  chipsRow: { maxHeight: 56, flexGrow: 0, marginBottom: 4 },
  chipsInner: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 16,
    gap: 10,
  },
  grid: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 28,
    gap: 14,
    flexGrow: 1,
  },
  rowGap: { gap: 12 },
  cell: {
    flex: 1,
    marginHorizontal: 2,
    maxWidth: "50%",
  },
  empty: {
    textAlign: "center",
    color: palette.textSecondary,
    marginTop: 40,
    fontSize: 15,
    paddingHorizontal: 24,
  },
});
