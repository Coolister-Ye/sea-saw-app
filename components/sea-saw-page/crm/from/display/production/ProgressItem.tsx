import React from "react";
import { View } from "react-native";
import { Text } from "@/components/sea-saw-design/text";

interface ProgressItemProps {
  title: string;
  value?: string | number;
  unit?: string;
  color: string;
}

export default function ProgressItem({
  title,
  value,
  unit,
  color,
}: ProgressItemProps) {
  return (
    <View>
      <Text className="text-xs text-gray-500">{title}</Text>
      <Text className={`text-sm font-medium ${color}`}>
        {value ?? "-"} {unit ?? ""}
      </Text>
    </View>
  );
}
