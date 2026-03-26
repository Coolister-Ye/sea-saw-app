import React from "react";
import { Text } from "react-native";
import i18n from "@/locale/i18n";
import type { HeaderMetaProps } from "@/components/sea-saw-design/table/interface";

const STATUS_COLORS: Record<string, string> = {
  completed: "#52c41a",
  failed: "#ff4d4f",
  processing: "#1677ff",
  pending: "#faad14",
};

export function StatusCell({
  value,
  fieldMeta,
}: {
  value: string;
  fieldMeta?: HeaderMetaProps;
}) {
  const label =
    fieldMeta?.choices?.find((c) => c.value === value)?.label ??
    i18n.t(value ?? "");

  return (
    <Text
      style={{
        color: STATUS_COLORS[value] ?? "#595959",
        fontSize: 12,
        fontWeight: "500",
      }}
    >
      {label}
    </Text>
  );
}
