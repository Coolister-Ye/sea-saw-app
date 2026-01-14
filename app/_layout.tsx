import { Stack, Tabs } from "expo-router";
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
import { AppProvider } from "@/context/App";
import { DrawerHeader } from "@/components/sea-saw-design/header";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { PortalProvider } from "@gorhom/portal";
import { SafeAreaProviderCompat } from "@react-navigation/elements";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 1000, fade: true });

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const isWeb = Platform.OS === "web";

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
            {isWeb && <DrawerHeader title="Sea saw" />}
            <Stack>
              <Stack.Screen name="(app)" options={{ headerShown: false }} />
              <Stack.Screen name="(setting)" options={{ headerShown: false }} />
              <Stack.Screen name="login" options={{ headerShown: false }} />
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
          </AppProvider>
        </BottomSheetModalProvider>
      </PortalProvider>
    </SafeAreaProviderCompat>
  );
}
