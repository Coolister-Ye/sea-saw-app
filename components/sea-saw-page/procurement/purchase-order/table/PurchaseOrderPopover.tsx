import React, { useMemo } from "react";
import { ShoppingBagIcon } from "react-native-heroicons/outline";
import { Popover, Button } from "antd";

import { Text } from "@/components/sea-saw-design/text";
import { PopoverCard } from "@/components/sea-saw-page/base/popover";
import PurchaseOrderStatusTag from "@/components/sea-saw-page/procurement/purchase-order/display/renderers/PurchaseOrderStatusTag";

interface PurchaseOrderPopoverProps {
  value?: Record<string, any> | null;
  def?: Record<string, any>;
}

export default function PurchaseOrderPopover({
  value,
  def,
}: PurchaseOrderPopoverProps) {
  const displayCode =
    value?.purchase_code ?? `Purchase #${value?.id ?? value?.pk}`;

  const content = useMemo(
    () =>
      value ? (
        <PopoverCard
          headerIcon={<ShoppingBagIcon size={16} className="text-blue-600" />}
          headerTitle={displayCode}
          value={value}
          metaDef={def}
          columnOrder={["status", "purchase_date", "etd"]}
          iconBgClass="bg-blue-50"
          colDef={{
            status: {
              render: (fieldDef, fieldValue) => (
                <PurchaseOrderStatusTag value={fieldValue} def={fieldDef} />
              ),
            },
          }}
        />
      ) : null,
    [value, def, displayCode],
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
