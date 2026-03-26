import React, { memo } from "react";
import { View, ActivityIndicator } from "react-native";
import { QUARTZ } from "../../constants";

export const GridCenteredSpinner = memo(function GridCenteredSpinner() {
  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color={QUARTZ.accent} />
    </View>
  );
});
