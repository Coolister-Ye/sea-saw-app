import { View, Text } from "react-native";
import { LanguageIcon } from "react-native-heroicons/solid";
import { HeaderIconButton } from "./HeaderIconButton";
import { CustomAvatar } from "./CustomAvatar";

type HeaderActionsProps = {
  showUserAvatar?: boolean;
  currentLocale: string;
  onLocaleChange: () => void;
};

/**
 * Header actions container - displays locale toggle and user avatar
 */
export function HeaderActions({
  showUserAvatar = true,
  currentLocale,
  onLocaleChange,
}: HeaderActionsProps) {
  return (
    <View className="flex-row items-center gap-1">
      {showUserAvatar && <CustomAvatar />}

      <HeaderIconButton
        onPress={onLocaleChange}
        accessibilityLabel={`Switch language, current: ${currentLocale}`}
        accessibilityRole="button"
      >
        <View className="flex-row items-center gap-1">
          <LanguageIcon size={20} className="text-muted-foreground" />
          <Text className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {currentLocale}
          </Text>
        </View>
      </HeaderIconButton>
    </View>
  );
}
