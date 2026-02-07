import React from "react";
import { View } from "react-native";
import { ShoppingCartIcon } from "react-native-heroicons/outline";
import { Popover, Button } from "antd";

import { FormDef } from "@/hooks/useFormDefs";
import { Text } from "@/components/sea-saw-design/text";
import { InfoRow } from "@/components/sea-saw-page/base/InfoRow";

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
  if (!value) {
    return <Text>-</Text>;
  }

  const title = def?.label || "Order";
  const displayCode = value.order_code || `Order #${value.id || value.pk}`;

  const content = (
    <View className="p-3 w-[240px] space-y-3">
      <View className="flex flex-row items-center gap-3">
        <View className="w-8 h-8 rounded-full bg-green-50 items-center justify-center">
          <ShoppingCartIcon size={16} className="text-green-600" />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-semibold text-gray-900">{title}</Text>
          <Text className="text-xs text-gray-500">{displayCode}</Text>
          {value.status && (
            <Text className="text-xs text-gray-500">{value.status}</Text>
          )}
        </View>
      </View>

      <View className="h-[1px] bg-gray-100" />

      <View className="space-y-1.5">
        {value.total_amount && (
          <InfoRow icon="💰" text={`Amount: ${value.total_amount}`} />
        )}
        {value.delivery_date && (
          <InfoRow icon="📅" text={`Delivery: ${value.delivery_date}`} />
        )}
      </View>
    </View>
  );

  return (
    <Popover
      content={content}
      trigger="hover"
      placement="right"
      mouseEnterDelay={0.15}
    >
      <Button
        type="link"
        style={{ padding: 0, height: "auto", lineHeight: "inherit" }}
        className="text-green-600 hover:text-green-700"
      >
        {displayCode}
      </Button>
    </Popover>
  );
}
