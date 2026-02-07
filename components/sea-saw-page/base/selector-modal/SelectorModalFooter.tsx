import React, { memo } from "react";
import { View } from "react-native";
import { CheckIcon } from "react-native-heroicons/outline";
import i18n from "@/locale/i18n";

import { Text } from "@/components/sea-saw-design/text";
import { Button } from "@/components/sea-saw-design/button";

export interface SelectorModalFooterProps {
  /** Currently selected items */
  selected: Array<{ id: string | number; [key: string]: any }>;
  /** Whether multiple selection is allowed */
  multiple: boolean;
  /** Disable confirm button while loading */
  loading?: boolean;
  /** Field name to display for single selection indicator (default: "name") */
  displayField?: string;
  /** Text shown when nothing is selected */
  emptyText?: string;
  /** Clear all selections */
  onClear: () => void;
  /** Cancel / close modal */
  onCancel: () => void;
  /** Confirm selection */
  onConfirm: () => void;
}

const SelectorModalFooter = memo(
  ({
    selected,
    multiple,
    loading = false,
    displayField = "name",
    emptyText,
    onClear,
    onCancel,
    onConfirm,
  }: SelectorModalFooterProps) => (
    <View className="flex-row max-sm:flex-col max-sm:gap-3 items-center justify-between px-5 py-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
      {/* Selected count indicator */}
      <View className="flex-row items-center">
        {multiple && selected.length > 0 && (
          <View className="flex-row items-center bg-blue-100 px-3 py-1.5 rounded-full">
            <View className="w-5 h-5 rounded-full bg-blue-500 items-center justify-center mr-2">
              <Text className="text-white text-xs font-bold">
                {selected.length}
              </Text>
            </View>
            <Text className="text-sm text-blue-700 font-medium">
              {i18n.t("selected")}
            </Text>
          </View>
        )}
        {!multiple && selected.length > 0 && (
          <View className="flex-row items-center bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
            <CheckIcon size={14} className="text-emerald-500 mr-1.5" />
            <Text className="text-sm text-emerald-700 font-medium">
              {selected[0]?.[displayField]}
            </Text>
          </View>
        )}
        {selected.length === 0 && (
          <Text className="text-sm text-gray-400 italic">
            {emptyText || i18n.t("No selection")}
          </Text>
        )}
      </View>

      {/* Action buttons */}
      <View className="flex-row items-center gap-2">
        {selected.length > 0 && (
          <Button onPress={onClear} className="hover:bg-red-50">
            <Text className="text-red-500 text-sm">{i18n.t("Clear")}</Text>
          </Button>
        )}
        <Button onPress={onCancel}>
          <Text className="text-gray-600">{i18n.t("Cancel")}</Text>
        </Button>
        <Button onPress={onConfirm} disabled={loading} type="primary">
          {i18n.t("Confirm")}
        </Button>
      </View>
    </View>
  ),
);

SelectorModalFooter.displayName = "SelectorModalFooter";

export default SelectorModalFooter;
export { SelectorModalFooter };
