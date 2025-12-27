import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { ReactNode } from "react";

type EmptySlotProps = {
  message?: string;
  children?: ReactNode;
};

export default function EmptySlot({ message, children }: EmptySlotProps) {
  if (!children && !message) return null;

  return (
    <View className="p-3 border border-dashed border-gray-300 rounded-lg bg-gray-50 w-full">
      {children ? (
        children
      ) : (
        <Text className="text-gray-400 text-sm">{message}</Text>
      )}
    </View>
  );
}

export { EmptySlot };
