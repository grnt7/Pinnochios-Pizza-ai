import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { useConvexAuth } from "convex/react";

import LoadingScreen from "@/components/loading-screen";
import { TabBarIcon } from "@/components/ui/tab-bar-icon";
import { useCart } from "@/components/cart-context";
import { palette } from "@/theme";

export default function TabsLayout() {
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
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 12,
          shadowOpacity: 0.08,
          shadowOffset: { width: 0, height: -2 },
          backgroundColor: "#fff",
          height: 68,
          paddingBottom: 10,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600", marginTop: 2 },
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
