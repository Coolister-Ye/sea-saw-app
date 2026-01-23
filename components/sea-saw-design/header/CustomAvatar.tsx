import { Pressable, Text, View } from "react-native";
import i18n from "@/locale/i18n";
import { useAuthStore, selectUser, selectLoading } from "@/stores/authStore";
import { Avatar } from "../avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import {
  ArrowRightStartOnRectangleIcon,
  UserCircleIcon,
} from "react-native-heroicons/outline";
import { useRouter } from "expo-router";

/**
 * User avatar with dropdown menu for profile actions
 */
export function CustomAvatar() {
  const user = useAuthStore(selectUser);
  const isUserLoading = useAuthStore(selectLoading);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  const { username = "", email = "", first_name = "", last_name = "" } = user || {};

  const displayName =
    first_name || last_name ? `${first_name} ${last_name}`.trim() : username || "-";

  const displayValue = (value: string) => value || "-";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Pressable
          className="rounded-full hover:ring-2 hover:ring-primary/20 transition-shadow"
          accessibilityLabel="User menu"
          accessibilityRole="button"
        >
          <Avatar text={user?.username} size="small" isLoading={isUserLoading} />
        </Pressable>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-64 native:w-72 border-border bg-popover shadow-lg rounded-lg"
      >
        {/* User Info Section */}
        <DropdownMenuLabel className="px-3 py-3">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
              <UserCircleIcon size={24} className="text-primary" />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-foreground">{displayName}</Text>
              <Text className="text-xs text-muted-foreground">
                {displayValue(email)}
              </Text>
            </View>
          </View>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-border" />

        {/* Account Details */}
        <View className="px-3 py-2">
          <View className="flex-row justify-between py-1">
            <Text className="text-xs text-muted-foreground">{i18n.t("account")}</Text>
            <Text className="text-xs font-medium text-foreground">
              {displayValue(username)}
            </Text>
          </View>
        </View>

        <DropdownMenuSeparator className="bg-border" />

        {/* Logout Action */}
        <DropdownMenuItem
          className="mx-1 my-1 rounded-md hover:bg-error-bg active:bg-error-bg"
          onPress={handleLogout}
        >
          <View className="flex-row items-center gap-2 py-0.5">
            <ArrowRightStartOnRectangleIcon size={18} className="text-error" />
            <Text className="text-error font-medium">{i18n.t("logout")}</Text>
          </View>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
