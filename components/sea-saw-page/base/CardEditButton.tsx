import React from "react";
import i18n from "@/locale/i18n";
import { View } from "react-native";
import { Button, ButtonProps } from "antd";
import { Text } from "@/components/sea-saw-design/text";
import { PencilSquareIcon } from "react-native-heroicons/outline";

interface CardEditButtonProps {
  onClick: () => void;
  /** Additional props to pass to Button */
  buttonProps?: Omit<ButtonProps, "onClick" | "type" | "size" | "className">;
}

/**
 * Reusable edit button for card footers
 * Used in ContactCard, AccountCard, OrderCard, ItemsCard, etc.
 */
export default function CardEditButton({
  onClick,
  buttonProps,
}: CardEditButtonProps) {
  return (
    <Button
      type="text"
      size="small"
      className="p-0 h-auto"
      onClick={onClick}
      {...buttonProps}
    >
      <View className="flex-row items-center gap-1">
        <PencilSquareIcon size={14} color="#64748b" />
        <Text className="text-xs text-slate-500 font-medium">
          {i18n.t("Edit")}
        </Text>
      </View>
    </Button>
  );
}
