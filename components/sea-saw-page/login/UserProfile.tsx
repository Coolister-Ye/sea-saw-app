import { Avatar } from "@/components/sea-saw-design/avatar";
import View from "@/components/themed/View";
import Text from "@/components/themed/Text";
import { useAuth } from "@/context/Auth";
import { useLocale } from "@/context/Locale";
import { PowerIcon } from "react-native-heroicons/outline";
import { Pressable } from "react-native";

export function UserProfile({ setVisible }: { setVisible?: any }) {
  const { user, logout } = useAuth();
  const { i18n } = useLocale();
  const {
    username = "",
    email = "",
    first_name = "",
    last_name = "",
  } = user || {};

  const displayName = (first_name: string, last_name: string) => {
    if (first_name === "" && last_name === "") return "-";
    return `${first_name} ${last_name}`.trim();
  };

  const displayValue = (value: string) => (value === "" ? "-" : value);

  return (
    <View variant="paper" className="w-full h-full">
      <View className="flex-1 py-1 px-3">
        <View className="w-full flex flex-row items-center">
          <Avatar text={username} size="large" />
          <View className="ml-3">
            <Text className="p-1 text-lg">{displayValue(username)}</Text>
            <Text className="p-1 text-sm">{`${i18n.t("name")}: ${displayName(
              first_name,
              last_name
            )}`}</Text>
            <Text className="p-1 text-sm">{`${i18n.t("email")}: ${displayValue(
              email
            )}`}</Text>
          </View>
        </View>
      </View>
      <View className="bg-zinc-100 px-1">
        <Pressable
          className="p-2 rounded mr-1 flex-row hover:opacity-80 justify-center items-center"
          onPress={logout}
        >
          <PowerIcon size={18} className="mr-1 text-text-secondary" />
          <Text variant="secondary">{i18n.t("logout")}</Text>
        </Pressable>
      </View>
    </View>
  );
}
