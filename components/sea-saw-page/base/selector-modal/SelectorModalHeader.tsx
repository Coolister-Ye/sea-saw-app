import React, { memo } from "react";
import { View, Pressable } from "react-native";
import { XMarkIcon } from "react-native-heroicons/outline";

import { Text } from "@/components/sea-saw-design/text";

export interface SelectorModalHeaderProps {
  /** Icon element rendered inside the colored box */
  icon: React.ReactNode;
  /** Modal title */
  title: string;
  /** Optional subtitle below title */
  subtitle?: string;
  /** Close button handler */
  onClose: () => void;
}

const SelectorModalHeader = memo(
  ({ icon, title, subtitle, onClose }: SelectorModalHeaderProps) => (
    <View className="flex-row items-center justify-between px-5 py-2.5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
      <View className="flex-row items-center">
        <View className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 items-center justify-center mr-3 shadow-sm">
          {icon}
        </View>
        <View>
          <Text className="text-lg font-semibold text-gray-800">{title}</Text>
          {subtitle && (
            <Text className="text-xs text-gray-500">{subtitle}</Text>
          )}
        </View>
      </View>
      <Pressable
        onPress={onClose}
        className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
      >
        <XMarkIcon size={20} className="text-gray-500" />
      </Pressable>
    </View>
  ),
);

SelectorModalHeader.displayName = "SelectorModalHeader";

export default SelectorModalHeader;
export { SelectorModalHeader };
