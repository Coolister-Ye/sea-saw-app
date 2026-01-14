import React from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/text";

interface WeightItemProps {
  title: string;
  value: string;
}

export default function WeightItem({ title, value }: WeightItemProps) {
  return (
    <View>
      <Text className="text-xs text-gray-500">{title}</Text>
      <Text className="text-sm text-gray-700">{value} kg</Text>
    </View>
  );
}
