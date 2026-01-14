import React from "react";
import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Platform } from "react-native";
import { useDevice } from "@/hooks/useDevice";
import { useLocale } from "@/context/Locale";
import { useAuth } from "@/context/Auth";
import CustomDrawerContent from "@/components/sea-saw-design/drawer/DrawerContent";
import DrawerFooter from "@/components/sea-saw-design/drawer/DrawerFoot";

export default function AppLayout() {
  const { i18n } = useLocale();
  const { isGroupX, isStaff } = useAuth();
  const { isLargeScreen } = useDevice();
  const isWeb = Platform.OS === "web";

  // 统一管理 Parent Title 映射
  const parentTitleMap = {
    "(playground)": i18n.t("playground"),
  };

  // 统一管理权限控制
  const getDrawerVisibility = (groups: string[]) =>
    isStaff || groups.some(isGroupX) ? "flex" : "none";

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
        drawerContent={(props) => (
          <CustomDrawerContent
            parentTitleMap={parentTitleMap}
            footer={<DrawerFooter />}
            {...props}
          />
        )}
      >
        <Drawer.Screen name="index" options={{ drawerLabel: i18n.t("Home") }} />

        {[
          { name: "contact", label: "customer", groups: ["Sale"] },
          { name: "company", label: "company", groups: ["Sale"] },
        ].map(({ name, label, groups }) => (
          <Drawer.Screen
            key={name}
            name={name}
            options={{
              drawerLabel: i18n.t(label),
              drawerItemStyle: {
                display: getDrawerVisibility(groups),
                borderRadius: 8,
              },
            }}
          />
        ))}

        <Drawer.Screen
          name="production"
          options={{
            drawerLabel: i18n.t("production"),
            drawerItemStyle: {
              display: getDrawerVisibility(["Production"]),
              borderRadius: 8,
            },
          }}
        />

        <Drawer.Screen
          name="pipeline"
          options={{
            drawerLabel: i18n.t("pipeline"),
            drawerItemStyle: {
              display: getDrawerVisibility(["Sale"]),
              borderRadius: 8,
            },
          }}
        />

        <Drawer.Screen
          name="download"
          options={{ drawerLabel: i18n.t("download") }}
        />

        {[
          "(playground)/playground",
          "(playground)/example",
          "(playground)/hoverCardExample",
        ].map((name) => (
          <Drawer.Screen
            key={name}
            name={name}
            options={{
              drawerLabel: i18n.t("playground"),
              drawerItemStyle: {
                display: isStaff ? "flex" : "none",
                borderRadius: 8,
              },
            }}
          />
        ))}
      </Drawer>
    </GestureHandlerRootView>
  );
}
