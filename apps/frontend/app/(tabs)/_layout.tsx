import { Redirect, Tabs } from "expo-router";
import { useConvexAuth } from "convex/react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import LoadingScreen from "@/components/loading-screen";
import { TabBarIcon } from "@/components/ui/tab-bar-icon";
import { useCart } from "@/components/cart-context";
import { palette } from "@/theme";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { itemCount } = useCart();

  if (isLoading) {
    return <LoadingScreen message="Loading Pinnochio's Pizza…" />;
  }
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: palette.headerRed,
        tabBarInactiveTintColor: "#a8a8a8",
        tabBarShowLabel: false,
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 12,
          shadowOpacity: 0.08,
          shadowOffset: { width: 0, height: -2 },
          backgroundColor: "#fff",
          height: Platform.select({ web: 60, default: 56 + insets.bottom }),
          paddingTop: 8,
          paddingBottom: Platform.select({
            web: 8,
            default: Math.max(insets.bottom, 8),
          }),
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon
              name="home-outline"
              focusedName="home"
              focused={focused}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarBadge:
            itemCount > 0
              ? itemCount > 99
                ? "99+"
                : itemCount
              : undefined,
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon
              name="cart-outline"
              focusedName="cart"
              focused={focused}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon
              name="receipt-outline"
              focusedName="receipt"
              focused={focused}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="pizza/[id]"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="restaurant-select"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="checkout"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="order/[id]"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
