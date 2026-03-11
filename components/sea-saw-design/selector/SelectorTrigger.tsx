import React, { ReactNode } from "react";
import { View, Pressable, ScrollView } from "react-native";
import {
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from "react-native-heroicons/outline";

import { Text } from "@/components/sea-saw-design/text";
import { cn } from "@/lib/utils";

export interface SelectorTriggerProps {
  disabled?: boolean;
  onPress?: () => void;
  placeholder?: string;
  placeholderIcon?: ReactNode;
  hasSelection?: boolean;
  renderSelected?: () => ReactNode;
  /** Use horizontal scroll for selected items (default: true) */
  horizontalScroll?: boolean;
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
  return (
    <Pressable
      disabled={disabled}
      onPress={() => !disabled && onPress?.()}
      className={cn(
        "min-h-8 px-3 py-1.5 border rounded-md bg-white flex-row items-center",
        disabled
          ? "bg-gray-50 border-gray-200 cursor-not-allowed"
          : "border-gray-300 hover:border-blue-500 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10",
        className,
      )}
    >
      {/* Content area */}
      <View className="flex-1 flex-row items-center">
        {!hasSelection ? (
          <>
            {placeholderIcon ?? (
              <MagnifyingGlassIcon size={16} className="text-gray-400 mr-2" />
            )}
            <Text className="text-gray-400 text-sm">{placeholder}</Text>
          </>
        ) : horizontalScroll ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flex: 1 }}
            contentContainerStyle={{ alignItems: "center", flexGrow: 1 }}
          >
            {renderSelected?.()}
          </ScrollView>
        ) : (
          <View className="flex-row flex-wrap items-center gap-1">
            {renderSelected?.()}
          </View>
        )}
      </View>

      {/* Chevron */}
      {!disabled && (
        <ChevronDownIcon size={18} className="text-gray-400 ml-2 self-center" />
      )}
    </Pressable>
  );
}

export default SelectorTrigger;
