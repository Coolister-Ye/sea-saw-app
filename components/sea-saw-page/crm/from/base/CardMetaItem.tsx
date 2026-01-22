import React from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/text";

interface CardMetaItemProps {
  icon: React.ComponentType<{ size: number; color: string }>;
  value: string;
}

/**
 * Reusable meta item component with icon for card footers
 * Displays small metadata like owner, date, etc. with an icon
 */
export default function CardMetaItem({ icon: Icon, value }: CardMetaItemProps) {
  return (
    <View className="flex-row items-center gap-1">
      <Icon size={12} color="#94a3b8" />
      <Text className="text-xs text-slate-400">{value}</Text>
    </View>
  );
}
