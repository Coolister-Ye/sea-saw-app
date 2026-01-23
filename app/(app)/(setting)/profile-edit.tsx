import { UserProfileEdit } from "@/components/sea-saw-page/login/UserProfileEdit";
import Animated, { FadeIn, SlideInRight } from "react-native-reanimated";
import { Redirect } from "expo-router";
import {
  useAuthStore,
  selectIsLogin,
  selectHasHydrated,
} from "@/stores/authStore";

// 用户资料编辑屏幕组件
// User profile edit screen component
export default function UserProfileEditScreen() {
  const isLogin = useAuthStore(selectIsLogin);
  const hasHydrated = useAuthStore(selectHasHydrated);

  if (!hasHydrated) {
    return null;
  }

  if (!isLogin) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Animated.View entering={SlideInRight} style={{ flex: 1 }}>
      <UserProfileEdit />
    </Animated.View>
  );
}
