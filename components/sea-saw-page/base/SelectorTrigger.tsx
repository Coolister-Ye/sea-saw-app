import React, { ReactNode } from "react";
import { View, Pressable, ScrollView } from "react-native";
import {
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from "react-native-heroicons/outline";

import { Text } from "@/components/sea-saw-design/text";
import { cn } from "@/lib/utils";

export interface SelectorTriggerProps {
  /** Whether the trigger is disabled/read-only */
  disabled?: boolean;
  /** Callback when trigger is pressed */
  onPress?: () => void;
  /** Placeholder text when nothing is selected */
  placeholder?: string;
  /** Custom placeholder icon (defaults to MagnifyingGlassIcon) */
  placeholderIcon?: ReactNode;
  /** Whether there are selected items */
  hasSelection?: boolean;
  /** Render function for selected items */
  renderSelected?: () => ReactNode;
  /** Whether to use horizontal scroll for selected items (default: true) */
  horizontalScroll?: boolean;
  /** Additional className for the container */
  className?: string;
}

export function SelectorTrigger({
  disabled = false,
  onPress,
  placeholder,
  placeholderIcon,
  hasSelection = false,
  renderSelected,
  horizontalScroll = true,
  className,
}: SelectorTriggerProps) {
  const defaultIcon = (
    <MagnifyingGlassIcon size={16} className="text-gray-400 mr-2" />
  );

  return (
    <Pressable
      disabled={disabled}
      onPress={() => !disabled && onPress?.()}
      className={cn(
        "min-h-8 px-3 py-1 border rounded-md bg-white flex-row flex-wrap items-center",
        disabled
          ? "bg-gray-50 border-gray-200 cursor-not-allowed"
          : "border-gray-300 hover:border-blue-500 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10",
        className
      )}
    >
      {!hasSelection ? (
        <View className="flex-row items-center flex-1">
          {placeholderIcon ?? defaultIcon}
          <Text className="text-gray-400 text-sm">{placeholder}</Text>
        </View>
      ) : horizontalScroll ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-1"
          contentContainerStyle={{ alignItems: "center" }}
        >
          {renderSelected?.()}
        </ScrollView>
      ) : (
        <View className="flex-row flex-wrap items-center gap-1 flex-1">
          {renderSelected?.()}
        </View>
      )}
      {!disabled && (
        <View className="ml-2">
          <ChevronDownIcon size={18} className="text-gray-400" />
        </View>
      )}
    </Pressable>
  );
}

export default SelectorTrigger;
