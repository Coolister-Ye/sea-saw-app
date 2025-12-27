import clsx from "clsx";
import React, { useEffect, useMemo } from "react";
import { View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
  withSequence,
  cancelAnimation,
} from "react-native-reanimated";
import {
  XCircleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "react-native-heroicons/solid";

export type ToastProps = {
  message?: string | null;
  info?: string[];
  duration?: number;
  onClose?: () => void;
  variant?: "success" | "error" | "warning" | "default";
  timestamp?: number; // 用来触发新的 toast
};

/** 统一的样式 */
const VARIANT_STYLES = {
  error: {
    container: "bg-red-50",
    icon: "text-red-400",
    message: "text-red-800",
    info: "text-red-700",
    Icon: XCircleIcon,
  },
  success: {
    container: "bg-green-50",
    icon: "text-green-400",
    message: "text-green-800",
    info: "text-green-700",
    Icon: CheckCircleIcon,
  },
  warning: {
    container: "bg-yellow-50",
    icon: "text-yellow-400",
    message: "text-yellow-800",
    info: "text-yellow-700",
    Icon: ExclamationCircleIcon,
  },
  default: {
    container: "bg-gray-50",
    icon: "text-gray-400",
    message: "text-gray-800",
    info: "text-gray-700",
    Icon: XCircleIcon,
  },
};

export function Toast({
  message,
  info,
  duration = 3000,
  variant = "default",
  timestamp,
  onClose,
}: ToastProps) {
  const opacity = useSharedValue(0);
  const visible = !!message;

  /** 归一化 info 为稳定数组（避免 undefined 报错） */
  const safeInfo = info ?? [];

  /** 触发动画 */
  useEffect(() => {
    if (!visible) return;

    cancelAnimation(opacity);
    opacity.value = 0;

    opacity.value = withSequence(
      withTiming(1, { duration: 250 }),
      withDelay(
        duration,
        withTiming(0, { duration: 250 }, (finished) => {
          if (finished && onClose) runOnJS(onClose)();
        })
      )
    );
  }, [message, timestamp]);

  /** variant 样式 */
  const styles = VARIANT_STYLES[variant];
  const Icon = styles.Icon;

  const classNames = useMemo(
    () => ({
      container: clsx("rounded-md p-4 flex-row", styles.container),
      icon: clsx("h-5 w-5", styles.icon),
      message: clsx("text-sm font-medium", styles.message),
      info: clsx("text-sm", styles.info),
    }),
    [variant]
  );

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View
      style={[animatedStyle]}
      className="fixed inset-x-0 top-5 items-center justify-center z-50 mx-5"
      accessibilityRole="alert"
      accessibilityLabel={`Toast message: ${message}`}
    >
      <View className={classNames.container}>
        <Icon className={classNames.icon} />

        <View className="ml-2 flex-1">
          <Text
            className={classNames.message}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {message}
          </Text>

          {safeInfo.length > 0 && (
            <View className="mt-1">
              {safeInfo.map((detail, idx) => (
                <Text
                  key={idx}
                  className={classNames.info}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {detail}
                </Text>
              ))}
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

export default Toast;
