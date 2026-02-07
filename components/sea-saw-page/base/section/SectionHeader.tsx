import React from "react";
import { View } from "react-native";
import { Text } from "@/components/sea-saw-design/text";

interface SectionHeaderProps {
  /** 图标组件 */
  icon: React.ReactNode;
  /** 图标背景渐变色（from-{color}-500 to-{color}-600格式） */
  iconGradient: string;
  /** 图标阴影色（shadow-{color}-500/25格式） */
  iconShadow: string;
  /** 标题文本 */
  title: string;
  /** 副标题（可选，如记录数量） */
  subtitle?: string;
  /** 右侧内容（可选，如统计徽章） */
  rightContent?: React.ReactNode;
}

/**
 * Section标题组件，包含图标、标题、副标题和右侧内容
 */
export default function SectionHeader({
  icon,
  iconGradient,
  iconShadow,
  title,
  subtitle,
  rightContent,
}: SectionHeaderProps) {
  return (
    <View className="flex-row items-center justify-between mb-4">
      <View className="flex-row items-center gap-3">
        <View
          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${iconGradient} items-center justify-center shadow-lg ${iconShadow}`}
        >
          {icon}
        </View>
        <View>
          <Text
            className="text-lg font-semibold text-slate-800 tracking-tight"
            style={{ fontFamily: "System" }}
          >
            {title}
          </Text>
          {subtitle && (
            <Text className="text-xs text-slate-400 mt-0.5">{subtitle}</Text>
          )}
        </View>
      </View>

      {rightContent}
    </View>
  );
}
