import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import clsx from "clsx";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

const presetColors = {
  red: "red",
  orange: "orange",
  yellow: "yellow",
  green: "green",
  cyan: "cyan",
  blue: "blue",
  purple: "purple",
  pink: "pink",
  grey: "gray",
};

const getColorStyles = (
  color: keyof typeof presetColors | undefined,
  bordered: boolean,
  checked: boolean
) => {
  const defaultStyle = bordered
    ? "bg-zinc-200 text-zinc-500 border-zinc-400"
    : "bg-zinc-200 text-zinc-500 border-transparent";

  const colorStyleMap = {
    grey: "bg-gray-100 text-gray-500 border-gray-300",
    red: "bg-red-100 text-red-500 border-red-300",
    orange: "bg-orange-100 text-orange-500 border-orange-300",
    yellow: "bg-yellow-100 text-yellow-500 border-yellow-300",
    green: "bg-green-100 text-green-500 border-green-300",
    cyan: "bg-cyan-100 text-cyan-500 border-cyan-300",
    blue: "bg-blue-100 text-blue-500 border-blue-300",
    purple: "bg-purple-100 text-purple-500 border-purple-300",
    pink: "bg-pink-100 text-pink-500 border-pink-300",
  };

  const colorStyleMapChecked = {
    grey: "bg-gray-500 text-white",
    red: "bg-red-500 text-white",
    orange: "bg-orange-500 text-white",
    yellow: "bg-yellow-500 text-white",
    green: "bg-green-500 text-white",
    cyan: "<bg-cyan-500></bg-cyan-5>00 text-white",
    blue: "bg-blue-500 text-white",
    purple: "bg-purple-500 text-white",
    pink: "bg-pink-500 text-white",
  };

  const style = (color && colorStyleMap[color]) || defaultStyle;
  const style4Checked =
    (color && colorStyleMapChecked[color]) ||
    "!bg-blue-700 !text-white !border-transparent";

  return clsx(
    bordered ? style : style.replace(/border-[^ ]+/, "border-transparent"),
    checked ? style4Checked : ""
  );
};

export interface TagProps {
  color?: keyof typeof presetColors;
  closable?: boolean;
  closeIcon?: React.ReactNode;
  onClose?: () => void;
  icon?: React.ReactNode;
  bordered?: boolean;
  checkable?: boolean;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  children?: React.ReactNode;
  containerClassName?: string;
  textClassName?: string;
}

const Tag: React.FC<TagProps> = ({
  color,
  closable = false,
  closeIcon,
  onClose,
  icon,
  bordered = true,
  checkable = false,
  checked = false,
  onChange,
  children,
  containerClassName,
  textClassName,
}) => {
  const [visible, setVisible] = useState(true);
  const [isChecked, setIsChecked] = useState(checked);

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  const handleCheck = () => {
    const newChecked = !isChecked;
    setIsChecked(newChecked);
    onChange?.(newChecked);
  };

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      className={clsx(
        "flex-row items-center rounded border w-fit px-1",
        getColorStyles(color, bordered, isChecked),
        containerClassName
      )}
    >
      {icon && <View className="mr-2">{icon}</View>}
      <Pressable onPress={checkable ? handleCheck : undefined}>
        <Text
          className={clsx(
            "text-[12px] leading-[1.571]",
            isChecked && "font-bold text-[#1677ff]",
            getColorStyles(color, bordered, isChecked)
            // textClassName
          )}
        >
          {children}
        </Text>
      </Pressable>
      {closable && (
        <Pressable onPress={handleClose} className="ml-1">
          {closeIcon || (
            <Text
              className={clsx(
                "text-gray-400 text-[12px] leading-[1.571]",
                getColorStyles(color, bordered, isChecked),
                textClassName
              )}
            >
              ×
            </Text>
          )}
        </Pressable>
      )}
    </Animated.View>
  );
};

export default Tag;
