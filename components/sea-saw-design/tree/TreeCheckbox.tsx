import * as React from "react";
import { Pressable, View } from "react-native";
import { cn } from "../utils";

interface TreeCheckboxProps {
  checked: boolean;
  halfChecked: boolean;
  disabled?: boolean;
  onPress: () => void;
}

export function TreeCheckbox({
  checked,
  halfChecked,
  disabled,
  onPress,
}: TreeCheckboxProps) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      className={cn(
        "w-4 h-4 mr-1.5 rounded-sm border items-center justify-center",
        checked
          ? "bg-primary border-primary"
          : halfChecked
            ? "bg-primary/10 border-primary/60"
            : "bg-white border-border",
        disabled && "opacity-40",
      )}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: checked || (halfChecked ? "mixed" : false) }}
    >
      {checked && (
        <View
          style={{
            width: 9,
            height: 5,
            borderLeftWidth: 1.5,
            borderBottomWidth: 1.5,
            borderColor: "#fff",
            transform: [{ rotate: "-45deg" }, { translateY: -1 }],
          }}
        />
      )}
      {halfChecked && !checked && (
        <View className="w-2 h-0.5 bg-primary" />
      )}
    </Pressable>
  );
}
