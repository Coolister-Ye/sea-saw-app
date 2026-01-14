import React, { useMemo, useState } from "react";
import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Platform } from "react-native";
import { useDevice } from "@/hooks/useDevice";
import { useLocale } from "@/context/Locale";
import { useAuth } from "@/context/Auth";
import CustomDrawerContent from "@/components/sea-saw-design/drawer/DrawerContent.web";
import DrawerFooter from "@/components/sea-saw-design/drawer/DrawerFoot";

import {
  AppstoreOutlined,
  SettingOutlined,
  FundProjectionScreenOutlined,
  BarChartOutlined,
} from "@ant-design/icons";

export default function AppLayout() {
  const { i18n } = useLocale();
  const { isGroupX, isStaff } = useAuth();
  const { isLargeScreen } = useDevice();
  const isWeb = Platform.OS === "web";

  const [collapsed, setCollapsed] = useState(false);

  /** -------------------------------
   * Parent 标题和 Icons（useMemo 缓存）
   * ------------------------------- */
  const parentTitleMap = useMemo(
    () => ({
      "(playground)": i18n.t("playground"),
      "(setting)": i18n.t("setting"),
      "(crm)": i18n.t("crm"),
    }),
    [i18n]
  );

  const parentIconMap = useMemo(
    () => ({
      "(playground)": <AppstoreOutlined />,
      "(setting)": <SettingOutlined />,
      "(crm)": <FundProjectionScreenOutlined />,
      index: <BarChartOutlined />,
    }),
    []
  );

  /** -------------------------------
   * 权限控制方法
   * ------------------------------- */
  const getDrawerVisibility = (groups?: string[]) => {
    if (isStaff) return "flex";
    if (!groups) return "none";
    return groups.some(isGroupX) ? "flex" : "none";
  };

  /** -------------------------------
   * CRM 模块（自动生成 Drawer.Item）
   * ------------------------------- */
  const crmScreens = [
    { name: "(crm)/contact", label: i18n.t("customer"), groups: ["Sale"] },
    { name: "(crm)/company", label: i18n.t("company"), groups: ["Sale"] },
    { name: "(crm)/order", label: i18n.t("order"), groups: ["Sale"] },
    {
      name: "(crm)/production",
      label: i18n.t("production"),
      groups: ["Production"],
    },
    {
      name: "(crm)/pipeline",
      label: i18n.t("pipeline"),
      groups: ["Sale"],
    },
    {
      name: "(crm)/download",
      label: i18n.t("download"),
      groups: ["Sale", "Production"],
    },
  ];

  /** -------------------------------
   * Playground 模块
   * ------------------------------- */
  const playgroundScreens = [
    "(playground)/playground",
    "(playground)/example",
    "(playground)/hoverCardExample",
  ];

  /** -------------------------------
   * Setting 模块
   * ------------------------------- */
  const settingScreens = [
    { name: "(setting)/password", label: i18n.t("Password") },
  ];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          headerShown: !isWeb,
          drawerType: isLargeScreen ? "permanent" : "front",
          drawerStyle: { width: collapsed ? 80 : 256 },
          drawerItemStyle: { borderRadius: 8 },
        }}
        drawerContent={(props) => (
          <CustomDrawerContent
            parentTitleMap={parentTitleMap}
            parentIconMap={parentIconMap}
            footer={<DrawerFooter />}
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            {...props}
          />
        )}
      >
        {/* 首页 */}
        <Drawer.Screen name="index" options={{ drawerLabel: i18n.t("Home") }} />

        {/* CRM 模块自动生成 */}
        {crmScreens.map(({ name, label, groups }) => (
          <Drawer.Screen
            key={name}
            name={name}
            options={{
              drawerLabel: label,
              drawerItemStyle: {
                display: getDrawerVisibility(groups),
                borderRadius: 8,
              },
            }}
          />
        ))}

        {/* Playground */}
        {playgroundScreens.map((name) => (
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

        {/* Setting */}
        {settingScreens.map(({ name, label }) => (
          <Drawer.Screen
            key={name}
            name={name}
            options={{
              drawerLabel: label,
              drawerItemStyle: {
                borderRadius: 8,
              },
            }}
          />
        ))}
      </Drawer>
    </GestureHandlerRootView>
  );
}
