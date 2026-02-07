import React from "react";
import { View } from "react-native";
import i18n from "@/locale/i18n";
import { Button } from "@/components/sea-saw-design/button";

export interface DrawerButtonProps {
  /**
   * Close button callback
   */
  onClose: () => void;

  /**
   * Optional edit button callback
   * If provided, will show an Edit button
   */
  onEdit?: () => void;

  /**
   * Optional custom buttons to render after Close button
   */
  children?: React.ReactNode;

  /**
   * Custom class name for the container
   */
  className?: string;
}

/**
 * Standard drawer footer buttons (Close and Edit)
 * Commonly used in display drawers across the app
 */
export default function DrawerButton({
  onClose,
  onEdit,
  children,
  className = "flex-row justify-end p-2 gap-1",
}: DrawerButtonProps) {
  return (
    <View className={className}>
      <Button onPress={onClose}>{i18n.t("Close")}</Button>
      {onEdit && (
        <Button type="primary" onPress={onEdit}>
          {i18n.t("Edit")}
        </Button>
      )}
      {children}
    </View>
  );
}
