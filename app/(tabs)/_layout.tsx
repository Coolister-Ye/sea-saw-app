import React from "react";
import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Platform } from "react-native";
import { useDevice } from "@/hooks/useDevice";
import { DrawerHeader } from "@/components/navigation/Header";
import { useLocale } from "@/context/Locale";
import { useAuth } from "@/context/Auth";

export default function TabLayout() {
  const { i18n } = useLocale();
  const { isLargeScreen } = useDevice();
  const { isGroupX, isStaff } = useAuth();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {Platform.OS === "web" && <DrawerHeader title="Sea saw" />}
      <Drawer
        screenOptions={{
          headerShown: Platform.OS !== "web",
          drawerType: isLargeScreen ? "permanent" : "front",
          drawerStyle: { width: 280 },
        }}
      >
        <Drawer.Screen name="index" options={{ drawerLabel: i18n.t("Home") }} />
        <Drawer.Screen
          name="contract"
          options={{
            drawerLabel: i18n.t("contract"),
            drawerItemStyle: {
              display: isStaff() || isGroupX("Sale") ? "flex" : "none",
            },
          }}
        />
        <Drawer.Screen
          name="production"
          options={{
            drawerLabel: i18n.t("production"),
            drawerItemStyle: {
              display: isStaff() || isGroupX("Production") ? "flex" : "none",
            },
          }}
        />
        <Drawer.Screen
          name="contact"
          options={{
            drawerLabel: i18n.t("customer"),
            drawerItemStyle: {
              display: isStaff() || isGroupX("Sale") ? "flex" : "none",
            },
          }}
        />
        <Drawer.Screen
          name="company"
          options={{
            drawerLabel: i18n.t("company"),
            drawerItemStyle: {
              display: isStaff() || isGroupX("Sale") ? "flex" : "none",
            },
          }}
        />
        <Drawer.Screen
          name="playground"
          options={{
            drawerLabel: i18n.t("playground"),
            drawerItemStyle: {
              display: isStaff() ? "flex" : "none",
            },
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
