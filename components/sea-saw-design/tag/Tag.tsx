import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { cn } from "@/components/sea-saw-design/utils";
import type { PresetColor, StatusColor, TagProps } from "./types";
import {
  presetContainer,
  presetText,
  statusContainer,
  statusText,
  resolveColorKind,
} from "./colors";

const Tag: React.FC<TagProps> = ({
  color,
  bordered = false,
  icon,
  closable = false,
  closeIcon,
  onClose,
  onPress,
  disabled = false,
  children,
  className,
  style,
  labelStyle,
}) => {
  const [visible, setVisible] = useState(true);

  const kind = resolveColorKind(color);
  const isCustom = kind === "custom";
  const isPreset = kind === "preset";
  const isStatus = kind === "status";
  // antd: line-height = lineHeightSM(1.6667) × fontSizeSM(12) = 20px → leading-5
  const statusKey = (
    isStatus ? (color ?? "default") : "default"
  ) as StatusColor;
  const presetKey = (isPreset ? color : undefined) as PresetColor | undefined;

  const containerClass = cn(
    "flex-row items-center rounded border px-[7px] py-0 w-fit",
    isCustom && "border-transparent",
    isPreset && presetContainer[presetKey!],
    isStatus && statusContainer[statusKey],
    !bordered && "border-transparent",
    disabled && "opacity-50",
    className,
  );

  const containerStyle = isCustom
    ? [{ backgroundColor: color, borderColor: "transparent" }, style]
    : [style];

  const textClass = cn(
    "text-xs",
    isCustom && "text-white",
    isPreset && presetText[presetKey!],
    isStatus && statusText[statusKey],
  );

  // closeIcon=false|null hides button; closeIcon=true or closable=true shows default ✕
  const showClose =
    closeIcon === true ||
    (closable && closeIcon !== false && closeIcon !== null);

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  if (!visible) return null;

  const inner = (
    <>
      {/* Prefix icon — antd gap = paddingInline = 7px */}
      {icon && <View style={{ marginRight: 7 }}>{icon}</View>}

      <Text className={textClass} style={labelStyle}>
        {children}
      </Text>

      {/* Close button — antd: iconMarginInline = paddingXXS(4) - lineWidth(1) = 3px */}
      {showClose && (
        <Pressable
          onPress={handleClose}
          style={{ marginLeft: 3 }}
          hitSlop={6}
          disabled={disabled}
        >
          {typeof closeIcon === "boolean" || closeIcon === undefined ? (
            /* antd: tagIconSize = fontSizeIcon(12) - 2×lineWidth(1) = 10px */
            <Text
              className={cn(textClass, "opacity-60")}
              style={{ fontSize: 10, lineHeight: 20 }}
            >
              ✕
            </Text>
          ) : (
            closeIcon
          )}
        </Pressable>
      )}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        className={containerClass}
        style={containerStyle as any}
        disabled={disabled}
      >
        {inner}
      </Pressable>
    );
  }

  return (
    <View className={containerClass} style={containerStyle as any}>
      {inner}
    </View>
  );
};

export default Tag;
