import React, { useMemo } from "react";
import { View } from "react-native";
import { Popover, Button } from "antd";
import { Text } from "@/components/sea-saw-design/text";
import { InfoRow } from "@/components/sea-saw-page/base/InfoRow";

interface Payment {
  id?: string | number;
  [key: string]: any;
}

interface PaymentPopoverProps {
  value?: Payment | null;
  def?: Record<string, { label: string }>;
}

export default function PaymentPopover({ value, def }: PaymentPopoverProps) {
  const titleField = "payment_code";

  const content = useMemo(() => {
    if (!def || !value) return null;

    return (
      <View className="p-3 w-[300px] space-y-2">
        {Object.entries(def).map(([key, fieldDef]) => {
          if (
            key === titleField ||
            key === "attachments" ||
            key === "attachment"
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

  if (!value) return <Text>-</Text>;

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

export { PaymentPopover };
