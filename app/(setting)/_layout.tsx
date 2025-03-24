import React from "react";
import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Platform } from "react-native";
import { useDevice } from "@/hooks/useDevice";
import { useLocale } from "@/context/Locale";

export default function AppLayout() {
  const { i18n } = useLocale();
  const { isLargeScreen } = useDevice();
  const isWeb = Platform.OS === "web";

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* {isWeb && <DrawerHeader title="Sea saw" />} */}
      <Drawer
        screenOptions={{
          headerShown: !isWeb,
          drawerType: isLargeScreen ? "permanent" : "front",
          drawerStyle: { width: 280 },
          drawerItemStyle: { borderRadius: 8 },
        }}
      >
        <Drawer.Screen
          name="password"
          options={{ drawerLabel: i18n.t("Password") }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
