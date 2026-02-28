import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { cn } from "@/components/sea-saw-design/utils";
import type { PresetColor, Variant, TagProps } from "./types";

export type { TagProps } from "./types";

// Container (bg + border) per variant
const colorContainerMap: Record<PresetColor, Record<Variant, string>> = {
  grey: {
    filled: "bg-gray-100 border-gray-300",
    outlined: "bg-transparent border-gray-300",
    solid: "bg-gray-500 border-transparent",
  },
  red: {
    filled: "bg-red-100 border-red-300",
    outlined: "bg-transparent border-red-300",
    solid: "bg-red-500 border-transparent",
  },
  orange: {
    filled: "bg-orange-100 border-orange-300",
    outlined: "bg-transparent border-orange-300",
    solid: "bg-orange-500 border-transparent",
  },
  yellow: {
    filled: "bg-yellow-100 border-yellow-300",
    outlined: "bg-transparent border-yellow-300",
    solid: "bg-yellow-500 border-transparent",
  },
  green: {
    filled: "bg-green-100 border-green-300",
    outlined: "bg-transparent border-green-300",
    solid: "bg-green-500 border-transparent",
  },
  cyan: {
    filled: "bg-cyan-100 border-cyan-300",
    outlined: "bg-transparent border-cyan-300",
    solid: "bg-cyan-500 border-transparent",
  },
  blue: {
    filled: "bg-blue-100 border-blue-300",
    outlined: "bg-transparent border-blue-300",
    solid: "bg-blue-500 border-transparent",
  },
  purple: {
    filled: "bg-purple-100 border-purple-300",
    outlined: "bg-transparent border-purple-300",
    solid: "bg-purple-500 border-transparent",
  },
  pink: {
    filled: "bg-pink-100 border-pink-300",
    outlined: "bg-transparent border-pink-300",
    solid: "bg-pink-500 border-transparent",
  },
};

const colorTextMap: Record<PresetColor, string> = {
  grey: "text-gray-500",
  red: "text-red-500",
  orange: "text-orange-500",
  yellow: "text-yellow-500",
  green: "text-green-500",
  cyan: "text-cyan-500",
  blue: "text-blue-500",
  purple: "text-purple-500",
  pink: "text-pink-500",
};

const defaultContainerMap: Record<Variant, string> = {
  filled: "bg-zinc-100 border-zinc-300",
  outlined: "bg-transparent border-zinc-300",
  solid: "bg-blue-600 border-transparent",
};

const Tag: React.FC<TagProps> = ({
  color,
  variant = "filled",
  icon,
  closable = false,
  closeIcon,
  onClose,
  disabled = false,
  classNames: semanticClassNames,
  styles: semanticStyles,
  checkable = false,
  checked,
  defaultChecked = false,
  onChange,
  children,
  className,
}) => {
  const [visible, setVisible] = useState(true);
  const [internalChecked, setInternalChecked] = useState(defaultChecked);

  const isControlled = checked !== undefined;
  const isChecked = isControlled ? checked : internalChecked;

  // Checked state forces solid variant (filled with deep color)
  const activeVariant: Variant = isChecked ? "solid" : variant;
  const isSolid = activeVariant === "solid";

  const containerClass = cn(
    "flex-row items-center rounded border w-fit px-2 py-0.5",
    color
      ? colorContainerMap[color][activeVariant]
      : defaultContainerMap[activeVariant],
    disabled && "opacity-50",
    className,
    semanticClassNames?.root,
  );

  const textClass = cn(
    "text-xs leading-[1.571]",
    isSolid ? "text-white" : color ? colorTextMap[color] : "text-zinc-500",
    semanticClassNames?.label,
  );

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  const handleCheck = () => {
    if (disabled) return;
    const next = !isChecked;
    if (!isControlled) setInternalChecked(next);
    onChange?.(next);
  };

  // closeIcon={null} or closeIcon={false} hides the button (Ant Design 5.7.0+)
  const showCloseBtn = closable && closeIcon !== null && closeIcon !== false;

  if (!visible) return null;

  const body = (
    <>
      {icon && <View className="mr-1">{icon}</View>}
      <Text className={textClass} style={semanticStyles?.label}>
        {children}
      </Text>
      {showCloseBtn && (
        <Pressable
          onPress={handleClose}
          className={cn("ml-1", semanticClassNames?.closeBtn)}
          style={semanticStyles?.closeBtn}
          hitSlop={4}
          disabled={disabled}
        >
          {closeIcon !== undefined ? (
            closeIcon
          ) : (
            <Text className={cn(textClass, "opacity-60")}>×</Text>
          )}
        </Pressable>
      )}
    </>
  );

  if (checkable) {
    return (
      <Pressable
        onPress={handleCheck}
        className={containerClass}
        style={semanticStyles?.root}
        disabled={disabled}
      >
        {body}
      </Pressable>
    );
  }

  return (
    <View className={containerClass} style={semanticStyles?.root}>
      {body}
    </View>
  );
};

export default Tag;
