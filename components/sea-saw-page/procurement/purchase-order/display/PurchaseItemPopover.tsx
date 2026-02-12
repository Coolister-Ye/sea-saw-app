import React, { useMemo } from "react";
import { Popover, Button } from "antd";
import { CubeIcon } from "react-native-heroicons/outline";

import { Text } from "@/components/sea-saw-design/text";
import { PopoverCard } from "@/components/sea-saw-page/base/popover";

interface PurchaseItemPopoverProps {
  value?: Record<string, any> | null;
  def?: Record<string, { label: string }>;
}

export default function PurchaseItemPopover({
  value,
  def,
}: PurchaseItemPopoverProps) {
  const content = useMemo(
    () =>
      value ? (
        <PopoverCard
          headerIcon={<CubeIcon size={16} className="text-purple-600" />}
          headerTitle={value.product_name}
          value={value}
          metaDef={def}
          columnOrder={["size", "order_qty", "unit_price", "total_price"]}
        />
      ) : null,
    [value, def],
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
        style={{
          padding: 0,
          height: "auto",
          lineHeight: "inherit",
        }}
        className="text-purple-600 hover:text-purple-700"
      >
        {value.product_name ?? "-"}
      </Button>
    </Popover>
  );
}
