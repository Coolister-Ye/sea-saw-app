import { useMemo, useCallback, useState } from "react";
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

const DRAWER_WIDTH = 280;
const DRAWER_COLLAPSED_WIDTH = 80;

type ScreenConfig = {
  name: string;
  label: string;
  groups?: string[];
  staffOnly?: boolean;
};

const SCREEN_CONFIGS: ScreenConfig[] = [
  { name: "index", label: "Home" },
  { name: "(crm)/contact", label: "contact", groups: ["Sale"] },
  { name: "(crm)/account", label: "account", groups: ["Sale"] },
  { name: "(sales)/order", label: "order", groups: ["Sale"] },
  {
    name: "(production)/production",
    label: "production",
    groups: ["Production"],
  },
  { name: "(pipeline)/pipeline", label: "pipeline", groups: ["Sale"] },
  { name: "(download)/download", label: "download" },
  { name: "(setting)/profile", label: "profile" },
  { name: "(setting)/profile-edit", label: "profile_edit" },
  { name: "(setting)/password", label: "password" },
  { name: "(playground)/playground", label: "playground", staffOnly: true },
  { name: "(playground)/example", label: "playground", staffOnly: true },
];

export default function AppLayout() {
  const isGroupX = useAuthStore((state) => state.isGroupX);
  const isStaff = useAuthStore(selectIsStaff);
  const locale = useLocaleStore(selectLocale); // Subscribe to locale changes
  const { isLargeScreen } = useDevice();
  const isWeb = Platform.OS === "web";
  const [collapsed, setCollapsed] = useState(false);

  const parentTitleMap = useMemo(
    () => ({
      "(playground)": i18n.t("playground"),
      "(crm)": i18n.t("crm"),
      "(sales)": i18n.t("sales"),
      "(download)": i18n.t("download"),
      "(pipeline)": i18n.t("pipeline"),
      "(production)": i18n.t("production"),
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
        footer={<DrawerFooter collapsed={collapsed} />}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        {...props}
      />
    ),
    [parentTitleMap, collapsed],
  );

  const screenOptions = useMemo(
    () => ({
      headerShown: Platform.OS !== "web",
      drawerType: (isLargeScreen ? "permanent" : "front") as
        | "permanent"
        | "front",
      drawerStyle: {
        width: isWeb
          ? collapsed
            ? DRAWER_COLLAPSED_WIDTH
            : DRAWER_WIDTH
          : DRAWER_WIDTH,
        overflow: "visible" as const,
      },
      drawerItemStyle: { borderRadius: 8 },
    }),
    [isLargeScreen, isWeb, collapsed],
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
