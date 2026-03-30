import React from "react";
import { View, Pressable } from "react-native";
import { XMarkIcon } from "react-native-heroicons/outline";

import { Text } from "@/components/sea-saw-design/text";
import { BankAccountPopover } from "@/components/sea-saw-page/crm/bank-account/display";

import type { BankAccount } from "./types";

interface BankAccountChipProps {
  item: BankAccount;
  def?: Record<string, any>;
  onRemove: () => void;
  readOnly?: boolean;
}

export function BankAccountChip({
  item,
  def,
  onRemove,
  readOnly,
}: BankAccountChipProps) {
  return (
    <BankAccountPopover value={item} def={def}>
      <View className="flex-row items-center">
        <Text className="text-sm text-blue-600 underline decoration-blue-300 underline-offset-2 hover:text-blue-700 cursor-pointer">
          {item.bank_name}
          {item.currency && (
            <Text className="text-xs text-blue-400"> ({item.currency})</Text>
          )}
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
    </BankAccountPopover>
  );
}
