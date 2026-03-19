import React, { useMemo } from "react";
import { TruckIcon } from "react-native-heroicons/outline";
import { Popover, Button } from "antd";

import { Text } from "@/components/sea-saw-design/text";
import { PopoverCard } from "@/components/sea-saw-page/base/popover";
import OutboundStatusTag from "@/components/sea-saw-page/warehouse/outbound-order/display/OutboundStatusTag";

interface OutboundOrderPopoverProps {
  value?: Record<string, any> | null;
  def?: Record<string, any>;
}

export default function OutboundOrderPopover({
  value,
  def,
}: OutboundOrderPopoverProps) {
  const displayCode =
    value?.outbound_code ?? `Outbound #${value?.id ?? value?.pk}`;

  const content = useMemo(
    () =>
      value ? (
        <PopoverCard
          headerIcon={<TruckIcon size={16} className="text-blue-600" />}
          headerTitle={displayCode}
          value={value}
          metaDef={def}
          columnOrder={["status", "outbound_date", "loader"]}
          iconBgClass="bg-blue-50"
          colDef={{
            status: {
              render: (fieldDef, fieldValue) => (
                <OutboundStatusTag value={fieldValue} def={fieldDef} />
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
