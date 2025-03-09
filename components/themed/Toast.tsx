import clsx from "clsx";
import React, { useEffect, useMemo, useRef } from "react";
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
} from "@heroicons/react/20/solid";

// Toast组件的Props类型定义
export type ToastProps = {
  message?: string | null;
  info?: string[];
  duration?: number;
  onClose?: () => void;
  variant?: "success" | "error" | "warning";
  timestamp?: number;
};

export function Toast(props: ToastProps) {
  const {
    message,
    info,
    duration = 3000,
    variant = "error",
    timestamp,
    onClose,
  } = props;
  const opacity = useSharedValue(0);
  const visible = message && message.length > 0;
  const prevProps = useRef<any>(props);

  useEffect(() => {
    if (visible) {
      if (prevProps.current !== null) {
        cancelAnimation(opacity);
        opacity.value = 0;
      }
      opacity.value = withSequence(
        withTiming(1, { duration: 500 }),
        withDelay(
          duration,
          withTiming(0, { duration: 500 }, (finshed) => {
            // If the flag is true, it means the animation is finshed
            if (finshed && onClose) {
              runOnJS(onClose)();
              prevProps.current = null;
            }
          })
        )
      );
    }
  }, [props]);

  const styles = useMemo(() => {
    const classNames = {
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
    };
    return classNames[variant];
  }, [variant]);

  const containerClassName = clsx("rounded-md p-4", styles.container);
  const iconClassName = clsx("h-5 w-5", styles.icon);
  const messageClassName = clsx("text-sm font-medium", styles.message);
  const infoClassName = clsx(styles.info);

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
      <View className={containerClassName}>
        <View className="flex flex-row">
          <styles.Icon className={iconClassName} />
          <View className="ml-2 flex-1">
            <Text
              className={messageClassName}
              accessibilityLabel={message}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {message}
            </Text>
            {info && info.length > 0 && (
              <View className="p-1">
                {info.map((detail, index) => (
                  <Text
                    key={index}
                    className={clsx("text-sm", infoClassName)}
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
      </View>
    </Animated.View>
  );
}
