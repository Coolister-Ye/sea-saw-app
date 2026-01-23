import { useCallback, useMemo } from "react";
import { View, Pressable, Image } from "react-native";
import { Avatar, Dropdown, Space, Button, Divider } from "antd";
import { Text } from "@/components/sea-saw-design/text";
import type { MenuProps } from "antd";
import {
  GlobalOutlined,
  LogoutOutlined,
  UserOutlined,
  MailOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import { useRouter, usePathname } from "expo-router";
import { useLocaleStore } from "@/stores/localeStore";
import { useAuthStore, selectUser, selectLoading } from "@/stores/authStore";
import i18n from "@/locale/i18n";

type DrawerHeaderProps = {
  title?: string;
  // Accept any additional props for compatibility with native version
  [key: string]: unknown;
};

/**
 * Web-specific header component using Ant Design
 * Follows antd documentation site header pattern
 */
export function DrawerHeader({ title = "Sea-Saw" }: DrawerHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocaleStore((state) => state.locale);
  const changeLocale = useLocaleStore((state) => state.changeLocale);
  const user = useAuthStore(selectUser);
  const isUserLoading = useAuthStore(selectLoading);
  const logout = useAuthStore((state) => state.logout);

  const isLoginPage = pathname === "/login";

  const handleNavigateHome = useCallback(() => {
    router.navigate("/");
  }, [router]);

  const handleChangeLocale = useCallback(() => {
    changeLocale(locale === "en" ? "zh" : "en");
  }, [locale, changeLocale]);

  const handleLogout = useCallback(async () => {
    await logout();
    router.replace("/(auth)/login");
  }, [logout, router]);

  // User info
  const {
    username = "",
    email = "",
    first_name = "",
    last_name = "",
  } = user || {};
  const displayName =
    first_name || last_name
      ? `${first_name} ${last_name}`.trim()
      : username || "-";
  const avatarText = username ? username.charAt(0).toUpperCase() : "U";

  // User dropdown menu items
  const userMenuItems: MenuProps["items"] = useMemo(
    () => [
      {
        key: "user-info",
        type: "group",
        label: (
          <View className="py-2 px-1">
            <View className="flex-row items-center gap-2 py-1">
              <UserOutlined className="text-muted-foreground" />
              <Text weight="semibold">{displayName}</Text>
            </View>
            <View className="flex-row items-center gap-2 py-1">
              <MailOutlined className="text-muted-foreground" />
              <Text variant="secondary" size="xs">
                {email || "-"}
              </Text>
            </View>
            <View className="flex-row items-center gap-2 py-1">
              <IdcardOutlined className="text-muted-foreground" />
              <Text variant="secondary" size="xs">
                {username || "-"}
              </Text>
            </View>
          </View>
        ),
      },
      { type: "divider" },
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: i18n.t("logout"),
        danger: true,
        onClick: handleLogout,
      },
    ],
    [displayName, email, username, handleLogout],
  );

  // Locale dropdown menu items
  const localeMenuItems: MenuProps["items"] = useMemo(
    () => [
      {
        key: "en",
        label: "English",
        onClick: () => changeLocale("en"),
      },
      {
        key: "zh",
        label: "中文",
        onClick: () => changeLocale("zh"),
      },
    ],
    [changeLocale],
  );

  return (
    <View className="h-14 bg-background border-b border-border px-4">
      <View className="flex-row items-center justify-between h-full max-w-screen-2xl mx-auto w-full">
        {/* Logo Section */}
        <Pressable
          onPress={handleNavigateHome}
          className="flex-row items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <Image
            source={require("@/assets/images/sea-saw-logo.png")}
            style={{ width: 32, height: 32 }}
            resizeMode="contain"
          />
          <Text className="text-lg font-bold text-primary tracking-tight">
            {title}
          </Text>
        </Pressable>

        {/* Actions Section */}
        <Space size="small">
          {/* Locale Toggle */}
          <Dropdown
            menu={{ items: localeMenuItems, selectedKeys: [locale] }}
            placement="bottomRight"
          >
            <Button type="text" icon={<GlobalOutlined />}>
              {locale.toUpperCase()}
            </Button>
          </Dropdown>

          {/* User Avatar Dropdown */}
          {!isLoginPage && (
            <>
              <Divider style={{ height: 20, margin: "0 4px" }} />
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <Pressable className="flex-row items-center gap-2 px-2 py-1 rounded-md hover:bg-secondary cursor-pointer">
                  <Avatar size="small">
                    {isUserLoading ? "..." : avatarText}
                  </Avatar>
                  <Text className="text-sm text-foreground">
                    {isUserLoading ? "..." : displayName}
                  </Text>
                </Pressable>
              </Dropdown>
            </>
          )}
        </Space>
      </View>
    </View>
  );
}

// Re-export subcomponents for consistency
export { HeaderLogo } from "./HeaderLogo";
export { HeaderActions } from "./HeaderActions";
export { HeaderIconButton } from "./HeaderIconButton";
export { CustomAvatar } from "./CustomAvatar";
