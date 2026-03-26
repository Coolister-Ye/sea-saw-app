import React, { memo } from "react";
import { View, Text } from "react-native";
import i18n from "@/locale/i18n";

export const GridEmptyState = memo(function GridEmptyState() {
  return (
    <View className="flex-1 items-center justify-center py-12">
      <Text className="text-[13px] text-[#9ca3af]">{i18n.t("No rows")}</Text>
    </View>
  );
});
