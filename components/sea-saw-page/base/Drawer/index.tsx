import { useCallback, useMemo } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import Modal from "react-native-modal";
import { Ionicons } from "@expo/vector-icons";
import { DrawerProps } from "./types";

export default function Drawer({
  open,
  onClose,
  children,
  width = 900,
  title,
  footer,
  mask = true,
  maskClosable = true,
  maskOpacity = 0.1,
  closable = true,
  closeIcon,
  placement = "right",
}: DrawerProps) {
  // 优化：使用 useCallback 避免不必要的重新渲染
  const handleBackdropPress = useCallback(() => {
    if (maskClosable) {
      onClose();
    }
  }, [maskClosable, onClose]);

  const handleClosePress = useCallback(() => {
    onClose();
  }, [onClose]);

  // 根据 placement 计算动画方向
  const animationConfig = useMemo(() => {
    switch (placement) {
      case "left":
        return { in: "slideInLeft", out: "slideOutLeft" };
      case "top":
        return { in: "slideInDown", out: "slideOutUp" };
      case "bottom":
        return { in: "slideInUp", out: "slideOutDown" };
      case "right":
      default:
        return { in: "slideInRight", out: "slideOutRight" };
    }
  }, [placement]);

  // 根据 placement 计算位置样式
  const positionStyle = useMemo(() => {
    switch (placement) {
      case "left":
        return "absolute inset-y-0 left-0";
      case "top":
        return "absolute inset-x-0 top-0";
      case "bottom":
        return "absolute inset-x-0 bottom-0";
      case "right":
      default:
        return "absolute inset-y-0 right-0";
    }
  }, [placement]);

  return (
    <Modal
      isVisible={open}
      animationIn={animationConfig.in as any}
      animationOut={animationConfig.out as any}
      style={{ margin: 0 }}
      backdropOpacity={mask ? maskOpacity : 0}
      onBackdropPress={handleBackdropPress}
      hasBackdrop={mask}
      useNativeDriver
      hideModalContentWhileAnimating
    >
      <View className="flex-1 relative">
        {/* 关闭按钮 */}
        {closable && (
          <TouchableOpacity
            onPress={handleClosePress}
            className="absolute top-5 right-5 z-50"
            accessibilityLabel="Close Drawer"
            accessibilityRole="button"
          >
            {closeIcon || <Ionicons name="close" size={24} color="black" />}
          </TouchableOpacity>
        )}

        {/* Drawer 内容区 */}
        <View
          style={{ width }}
          className={`${positionStyle} bg-white shadow-xl flex-col`}
        >
          {/* Title (可选) */}
          {title && (
            <View className="px-6 py-4 border-b border-gray-200">
              {typeof title === "string" ? (
                <Text className="text-lg font-semibold">{title}</Text>
              ) : (
                title
              )}
            </View>
          )}

          {/* Content */}
          <View className="flex-1 overflow-hidden">{children}</View>

          {/* Footer (可选) */}
          {footer && (
            <View className="px-6 py-4 border-t border-gray-200">{footer}</View>
          )}
        </View>
      </View>
    </Modal>
  );
}

export { Drawer };
export type { DrawerProps };
