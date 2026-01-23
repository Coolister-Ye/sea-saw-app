import { Pressable, Text, Image, View } from "react-native";

type HeaderLogoProps = {
  title?: string;
  onPress?: () => void;
  showTitle?: boolean;
};

/**
 * Header logo component with optional title text
 * Displays the Sea-Saw branding with hover interaction
 */
export function HeaderLogo({
  title = "Sea-Saw",
  onPress,
  showTitle = true,
}: HeaderLogoProps) {
  return (
    <Pressable
      className="flex-row items-center gap-2 px-1 py-1 rounded-lg hover:bg-secondary/50 active:bg-secondary transition-colors"
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel="Navigate to home"
    >
      <View className="w-9 h-9 items-center justify-center">
        <Image
          style={{ height: 32, width: 32 }}
          source={require("@/assets/images/sea-saw-logo.png")}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      </View>
      {showTitle && (
        <Text className="text-lg font-bold tracking-tight text-primary">
          {title}
        </Text>
      )}
    </Pressable>
  );
}
