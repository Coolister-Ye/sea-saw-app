import { Pressable, Text, View } from "react-native";
import { useAuth } from "@/context/Auth";
import { Avatar } from "../avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { useLocale } from "@/context/Locale";
import { PowerIcon } from "react-native-heroicons/solid";
import { usePathname } from "expo-router";

export function CustomAvatar() {
  const { i18n } = useLocale();
  const { user, loading: isUserLoading, logout } = useAuth();

  const {
    username = "",
    email = "",
    first_name = "",
    last_name = "",
  } = user || {};

  const displayName = (first_name: string, last_name: string) =>
    first_name || last_name ? `${first_name} ${last_name}`.trim() : "-";

  const displayValue = (value: string) => value || "-";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Pressable>
          <Avatar
            text={user?.username}
            size="small"
            isLoading={isUserLoading}
          />
        </Pressable>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={2}
        className="w-64 native:w-72 border-gray-100 bg-white"
      >
        <DropdownMenuLabel>
          <View>
            <Text className="p-1">{`${i18n.t("account")}: ${displayValue(
              username
            )}`}</Text>
            <Text className="p-1">{`${i18n.t("name")}: ${displayName(
              first_name,
              last_name
            )}`}</Text>
            <Text className="p-1 text-sm">{`${i18n.t("email")}: ${displayValue(
              email
            )}`}</Text>
          </View>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-100" />
        <DropdownMenuItem className="hover:bg-gray-100" onPress={logout}>
          <Pressable className="rounded mr-1 flex-row hover:opacity-80 justify-center items-center">
            <PowerIcon size={18} className="mr-1 text-text-secondary" />
            <Text>{i18n.t("logout")}</Text>
          </Pressable>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
