import React, { useMemo } from "react";
import { WrenchScrewdriverIcon } from "react-native-heroicons/outline";
import { Popover, Button } from "antd";

import { Text } from "@/components/sea-saw-design/text";
import { PopoverCard } from "@/components/sea-saw-page/base/popover";
import ProductionStatusTag from "@/components/sea-saw-page/production/production-order/display/renderers/ProductionStatusTag";

interface ProductionOrderPopoverProps {
  def?: Record<string, any>;
  value?: Record<string, any> | null;
}

export default function ProductionOrderPopover({
  def,
  value,
}: ProductionOrderPopoverProps) {
  const displayCode =
    value?.production_code ?? `Production #${value?.id ?? value?.pk}`;

  const content = useMemo(
    () =>
      value ? (
        <PopoverCard
          headerIcon={
            <WrenchScrewdriverIcon size={16} className="text-blue-600" />
          }
          headerTitle={displayCode}
          value={value}
          metaDef={def}
          columnOrder={["status", "planned_date", "start_date", "end_date"]}
          iconBgClass="bg-blue-50"
          colDef={{
            status: {
              render: (fieldDef, fieldValue) => (
                <ProductionStatusTag value={fieldValue} def={fieldDef} />
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
