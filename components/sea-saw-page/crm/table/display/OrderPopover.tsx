import React, { useMemo } from "react";
import { View } from "react-native";
import { Popover, Button } from "antd";
import { Text } from "@/components/ui/text";
import { InfoRow } from "@/components/sea-saw-page/crm/from/base/InfoRow";

interface OrderPopoverProps {
  value?: Record<string, any> | null;
  def?: Record<string, { label: string }>;
}

export default function OrderPopover({
  value,
  def,
}: OrderPopoverProps) {
  if (!value) return <Text>-</Text>;

  /** 主标题字段（只在按钮中展示） */
  const titleField = "order_number";

  const content = useMemo(() => {
    if (!def) return null;

    return (
      <View className="p-3 w-[350px] space-y-2">
        {Object.entries(def).map(([key, fieldDef]) => {
          // 标题字段 & 冗长字段不在明细中重复展示
          if (
            key === titleField ||
            key === "remark" ||
            key === "order_items" ||
            key === "production_orders" ||
            key === "purchase_orders" ||
            key === "outbound_orders" ||
            key === "payments" ||
            key === "attachments"
          ) {
            return null;
          }

          const rawVal = value[key];
          const displayValue =
            rawVal === null || rawVal === undefined || rawVal === ""
              ? "-"
              : String(rawVal);

          return (
            <View key={key} className="flex flex-row items-start gap-2">
              {/* Label */}
              <Text className="text-xs text-gray-500 w-[100px] text-right leading-5">
                {fieldDef.label}
              </Text>

              {/* Value */}
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
        style={{
          padding: 0,
          height: "auto",
          lineHeight: "inherit",
        }}
        className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
      >
        {value[titleField] ?? "-"}
      </Button>
    </Popover>
  );
}
