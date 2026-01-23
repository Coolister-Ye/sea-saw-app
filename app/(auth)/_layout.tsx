import { Stack } from "expo-router";

export default function AuthLayout() {
  // Stack.Protected 已经在父级 _layout.tsx 中处理认证保护
  // 这里不需要再手动检查登录状态和重定向
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
