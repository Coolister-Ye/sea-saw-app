import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Cog6ToothIcon } from "react-native-heroicons/outline";
import { useLocale } from "@/context/Locale";

export default function DrawerFooter() {
  const router = useRouter();
  const { i18n } = useLocale();

  const pressableStyles =
    "group -mx-2 flex flex-row items-center gap-x-3 rounded-md p-2 text-indigo-200 hover:bg-indigo-700 active:bg-indigo-800";
  const iconStyles = "size-6 shrink-0 text-gray-500 group-hover:text-white";
  const textStyles =
    "text-sm font-semibold text-gray-500 group-hover:text-white";

  const handlePress = () => {
    router.push("/(setting)/password");
  };

  return (
    <View className="px-4 pb-2">
      <Pressable className={pressableStyles} onPress={handlePress}>
        <Cog6ToothIcon className={iconStyles} />
        <Text className={textStyles}>{i18n.t("Settings")}</Text>
      </Pressable>
    </View>
  );
}
