import clsx from "clsx";
import React from "react";
import { View, Text } from "react-native";

type DividerProps = {
  label: string;
  labelClassName?: string;
};

export default function Divider({ label, labelClassName }: DividerProps) {
  return (
    <View className="relative m-3">
      <View className="absolute inset-0 flex items-center justify-center">
        <View className="w-full border-t border-gray-300" />
      </View>
      <View className="relative flex-row justify-center">
        <Text
          className={clsx(
            "px-2 text-sm text-gray-500 bg-gray-300 shadow-md",
            labelClassName
          )}
        >
          {label}
        </Text>
      </View>
    </View>
  );
}
