import React, { useMemo } from "react";
import { View } from "react-native";
import { ShoppingCartIcon } from "react-native-heroicons/outline";
import { Popover, Button } from "antd";

import { FormDef } from "@/hooks/useFormDefs";
import { Text } from "@/components/sea-saw-design/text";
import { InfoRow } from "@/components/sea-saw-page/crm/from/base/InfoRow";

interface Order {
  id?: string | number;
  pk?: string | number;
  order_code?: string;
  status?: string;
  total_amount?: string | number;
  delivery_date?: string;
}

interface OrderPopoverProps {
  def?: FormDef;
  value?: Order | null;
}

export default function OrderPopover({ def, value }: OrderPopoverProps) {
  const title = def?.label || "Order";

  /* ========================
   * Popover 内容
   * ======================== */
  const content = useMemo(
    () =>
      value ? (
        <View className="p-3 w-[240px] space-y-3">
          {/* Header */}
          <View className="flex flex-row items-center gap-3">
            <View className="w-8 h-8 rounded-full bg-green-50 items-center justify-center">
              <ShoppingCartIcon size={16} className="text-green-600" />
            </View>

            <View className="flex-1">
              <Text className="text-sm font-semibold text-gray-900">
                {title}
              </Text>
              <Text className="text-xs text-gray-500">
                {value.order_code || `Order #${value.id || value.pk}`}
              </Text>
              {value.status && (
                <Text className="text-xs text-gray-500">{value.status}</Text>
              )}
            </View>
          </View>

          {/* Divider */}
          <View className="h-[1px] bg-gray-100" />

          {/* Info */}
          <View className="space-y-1.5">
            <Text>
              {value.total_amount && (
                <InfoRow icon="💰" text={`Amount: ${value.total_amount}`} />
              )}
              {value.delivery_date && (
                <InfoRow icon="📅" text={`Delivery: ${value.delivery_date}`} />
              )}
            </Text>
          </View>
        </View>
      ) : null,
    [value, title],
  );

  if (!value) {
    return <Text>-</Text>;
  }

  /* ========================
   * Trigger
   * ======================== */
  return (
    <Popover
      content={content}
      trigger="hover"
      placement="right"
      mouseEnterDelay={0.15}
    >
      <Button
        type="link"
        tabIndex={0}
        style={{
          padding: 0,
          height: "auto",
          lineHeight: "inherit",
        }}
        className="text-green-600 hover:text-green-700"
      >
        {value.order_code || `Order #${value.id || value.pk}`}
      </Button>
    </Popover>
  );
}
