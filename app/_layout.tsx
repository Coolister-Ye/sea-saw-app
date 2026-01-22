import { Stack } from "expo-router";
import "../global.css";
import "antd/dist/reset.css";
import "ag-grid-enterprise";
import "react-native-svg";
import { PortalHost } from "@rn-primitives/portal";
import { LicenseManager } from "ag-grid-enterprise";
import { constants } from "@/constants/Constants";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { WebSplashScreen } from "@/components/sea-saw-design/splash/WebSplashScreen";
import { Asset } from "expo-asset";
import { AppProvider, useAppContext } from "@/context/App";
import { DrawerHeader } from "@/components/sea-saw-design/header";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { PortalProvider } from "@gorhom/portal";
import { SafeAreaProviderCompat } from "@react-navigation/elements";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 1000, fade: true });

// 内部组件，用于访问 AppContext
function AppContent() {
  const isWeb = Platform.OS === "web";
  const { isAppReady } = useAppContext();

  // 等待 Auth 和 Locale 初始化完成
  if (!isAppReady) {
    return Platform.OS === "web" ? <WebSplashScreen /> : null;
  }

  return (
    <>
      {isWeb && <DrawerHeader title="Sea saw" />}
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
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
        <Stack.Screen name="+not-found" options={{ headerShown: false }} />
      </Stack>
      <PortalHost />
    </>
  );
}

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  // Set AG Grid license key
  useEffect(() => {
    LicenseManager.setLicenseKey(constants.agGridLicense);
  }, []);

  // Pre-load resources (e.g., splash image)
  useEffect(() => {
    const prepare = async () => {
      try {
        // Preload the splash image (add more assets if needed)
        await Asset.loadAsync(require("@/assets/images/splash.png"));
      } catch (e) {
        console.warn("Error loading assets:", e);
      } finally {
        setAppIsReady(true);
        SplashScreen.hideAsync(); // Hide splash screen after loading
      }
    };

    prepare();
  }, []);

  // Wait until the app is ready before rendering
  if (!appIsReady) {
    // Show splash screen on web or return null for mobile
    return Platform.OS === "web" ? <WebSplashScreen /> : null;
  }

  return (
    <SafeAreaProviderCompat>
      <PortalProvider>
        <BottomSheetModalProvider>
          <AppProvider>
            <AppContent />
          </AppProvider>
        </BottomSheetModalProvider>
      </PortalProvider>
    </SafeAreaProviderCompat>
  );
}
