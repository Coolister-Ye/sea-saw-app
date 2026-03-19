import React from "react";
import { View } from "react-native";
import i18n from "@/locale/i18n";
import Tag from "@/components/sea-saw-design/tag";
import {
  UserGroupIcon,
  TruckIcon,
  SparklesIcon,
} from "react-native-heroicons/outline";
import type { PresetColor } from "@/components/sea-saw-design/tag/types";

interface RoleBadgesProps {
  roles: string[];
}

const ROLE_CONFIG: Record<
  string,
  {
    color: PresetColor;
    iconColor: string;
    icon: React.ComponentType<{ size?: number; color?: string }>;
  }
> = {
  CUSTOMER: { color: "blue", iconColor: "#1d4ed8", icon: UserGroupIcon },
  SUPPLIER: { color: "green", iconColor: "#047857", icon: TruckIcon },
  PROSPECT: { color: "gold", iconColor: "#b45309", icon: SparklesIcon },
};

export default function RoleBadges({ roles }: RoleBadgesProps) {
  if (!roles || roles.length === 0) return null;

  return (
    <View className="flex-row flex-wrap gap-1.5">
      {roles.map((role) => {
        const config = ROLE_CONFIG[role] ?? ROLE_CONFIG.PROSPECT;
        const RoleIcon = config.icon;
        return (
          <Tag
            key={role}
            color={config.color}
            bordered
            icon={<RoleIcon size={18} color={config.iconColor} />}
            className="py-1 px-2"
          >
            {i18n.t(role)}
          </Tag>
        );
      })}
    </View>
  );
}
