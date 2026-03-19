import React, { useState } from "react";
import { Pressable, Text } from "react-native";
import { cn } from "@/components/sea-saw-design/utils";
import type { CheckableTagProps } from "./types";

export const CheckableTag: React.FC<CheckableTagProps> = ({
  checked,
  defaultChecked = false,
  onChange,
  disabled = false,
  children,
  className,
  style,
  labelStyle,
}) => {
  const [internal, setInternal] = useState(defaultChecked);
  const isControlled = checked !== undefined;
  const active = isControlled ? checked! : internal;

  const handlePress = () => {
    if (disabled) return;
    const next = !active;
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      className={cn(
        "flex-row items-center self-start rounded px-[7px] py-0",
        active ? "bg-blue-500" : "bg-gray-100",
        disabled && "opacity-50",
        className,
      )}
      style={style}
    >
      <Text
        className={cn(
          "text-xs leading-5",
          active ? "text-white" : "text-gray-600",
        )}
        style={labelStyle}
      >
        {children}
      </Text>
    </Pressable>
  );
};
