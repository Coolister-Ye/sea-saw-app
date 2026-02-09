import React, { memo } from "react";
import { View, Pressable } from "react-native";
import { XMarkIcon, CheckIcon } from "react-native-heroicons/outline";

import { Text } from "@/components/sea-saw-design/text";
import { cn } from "@/lib/utils";
import i18n from "@/locale/i18n";
import ContactItem from "./ContactItem";
import type { Contact } from "./types";

interface SelectableContactItemProps {
  item: Contact;
  isSelected: boolean;
  isDisabled: boolean;
  onToggle: () => void;
}

export const SelectableContactItem = memo(
  ({ item, isSelected, isDisabled, onToggle }: SelectableContactItemProps) => (
    <Pressable
      onPress={isDisabled ? undefined : onToggle}
      disabled={isDisabled}
      className={cn(
        "flex-row items-center px-3 py-2.5 rounded-xl mb-1 border",
        isDisabled
          ? "bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed"
          : isSelected
            ? "bg-blue-50 border-blue-200"
            : "hover:bg-gray-50 border-transparent"
      )}
    >
      <View
        className={cn(
          "w-5 h-5 mr-3 rounded-full border-2 items-center justify-center",
          isDisabled
            ? "border-gray-300 bg-gray-300"
            : isSelected
              ? "border-blue-500 bg-blue-500"
              : "border-gray-300"
        )}
      >
        {(isSelected || isDisabled) && (
          <CheckIcon size={12} className="text-white" />
        )}
      </View>
      <ContactItem contact={item} />
      {isDisabled && (
        <Text className="text-xs text-gray-400 ml-auto">
          {i18n.t("Already added")}
        </Text>
      )}
    </Pressable>
  )
);
SelectableContactItem.displayName = "SelectableContactItem";

interface SelectedContactItemProps {
  item: Contact;
  onRemove: () => void;
}

export const SelectedContactItem = memo(
  ({ item, onRemove }: SelectedContactItemProps) => (
    <View className="flex-row justify-between items-center p-3 bg-gray-50 rounded-xl mb-1.5 border border-gray-100">
      <ContactItem contact={item} />
      <Pressable
        onPress={onRemove}
        className="p-1.5 rounded-full hover:bg-gray-200 active:bg-gray-300 transition-colors"
      >
        <XMarkIcon size={16} className="text-gray-400" />
      </Pressable>
    </View>
  )
);
SelectedContactItem.displayName = "SelectedContactItem";
