import React from "react";
import { View } from "react-native";
import { Text } from "@/components/sea-saw-design/text";
import {
  UserGroupIcon,
  TruckIcon,
  SparklesIcon,
} from "react-native-heroicons/outline";
import i18n from "@/locale/i18n";

interface RoleBadgesProps {
  roles: string[];
}

export default function RoleBadges({ roles }: RoleBadgesProps) {
  if (!roles || roles.length === 0) {
    return null;
  }

  const roleConfig: Record<
    string,
    {
      bg: string;
      border: string;
      text: string;
      icon: React.ComponentType<{ size?: number; color?: string }>;
      iconColor: string;
    }
  > = {
    CUSTOMER: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
      icon: UserGroupIcon,
      iconColor: "#1d4ed8",
    },
    SUPPLIER: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-700",
      icon: TruckIcon,
      iconColor: "#047857",
    },
    PROSPECT: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-700",
      icon: SparklesIcon,
      iconColor: "#b45309",
    },
  };

  return (
    <View className="flex-row flex-wrap gap-2">
      {roles.map((role: string) => {
        const config = roleConfig[role] || roleConfig.PROSPECT;
        const RoleIcon = config.icon;

        return (
          <View
            key={role}
            className={`flex-row items-center gap-1.5 px-2.5 py-1.5 rounded-full border ${config.bg} ${config.border}`}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}
          >
            <RoleIcon size={14} color={config.iconColor} />
            <Text className={`text-xs font-semibold ${config.text}`}>
              {i18n.t(role)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
