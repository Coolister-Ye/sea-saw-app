import React from "react";
import { View, Pressable } from "react-native";
import { BuildingOfficeIcon, XMarkIcon } from "react-native-heroicons/outline";

import { Text } from "@/components/sea-saw-design/text";
import { cn } from "@/lib/utils";
import AccountPopover from "@/components/sea-saw-page/crm/account/display/AccountPopover";

import type { Account } from "./types";
import { getRoleColors } from "./utils";

interface AccountChipProps {
  item: Account;
  def?: Record<string, any>;
  onRemove: () => void;
  readOnly?: boolean;
}

export function AccountChip({
  item,
  def,
  onRemove,
  readOnly,
}: AccountChipProps) {
  const colors = getRoleColors(item.roles?.[0]);

  return (
    <AccountPopover value={item} def={def}>
      <View
        className={cn(
          "flex-row items-center rounded border px-3 py-1 mr-2",
          colors.bg,
          colors.border,
        )}
      >
        <BuildingOfficeIcon size={14} className={cn("mr-2", colors.text)} />
        <Text className={cn("text-sm font-semibold", colors.text)}>
          {item.account_name}
        </Text>
        {!readOnly && (
          <Pressable
            onPress={onRemove}
            className="ml-1.5 p-0.5 rounded-full active:opacity-70 hover:bg-gray-200"
          >
            <XMarkIcon size={14} className={colors.text} />
          </Pressable>
        )}
      </View>
    </AccountPopover>
  );
}
