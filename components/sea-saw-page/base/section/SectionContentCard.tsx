import React from "react";
import { View } from "react-native";

interface SectionContentCardProps {
  /** 顶部渐变装饰线的颜色（from-{color}-400 via-{color}-500 to-{color}-400格式） */
  gradientColors: string;
  /** 卡片内容 */
  children: React.ReactNode;
}

/**
 * Section内容卡片容器，提供统一的样式和装饰
 */
export default function SectionContentCard({
  gradientColors,
  children,
}: SectionContentCardProps) {
  return (
    <View
      className="rounded-2xl overflow-hidden border border-slate-200/60 bg-white"
      style={{
        boxShadow: "0 4px 12px rgba(15, 23, 42, 0.03)",
      }}
    >
      {/* Decorative top gradient line */}
      <View className={`h-1 bg-gradient-to-r ${gradientColors}`} />

      <View className="p-1">{children}</View>
    </View>
  );
}
