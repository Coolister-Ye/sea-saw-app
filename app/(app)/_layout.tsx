import { useMemo, useCallback } from "react";
import { Platform } from "react-native";
import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useDevice } from "@/hooks/useDevice";
import { useAuthStore, selectIsStaff } from "@/stores/authStore";
import { useLocaleStore, selectLocale } from "@/stores/localeStore";
import { CustomDrawerContent } from "@/components/sea-saw-design/drawer/DrawerContent";
import { DrawerFooter } from "@/components/sea-saw-design/drawer/DrawerFoot";
import { DrawerHeader } from "@/components/sea-saw-design/header";
import i18n from "@/locale/i18n";

type ScreenConfig = {
  name: string;
  label: string;
  groups?: string[];
  staffOnly?: boolean;
};

const SCREEN_CONFIGS: ScreenConfig[] = [
  { name: "index", label: "Home" },
  { name: "(crm)/contact", label: "customer", groups: ["Sale"] },
  { name: "(crm)/company", label: "company", groups: ["Sale"] },
  { name: "(crm)/order", label: "order", groups: ["Sale"] },
  { name: "(crm)/production", label: "production", groups: ["Production"] },
  { name: "(crm)/pipeline", label: "pipeline", groups: ["Sale"] },
  { name: "(crm)/download", label: "download" },
  { name: "(setting)/profile", label: "profile" },
  { name: "(setting)/profile-edit", label: "profile_edit" },
  { name: "(setting)/password", label: "password" },
  { name: "(playground)/playground", label: "playground", staffOnly: true },
  { name: "(playground)/example", label: "playground", staffOnly: true },
  {
    name: "(playground)/hoverCardExample",
    label: "playground",
    staffOnly: true,
  },
];

export default function AppLayout() {
  const isGroupX = useAuthStore((state) => state.isGroupX);
  const isStaff = useAuthStore(selectIsStaff);
  const locale = useLocaleStore(selectLocale); // Subscribe to locale changes
  const { isLargeScreen } = useDevice();
  const isWeb = Platform.OS === "web";

  const parentTitleMap = useMemo(
    () => ({
      "(playground)": i18n.t("playground"),
      "(crm)": i18n.t("crm"),
      "(setting)": i18n.t("setting"),
    }),
    [locale],
  );

  const getDrawerItemStyle = useCallback(
    (config: ScreenConfig) => {
      const { groups, staffOnly } = config;

      if (!groups && !staffOnly) return undefined;

      const isVisible = staffOnly
        ? isStaff
        : isStaff || (groups?.some(isGroupX) ?? false);

      return { display: (isVisible ? "flex" : "none") as "flex" | "none" };
    },
    [isStaff, isGroupX],
  );

  const drawerContent = useCallback(
    (props: any) => (
      <CustomDrawerContent
        parentTitleMap={parentTitleMap}
        footer={<DrawerFooter />}
        {...props}
      />
    ),
    [parentTitleMap],
  );

  const screenOptions = useMemo(
    () => ({
      headerShown: Platform.OS !== "web",
      drawerType: (isLargeScreen ? "permanent" : "front") as
        | "permanent"
        | "front",
      drawerStyle: { width: 280 },
      drawerItemStyle: { borderRadius: 8 },
    }),
    [isLargeScreen],
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {isWeb && <DrawerHeader title="Sea saw" />}
      <Drawer
        key={locale}
        screenOptions={screenOptions}
        drawerContent={drawerContent}
      >
        {SCREEN_CONFIGS.map((config) => (
          <Drawer.Screen
            key={config.name}
            name={config.name}
            options={{
              drawerLabel: i18n.t(config.label),
              drawerItemStyle: getDrawerItemStyle(config),
            }}
          />
        ))}
      </Drawer>
    </GestureHandlerRootView>
  );
}
