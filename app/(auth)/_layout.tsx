import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/context/Auth";

export default function AuthLayout() {
  const { isLogin, isInitialized } = useAuth();

  if (!isInitialized) {
    return null; // Show nothing while initializing
  }

  // Redirect to home if already logged in
  if (isLogin) {
    return <Redirect href="/" />;
  }

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
    </Stack>
  );
}
