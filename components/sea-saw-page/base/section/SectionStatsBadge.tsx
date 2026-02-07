import React from "react";
import { View } from "react-native";
import { Text } from "@/components/sea-saw-design/text";

interface SectionStatsBadgeProps {
  /** 图标组件 */
  icon: React.ReactNode;
  /** 统计文本 */
  label: string;
}

/**
 * Section统计徽章组件，用于显示摘要信息
 */
export default function SectionStatsBadge({
  icon,
  label,
}: SectionStatsBadgeProps) {
  return (
    <View className="flex-row items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100">
      {icon}
      <Text className="text-sm font-semibold text-slate-600 font-mono tracking-tight">
        {label}
      </Text>
    </View>
  );
}
