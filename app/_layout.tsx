import { Stack } from "expo-router";
import "../global.css";
import "antd/dist/reset.css";
import "ag-grid-enterprise";
import { LicenseManager } from "ag-grid-enterprise";
import { constants } from "@/constants/Constants";
import { LocaleProvider, useLocale } from "@/context/Locale";
import { AuthProvider } from "@/context/Auth";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { WebSplashScreen } from "@/components/navigation/WebSplashScreen";
import { Asset } from "expo-asset";
import { ToastProvider } from "@/context/Toast";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  // Set AG Grid license key
  LicenseManager.setLicenseKey(constants.agGridLicense);

  // Pre-load resources (e.g., splash image)
  useEffect(() => {
    const prepare = async () => {
      try {
        // Preload the splash image (add more assets if needed)
        await Asset.loadAsync(require("@/assets/images/splash.png"));
      } catch (e) {
        console.warn("Error loading assets:", e);
      } finally {
        // Once assets are loaded, mark the app as ready
        setAppIsReady(true);
        // Hide the splash screen after assets are ready
        SplashScreen.hideAsync();
      }
    };

    prepare();
  }, []);

  // Wait until app is ready before rendering the app layout
  if (!appIsReady) {
    if (Platform.OS === "web") {
      return <WebSplashScreen />;
    }
    return null; // Optionally, you can return a loading spinner or empty view
  }

  return (
    <LocaleProvider>
      <ToastProvider>
        <AuthProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
        </AuthProvider>
      </ToastProvider>
    </LocaleProvider>
  );
}
