import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";

export function LoadingScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#000" : "#fff" },
      ]}
    >
      <ActivityIndicator
        size="large"
        color={isDark ? "#fff" : "#000"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
