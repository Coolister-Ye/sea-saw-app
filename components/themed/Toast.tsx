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
} from "react-native-reanimated";
import {
  XCircleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/20/solid";

// Toast组件的Props类型定义
type ToastProps = {
  message?: string | null; // 消息内容
  info?: string[]; // 详细信息
  duration?: number; // 持续时间，默认为3000ms
  onClose?: () => void; // 动画结束时的回调
  variant?: "success" | "error" | "warning"; // 提示类型，默认为error
};

export default function Toast({
  message,
  info = [], // 默认空数组
  duration = 3000, // 默认持续3秒
  variant = "error", // 默认错误提示
  onClose,
}: ToastProps) {
  // 共享的透明度值，用于动画
  const opacity = useSharedValue(0);
  const visible = message && message.length > 0; // 如果有消息内容，则显示Toast

  useEffect(() => {
    if (visible) {
      // 如果消息可见，开始动画
      opacity.value = withSequence(
        withTiming(1, { duration: 300 }), // 淡入
        withDelay(
          duration,
          withTiming(0, { duration: 300 }, () => {
            // 动画结束后，调用onClose回调
            if (onClose) {
              runOnJS(onClose)();
            }
          })
        )
      );
    }
  }, [visible, duration, opacity, onClose]);

  // 动态设置样式和图标
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

  // 通过clsx合并类名
  const containerClassName = clsx("rounded-md p-4", styles.container);
  const iconClassName = clsx("h-5 w-5", styles.icon);
  const messageClassName = clsx("text-sm font-medium", styles.message);
  const infoClassName = clsx(styles.info);

  // 动画样式，使用共享值opacity来控制透明度
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  // 如果没有消息内容，返回null，不渲染
  if (!visible) return null;

  return (
    <Animated.View
      style={[animatedStyle]} // 使用动画样式
      className="fixed inset-x-0 top-5 items-center justify-center z-50 mx-5" // 固定位置和居中
      accessibilityRole="alert" // 声明该组件是一个提示
      accessibilityLabel={`Toast message: ${message}`} // 提示的消息内容
    >
      <View className={containerClassName}>
        <View className="flex flex-row">
          {/* 根据提示类型渲染不同的icon */}
          <styles.Icon className={iconClassName} />
          <View className="ml-2 flex-1">
            <Text className={messageClassName} accessibilityLabel={message}>
              {message} {/* 显示消息 */}
            </Text>
            {/* 如果有详细信息，渲染这些信息 */}
            {info.length > 0 && (
              <View className="p-1">
                {info.map((detail, index) => (
                  <Text className={clsx("text-sm", infoClassName)} key={index}>
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
