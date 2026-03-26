import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { QUARTZ } from "../../constants";
import { styles, textStyles } from "./styles";

type SortIndicatorProps = {
  direction: "asc" | "desc";
  /** 1-based sort priority (shown when multi-sort is active) */
  priority: number;
  hasMultiSort: boolean;
};

export function SortIndicator({ direction, priority, hasMultiSort }: SortIndicatorProps) {
  return (
    <View style={styles.container}>
      <Ionicons
        name={direction === "asc" ? "arrow-up" : "arrow-down"}
        size={11}
        color={QUARTZ.accent}
      />
      {hasMultiSort && priority > 0 && (
        <Text style={textStyles.priority}>{priority}</Text>
      )}
    </View>
  );
}
