import React, { useMemo } from "react";
import { View } from "react-native";
import { Popover, Button } from "antd";
import { Text } from "@/components/ui/text";
import { InfoRow } from "@/components/sea-saw-page/crm/from/base/InfoRow";

interface OutboundItem {
  id?: string | number;
  [key: string]: any;
}

interface OutboundOrderPopoverProps {
  value?: OutboundItem | null;
  def?: Record<string, { label: string }>;
}

export default function OutboundOrderPopover({
  value,
  def,
}: OutboundOrderPopoverProps) {
  if (!value) {
    return <Text>-</Text>;
  }

  const titleField = "outbound_code";

  const content = useMemo(() => {
    if (!def) return null;

    return (
      <View className="p-3 w-[300px] space-y-2">
        {Object.entries(def).map(([key, fieldDef]) => {
          if (
            key === titleField ||
            key === "remark" ||
            key === "outbound_items" ||
            key === "attachments"
          )
            return null;

          const rawVal = value[key];
          const displayValue =
            rawVal === null || rawVal === undefined || rawVal === ""
              ? "-"
              : String(rawVal);

          return (
            <View key={key} className="flex flex-row items-start gap-2">
              <Text className="text-xs text-gray-500 w-[90px] text-right leading-5">
                {fieldDef.label}
              </Text>
              <View className="flex-1">
                <InfoRow icon="•" text={displayValue} />
              </View>
            </View>
          );
        })}
      </View>
    );
  }, [value, def]);

  return (
    <Popover content={content} trigger="hover" mouseEnterDelay={0.15}>
      <Button
        type="link"
        tabIndex={0}
        style={{ padding: 0, height: "auto", lineHeight: "inherit" }}
        className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
      >
        {value[titleField] ?? "-"}
      </Button>
    </Popover>
  );
}
