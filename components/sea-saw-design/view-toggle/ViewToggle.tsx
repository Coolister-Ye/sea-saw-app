import React from "react";
import { View, Pressable, Animated } from "react-native";
import { Text } from "@/components/sea-saw-design/text";

export type ViewToggleOption<T extends string = string> = {
  value: T;
  label: string;
  icon?: React.ReactNode;
};

interface ViewToggleProps<T extends string = string> {
  options: ViewToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "pill" | "minimal";
}

export function ViewToggle<T extends string = string>({
  options,
  value,
  onChange,
  size = "md",
  variant = "default",
}: ViewToggleProps<T>) {
  // Size configurations
  const sizeConfig = {
    sm: {
      container: "p-0.5",
      button: "px-2.5 py-1 gap-1",
      icon: 12,
      text: "text-[10px]",
      minWidth: "min-w-[60px]",
    },
    md: {
      container: "p-0.5",
      button: "px-3 py-1.5 gap-1.5",
      icon: 14,
      text: "text-xs",
      minWidth: "min-w-[80px]",
    },
    lg: {
      container: "p-1",
      button: "px-4 py-2 gap-2",
      icon: 16,
      text: "text-sm",
      minWidth: "min-w-[100px]",
    },
  };

  // Variant styles
  const variantStyles = {
    default: {
      container:
        "bg-gradient-to-br from-slate-50 to-slate-100/80 rounded-lg border border-slate-200/60 shadow-sm",
      activeButton:
        "bg-white shadow-md border border-slate-200/80 shadow-slate-200/50",
      inactiveButton: "bg-transparent",
      activeIcon: "#3b82f6",
      inactiveIcon: "#94a3b8",
      activeText: "text-blue-600 font-semibold",
      inactiveText: "text-slate-500 font-medium",
    },
    pill: {
      container:
        "bg-gradient-to-r from-blue-50 via-indigo-50 to-violet-50 rounded-full border border-blue-100 shadow-sm",
      activeButton:
        "bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-200/50 border-0",
      inactiveButton: "bg-transparent",
      activeIcon: "#ffffff",
      inactiveIcon: "#94a3b8",
      activeText: "text-white font-bold",
      inactiveText: "text-slate-600 font-medium",
    },
    minimal: {
      container: "bg-transparent rounded-lg border-0",
      activeButton: "bg-slate-100 border-0",
      inactiveButton: "bg-transparent",
      activeIcon: "#1e293b",
      inactiveIcon: "#cbd5e1",
      activeText: "text-slate-900 font-semibold",
      inactiveText: "text-slate-400 font-normal",
    },
  };

  const config = sizeConfig[size];
  const styles = variantStyles[variant];

  return (
    <View
      className={`flex-row ${styles.container} ${config.container} gap-0.5`}
    >
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            className={`flex-row items-center justify-center rounded-md ${config.button} ${config.minWidth} ${
              isActive ? styles.activeButton : styles.inactiveButton
            }`}
            style={{
              // Add subtle press animation
              transform: [{ scale: 1 }],
            }}
          >
            {option.icon &&
              React.cloneElement(option.icon as React.ReactElement, {
                style: {
                  fontSize: config.icon,
                  color: isActive ? styles.activeIcon : styles.inactiveIcon,
                },
              })}
            <Text
              className={`${config.text} ${
                isActive ? styles.activeText : styles.inactiveText
              }`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
