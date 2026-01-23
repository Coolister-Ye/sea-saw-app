import { PasswordChange } from "@/components/sea-saw-page/login/PasswordChange";
import Animated, { FadeIn, SlideInRight } from "react-native-reanimated";
import { Redirect } from "expo-router";
import { useAuthStore, selectIsLogin, selectHasHydrated } from "@/stores/authStore";

// Password change screen component
export default function SetPasswdScreen() {
  const isLogin = useAuthStore(selectIsLogin);
  const hasHydrated = useAuthStore(selectHasHydrated);

  if (!hasHydrated) {
    return null;
  }

  if (!isLogin) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Animated.View
      entering={FadeIn}
      className="h-full w-full bg-stone-800/50 shadow-md"
    >
      <Animated.View
        entering={SlideInRight}
        className="absolute inset-y-0 right-0 w-full md:w-[48rem]"
      >
        <PasswordChange />
      </Animated.View>
    </Animated.View>
  );
}
