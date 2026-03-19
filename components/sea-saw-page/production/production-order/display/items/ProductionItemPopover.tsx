import React, { useMemo } from "react";
import { Popover, Button } from "antd";
import { CogIcon } from "react-native-heroicons/outline";

import { Text } from "@/components/sea-saw-design/text";
import { PopoverCard } from "@/components/sea-saw-page/base/popover";

interface ProductionItemPopoverProps {
  value?: Record<string, any> | null;
  def?: Record<string, { label: string }>;
}

export default function ProductionItemPopover({
  value,
  def,
}: ProductionItemPopoverProps) {
  const content = useMemo(
    () =>
      value ? (
        <PopoverCard
          headerIcon={<CogIcon size={16} className="text-orange-600" />}
          headerTitle={value.product_name}
          value={value}
          metaDef={def}
          columnOrder={[
            "specification",
            "size",
            "planned_qty",
            "produced_qty",
            "unit",
          ]}
          iconBgClass="bg-orange-50"
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
        className="text-blue-600 hover:text-blue-700"
      >
        {value.product_name ?? "-"}
      </Button>
    </Popover>
  );
}
