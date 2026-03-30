import React from "react";
import { View, Pressable } from "react-native";
import { XMarkIcon } from "react-native-heroicons/outline";

import { Text } from "@/components/sea-saw-design/text";
import ContactPopover from "@/components/sea-saw-page/crm/contact/display/ContactPopover";

import type { Contact } from "./types";

interface ContactChipProps {
  item: Contact;
  def?: Record<string, any>;
  onRemove: () => void;
  readOnly?: boolean;
}

export function ContactChip({ item, def, onRemove, readOnly }: ContactChipProps) {
  return (
    <ContactPopover value={item} def={def}>
      <View className="flex-row items-center">
        <Text className="text-sm text-blue-600 underline decoration-blue-300 underline-offset-2 hover:text-blue-700 cursor-pointer">
          {item.name}
        </Text>
        {!readOnly && (
          <Pressable
            onPress={onRemove}
            className="ml-1 p-0.5 rounded-full active:opacity-70 hover:bg-gray-100"
          >
            <XMarkIcon size={12} className="text-blue-400" />
          </Pressable>
        )}
      </View>
    </ContactPopover>
  );
}
