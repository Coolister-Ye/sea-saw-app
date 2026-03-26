import React, { memo } from "react";
import { View, Text } from "react-native";

export const GridErrorState = memo(function GridErrorState({ message }: { message: string }) {
  return (
    <View className="flex-1 items-center justify-center py-12 gap-2">
      <Text className="text-[13px] text-[#ef4444] text-center px-6">{message}</Text>
    </View>
  );
});
