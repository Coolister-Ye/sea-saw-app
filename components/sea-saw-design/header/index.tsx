import { Header } from "@react-navigation/elements";
import { useCallback } from "react";
import { View } from "react-native";
import { Bars3Icon } from "react-native-heroicons/outline";
import { useDevice } from "@/hooks/useDevice";
import { useLocaleStore } from "@/stores/localeStore";
import { useNavigationContainerRef, usePathname, useRouter } from "expo-router";
import { DrawerActions } from "@react-navigation/native";
import { HeaderLogo } from "./HeaderLogo";
import { HeaderActions } from "./HeaderActions";
import { HeaderIconButton } from "./HeaderIconButton";

type HeaderProps = Partial<React.ComponentProps<typeof Header>>;

/**
 * Main application header with responsive drawer toggle
 *
 * Structure:
 * - Left: Menu toggle (mobile only)
 * - Center/Left: Logo + App name
 * - Right: Actions (locale, user avatar)
 */
export function DrawerHeader(props: HeaderProps = {}) {
  const { isLargeScreen } = useDevice();
  const locale = useLocaleStore((state) => state.locale);
  const changeLocale = useLocaleStore((state) => state.changeLocale);
  const navigation = useNavigationContainerRef();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === "/login";

  const handleToggleMenu = useCallback(() => {
    navigation.dispatch(DrawerActions.toggleDrawer());
  }, [navigation]);

  const handleChangeLocale = useCallback(() => {
    changeLocale(locale === "en" ? "zh" : "en");
  }, [locale, changeLocale]);

  const handleNavigateHome = useCallback(() => {
    router.navigate("/");
  }, [router]);

  return (
    <View className="bg-background border-b border-border">
      <Header
        {...props}
        title={props.title ?? "Sea-Saw"}
        headerTitleAlign="left"
        headerStyle={{
          backgroundColor: "transparent",
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        }}
        headerRight={() => (
          <HeaderActions
            showUserAvatar={!isLoginPage}
            currentLocale={locale}
            onLocaleChange={handleChangeLocale}
          />
        )}
        headerLeft={() =>
          !isLargeScreen ? (
            <HeaderIconButton
              onPress={handleToggleMenu}
              accessibilityLabel="Toggle navigation menu"
              accessibilityRole="button"
            >
              <Bars3Icon size={22} strokeWidth={2} className="text-foreground" />
            </HeaderIconButton>
          ) : null
        }
        headerTitle={() => (
          <HeaderLogo title={props.title as string} onPress={handleNavigateHome} />
        )}
      />
    </View>
  );
}

// Re-export subcomponents for external use
export { HeaderLogo } from "./HeaderLogo";
export { HeaderActions } from "./HeaderActions";
export { HeaderIconButton } from "./HeaderIconButton";
export { CustomAvatar } from "./CustomAvatar";
