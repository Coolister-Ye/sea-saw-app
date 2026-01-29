import {
  Stack,
  SplashScreen,
  useRouter,
  usePathname,
  useSegments,
} from "expo-router";
import "../global.css";
import "antd/dist/reset.css";
import "ag-grid-enterprise";
import "react-native-svg";
import { PortalHost } from "@rn-primitives/portal";
import { LicenseManager } from "ag-grid-enterprise";
import { constants } from "@/constants/Constants";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { PortalProvider } from "@gorhom/portal";
import { SafeAreaProviderCompat } from "@react-navigation/elements";
import { useAuthStore } from "@/stores/authStore";
import { useLocaleStore } from "@/stores/localeStore";
import { LoadingScreen } from "@/components/sea-saw-page/LoadingScreen";

const isWeb = Platform.OS === "web";

// Keep the splash screen visible while we fetch resources
if (!isWeb) {
  SplashScreen.preventAutoHideAsync();
}

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();

  // Zustand store state
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const isLocaleLoading = useLocaleStore((state) => state.isLoading);
  const initializeLocale = useLocaleStore((state) => state.initialize);
  const isLogin = useAuthStore((state) => state.user !== null);

  // Track previous login state to detect logout
  const wasLoggedIn = useRef(isLogin);

  // Combined loading state: store hydration only
  const isAppReady = hasHydrated && !isLocaleLoading;

  // Set AG Grid license key
  useEffect(() => {
    LicenseManager.setLicenseKey(constants.agGridLicense);
  }, []);

  // Initialize locale store on app start
  useEffect(() => {
    initializeLocale();
  }, [initializeLocale]);

  // Handle auth state changes - redirect to login when logged out
  useEffect(() => {
    if (!isAppReady) return;

    const inAuthGroup = segments[0] === "(auth)";

    // User was logged in but now logged out - redirect to login
    if (wasLoggedIn.current && !isLogin && !inAuthGroup) {
      router.replace(`/login?next=${pathname}`);
    }

    wasLoggedIn.current = isLogin;
  }, [isAppReady, isLogin, segments, router, pathname]);

  // Hide splash screen after stores are ready
  useEffect(() => {
    if (isAppReady) {
      SplashScreen.hideAsync();
    }
  }, [isAppReady]);

  // Wait until stores are ready before rendering
  if (!isAppReady) {
    // Native: hide splash screen, show loading
    // Web: show loading screen to prevent flash to login page
    return isWeb ? <LoadingScreen /> : null;
  }

  return (
    <SafeAreaProviderCompat>
      <PortalProvider>
        <BottomSheetModalProvider>
          <Stack>
            {/* 未登录时显示认证相关页面 */}
            <Stack.Protected guard={!isLogin}>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            </Stack.Protected>

            {/* 已登录时显示应用页面 */}
            <Stack.Protected guard={isLogin}>
              <Stack.Screen name="(app)" options={{ headerShown: false }} />
              <Stack.Screen name="(setting)" options={{ headerShown: false }} />
              <Stack.Screen
                name="user"
                options={{
                  presentation: "transparentModal",
                  animation: "fade",
                  headerShown: false,
                }}
              />
            </Stack.Protected>

            {/* 404 页面不需要保护 */}
            <Stack.Screen name="+not-found" options={{ headerShown: false }} />
          </Stack>
          <PortalHost />
        </BottomSheetModalProvider>
      </PortalProvider>
    </SafeAreaProviderCompat>
  );
}
