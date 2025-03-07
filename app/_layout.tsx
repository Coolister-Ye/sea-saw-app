import { Stack } from "expo-router";
import "../global.css";
import "antd/dist/reset.css";
import "ag-grid-enterprise";
import { LicenseManager } from "ag-grid-enterprise";
import { constants } from "@/constants/Constants";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { WebSplashScreen } from "@/components/navigation/WebSplashScreen";
import { Asset } from "expo-asset";
import { AppProvider } from "@/context/App";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 1000, fade: true });

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
    <AppProvider>
      <Stack>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen
          name="user"
          options={{
            presentation: "transparentModal",
            animation: "fade",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="set_passwd"
          options={{
            title: "Change Password",
          }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
    </AppProvider>
  );
}
