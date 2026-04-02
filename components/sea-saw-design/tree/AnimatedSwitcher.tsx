import * as React from "react";
import { ActivityIndicator, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated";
import { ChevronRightIcon } from "react-native-heroicons/outline";
import type { TreeProps } from "./types";

interface AnimatedSwitcherProps {
  expanded: boolean;
  isLeaf: boolean;
  loading?: boolean;
  custom?: TreeProps["switcherIcon"];
}

export function AnimatedSwitcher({
  expanded,
  isLeaf,
  loading,
  custom,
}: AnimatedSwitcherProps) {
  const progress = useDerivedValue(() =>
    withTiming(expanded ? 1 : 0, { duration: 200 }),
  );
  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${progress.value * 90}deg` }],
  }));

  if (loading) {
    return (
      <View className="w-5 h-5 items-center justify-center">
        <ActivityIndicator size={12} color="#8c8c8c" />
      </View>
    );
  }

  if (isLeaf) {
    return <View className="w-5" />;
  }

  if (custom) {
    const rendered =
      typeof custom === "function" ? custom({ expanded, isLeaf, loading }) : custom;
    return <View className="w-5 h-5 items-center justify-center">{rendered}</View>;
  }

  return (
    <Animated.View style={rotateStyle} className="w-5 h-5 items-center justify-center">
      <ChevronRightIcon size={14} color="#8c8c8c" />
    </Animated.View>
  );
}
