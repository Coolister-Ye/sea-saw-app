import { Avatar } from "@/components/sea-saw-design/avatar";
import i18n from "@/locale/i18n";
import View from "@/components/themed/View";
import Text from "@/components/themed/Text";
import { useAuthStore, selectUser } from "@/stores/authStore";
import {
  PowerIcon,
  PencilIcon,
  EnvelopeIcon,
  UserCircleIcon,
} from "react-native-heroicons/outline";
import { Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SectionHeader, InfoRow } from "./ProfileComponents";

export function UserProfile({ setVisible: _setVisible }: { setVisible?: any }) {
  const user = useAuthStore(selectUser);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  const {
    username = "",
    email = "",
    first_name = "",
    last_name = "",
    phone = "",
    department = "",
    role,
    date_joined,
    is_staff,
  } = user || {};

  const displayName = (first: string, last: string) => {
    if (!first && !last) return "-";
    return `${first} ${last}`.trim();
  };

  const avatarText =
    first_name && last_name
      ? `${first_name[0]}${last_name[0]}`.toUpperCase()
      : username?.substring(0, 2).toUpperCase() || "??";

  const formattedDate = date_joined
    ? new Date(date_joined).toLocaleDateString()
    : "-";

  const staffBadge = (
    <View className={`px-3 py-1 rounded-lg ${is_staff ? "bg-green-100" : "bg-red-100"}`}>
      <Text className={`text-xs font-bold ${is_staff ? "text-green-600" : "text-red-600"}`}>
        {is_staff ? i18n.t("Yes") : i18n.t("No")}
      </Text>
    </View>
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View className="flex md:flex-row flex-wrap px-4 py-8 md:px-12 md:py-12 gap-6">
        {/* Left Column - Profile Card */}
        <View className="w-full md:w-5/12 lg:w-4/12">
          <View className="bg-white rounded-xl p-6 border border-slate-200 shadow-lg">
            {/* Avatar Section */}
            <View className="items-center mb-6">
              <View className="relative mb-4">
                <View className="relative bg-white rounded-full p-1.5">
                  <Avatar
                    size={96}
                    shape="circle"
                    gradientColors={["#3b82f6", "#6366f1", "#8b5cf6"]}
                    gradientStart={{ x: 0, y: 0 }}
                    gradientEnd={{ x: 1, y: 1 }}
                  >
                    {avatarText}
                  </Avatar>
                </View>
              </View>

              <Text className="text-2xl font-bold mb-1 text-slate-800">
                {username || "-"}
              </Text>

              {role?.role_name && (
                <View className="px-4 py-1.5 rounded-full mt-2 bg-gradient-to-r from-blue-500 to-indigo-500">
                  <Text className="text-xs font-bold tracking-wider uppercase text-white">
                    {role.role_name}
                  </Text>
                </View>
              )}
            </View>

            {/* Divider */}
            <View className="h-px bg-slate-200 mb-6" />

            {/* Account Info */}
            <View>
              <SectionHeader
                icon={<UserCircleIcon size={18} color="#3b82f6" strokeWidth={2.5} />}
                title={i18n.t("Account Information")}
              />

              <InfoRow
                label={i18n.t("User ID")}
                value={user?.id ? `#${user.id}` : "-"}
              />
              <InfoRow
                label={i18n.t("Full Name")}
                value={displayName(first_name, last_name)}
              />
              <InfoRow
                label={i18n.t("Is Staff")}
                value={staffBadge}
              />
              <InfoRow
                label={i18n.t("Date Joined")}
                value={formattedDate}
                isLast
              />
            </View>
          </View>
        </View>

        {/* Right Column - Contact & Actions */}
        <View className="w-full md:w-6/12 lg:w-7/12">
          {/* Contact Information Card */}
          <View className="bg-white rounded-xl p-6 border border-slate-200 shadow-lg">
            <SectionHeader
              icon={<EnvelopeIcon size={18} color="#3b82f6" strokeWidth={2.5} />}
              title={i18n.t("Contact Information")}
            />

            <InfoRow
              label={i18n.t("email")}
              value={email || "-"}
            />
            <InfoRow
              label={i18n.t("Phone")}
              value={phone || "-"}
            />
            <InfoRow
              label={i18n.t("Department")}
              value={department || "-"}
              isLast
            />
          </View>

          {/* Action Buttons */}
          <View className="mt-6 space-y-3">
            <Pressable
              onPress={() => router.push("/(app)/(setting)/profile-edit")}
              className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/30 active:opacity-85 active:scale-[0.98]"
            >
              <View className="flex-row items-center justify-center py-3.5">
                <PencilIcon size={20} color="#ffffff" strokeWidth={2.5} />
                <Text className="text-base font-bold ml-3 text-white">
                  {i18n.t("Edit Profile")}
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={handleLogout}
              className="bg-white rounded-xl border-2 border-red-600 shadow-sm shadow-red-600/10 active:opacity-85 active:scale-[0.98]"
            >
              <View className="flex-row items-center justify-center py-3.5">
                <PowerIcon size={20} color="#dc2626" strokeWidth={2.5} />
                <Text className="text-base font-bold ml-3 text-red-600">
                  {i18n.t("logout")}
                </Text>
              </View>
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
