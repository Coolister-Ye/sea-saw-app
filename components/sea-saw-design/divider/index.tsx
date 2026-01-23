import clsx from "clsx";
import React, { ReactNode } from "react";
import { View, Text } from "react-native";

export type DividerProps = {
  /** Divider type: horizontal or vertical */
  type?: "horizontal" | "vertical";
  /** Position of the content within the divider */
  orientation?: "left" | "center" | "right";
  /** Margin between content and the divider line (in pixels) */
  orientationMargin?: number;
  /** Whether to use dashed style */
  dashed?: boolean;
  /** Whether to use plain text style (no background, lighter text) */
  plain?: boolean;
  /** Content to display within the divider */
  children?: ReactNode;
  /** Additional className for the container */
  className?: string;
  /** Additional className for the text */
  textClassName?: string;
};

export default function Divider({
  type = "horizontal",
  orientation = "center",
  orientationMargin,
  dashed = false,
  plain = false,
  children,
  className,
  textClassName,
}: DividerProps) {
  // Vertical divider
  if (type === "vertical") {
    return (
      <View
        className={clsx(
          "mx-2 self-stretch",
          dashed ? "border-l border-dashed" : "border-l",
          "border-slate-200 dark:border-slate-700",
          className
        )}
      />
    );
  }

  // Horizontal divider without content
  if (!children) {
    return (
      <View
        className={clsx(
          "my-4 w-full",
          dashed ? "border-t border-dashed" : "border-t",
          "border-slate-200 dark:border-slate-700",
          className
        )}
      />
    );
  }

  // Horizontal divider with content
  const marginStyle = orientationMargin !== undefined ? { marginHorizontal: orientationMargin } : undefined;

  const lineClassName = clsx(
    "h-px",
    dashed ? "border-t border-dashed" : "bg-slate-200 dark:bg-slate-700",
    dashed && "border-slate-200 dark:border-slate-700"
  );

  const textContent = (
    <Text
      style={marginStyle}
      className={clsx(
        "text-sm",
        plain
          ? "text-slate-500 dark:text-slate-400"
          : "text-slate-600 dark:text-slate-300 font-medium",
        !orientationMargin && "px-4",
        textClassName
      )}
    >
      {children}
    </Text>
  );

  return (
    <View
      className={clsx(
        "my-4 flex flex-row items-center w-full",
        className
      )}
    >
      {orientation === "left" && (
        <>
          <View className={clsx(lineClassName, "w-6")} />
          {textContent}
          <View className={clsx(lineClassName, "flex-1")} />
        </>
      )}
      {orientation === "center" && (
        <>
          <View className={clsx(lineClassName, "flex-1")} />
          {textContent}
          <View className={clsx(lineClassName, "flex-1")} />
        </>
      )}
      {orientation === "right" && (
        <>
          <View className={clsx(lineClassName, "flex-1")} />
          {textContent}
          <View className={clsx(lineClassName, "w-6")} />
        </>
      )}
    </View>
  );
}

// Named export for convenience
export { Divider };
