import React, { useMemo } from "react";
import { ShoppingCartIcon } from "react-native-heroicons/outline";
import { Popover, Button } from "antd";

import { Text } from "@/components/sea-saw-design/text";
import { PopoverCard } from "@/components/sea-saw-page/base/popover";
import OrderStatusTag from "@/components/sea-saw-page/sales/order/display/OrderStatusTag";

interface OrderPopoverProps {
  def?: Record<string, { label: string }>;
  value?: Record<string, any> | null;
  context?: { meta?: Record<string, any> };
}

export default function OrderPopover({
  def,
  value,
  context,
}: OrderPopoverProps) {
  const resolvedDef = def ?? context?.meta?.related_order?.children;
  const displayCode = value?.order_code ?? `Order #${value?.id ?? value?.pk}`;

  const content = useMemo(
    () =>
      value ? (
        <PopoverCard
          headerIcon={<ShoppingCartIcon size={16} className="text-green-600" />}
          headerTitle={displayCode}
          value={value}
          metaDef={resolvedDef}
          columnOrder={["status", "order_date", "etd"]}
          iconBgClass="bg-green-50"
          colDef={{
            status: {
              render: (fieldDef, fieldValue) => (
                <OrderStatusTag value={fieldValue} def={fieldDef} />
              ),
            },
          }}
        />
      ) : null,
    [value, resolvedDef, displayCode],
  );

  if (!value) {
    return <Text>-</Text>;
  }

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
        style={{ padding: 0, height: "auto", lineHeight: "inherit" }}
        className="text-blue-600 hover:text-blue-700"
      >
        {displayCode}
      </Button>
    </Popover>
  );
}
