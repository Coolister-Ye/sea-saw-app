import { UserProfile } from "@/components/sea-saw-page/login/UserProfile";
import Animated, { SlideInRight } from "react-native-reanimated";
import { Redirect } from "expo-router";
import {
  useAuthStore,
  selectIsLogin,
  selectHasHydrated,
} from "@/stores/authStore";

export default function UserScreen() {
  const isLogin = useAuthStore(selectIsLogin);
  const hasHydrated = useAuthStore(selectHasHydrated);

  if (!hasHydrated) {
    return null;
  }

  if (!isLogin) {
    return <Redirect href="/login" />;
  }

  return (
    <Animated.View entering={SlideInRight} style={{ flex: 1 }}>
      <UserProfile />
    </Animated.View>
  );
}
