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
import { useParentIconMap } from "@/hooks/useParentIconMap";

const DRAWER_WIDTH = 280;
const DRAWER_COLLAPSED_WIDTH = 56;

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
  { name: "(crm)/bank-account", label: "bank_account", groups: ["Sale", "Purchase"] },
  { name: "(sales)/order", label: "order", groups: ["Sale"] },
  {
    name: "(procurement)/purchase-order",
    label: "purchase_order",
    groups: ["Purchase"],
  },
  {
    name: "(warehouse)/outbound-order",
    label: "outbound_order",
    groups: ["Warehouse"],
  },
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
  const parentIconMap = useParentIconMap();

  const parentTitleMap = useMemo(
    () => ({
      "(playground)": i18n.t("playground"),
      "(crm)": i18n.t("crm"),
      "(sales)": i18n.t("sales"),
      "(procurement)": i18n.t("procurement"),
      "(warehouse)": i18n.t("warehouse"),
      "(download)": i18n.t("download"),
      "(pipeline)": i18n.t("pipeline"),
      "(production)": i18n.t("production"),
      "(setting)": i18n.t("setting"),
    }),
    [locale],
  );

  // 用 locale 依赖重新计算 screen labels，避免对 Drawer 使用 key={locale} 全量销毁重建
  const screenLabels = useMemo(
    () => Object.fromEntries(SCREEN_CONFIGS.map((c) => [c.name, i18n.t(c.label)])),
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
        parentIconMap={parentIconMap}
        footer={<DrawerFooter collapsed={collapsed} />}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        {...props}
      />
    ),
    [parentTitleMap, parentIconMap, collapsed],
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
        screenOptions={screenOptions}
        drawerContent={drawerContent}
      >
        {SCREEN_CONFIGS.map((config) => (
          <Drawer.Screen
            key={config.name}
            name={config.name}
            options={{
              drawerLabel: screenLabels[config.name],
              drawerItemStyle: getDrawerItemStyle(config),
            }}
          />
        ))}
      </Drawer>
    </GestureHandlerRootView>
  );
}
