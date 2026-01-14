import React from "react";
import { View, Platform } from "react-native";
import { Button, Popconfirm } from "antd";
import { useLocale } from "@/context/Locale";

interface TableToolbarProps {
  hasSelection?: boolean;
  onAdd?: () => void;
  onCopy?: () => void;
  onDelete?: () => void;
}

export default function TableToolbar({
  hasSelection = false,
  onAdd,
  onCopy,
  onDelete,
}: TableToolbarProps) {
  const { i18n } = useLocale();

  return (
    <View className="flex-row items-center justify-end gap-1">
      <Button variant="outlined" disabled={!hasSelection} onClick={onCopy}>
        {i18n.t("Copy")}
      </Button>

      {/* Web: with confirmation */}
      {Platform.OS === "web" && hasSelection ? (
        <Popconfirm
          title={i18n.t("Are you sure to delete this item?")}
          okText={i18n.t("Delete")}
          cancelText={i18n.t("Cancel")}
          onConfirm={onDelete}
        >
          <Button danger variant="outlined" disabled={!hasSelection}>
            {i18n.t("Delete")}
          </Button>
        </Popconfirm>
      ) : (
        <Button
          danger
          variant="outlined"
          disabled={!hasSelection}
          onClick={onDelete}
        >
          {i18n.t("Delete")}
        </Button>
      )}

      {/* 主操作 */}
      <Button type="primary" onClick={onAdd}>
        {i18n.t("Add")}
      </Button>
    </View>
  );
}
