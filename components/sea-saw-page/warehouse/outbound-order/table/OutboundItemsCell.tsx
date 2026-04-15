import React from "react";
import type { CustomCellRendererProps } from "ag-grid-react";
import { View } from "@/components/sea-saw-design/view";
import OutboundItemPopover from "../display/OutboundItemPopover";

interface OutboundItem {
  id?: string | number;
  [key: string]: any;
}

function OutboundItemsCell(props: CustomCellRendererProps<OutboundItem[]>) {
  const items = Array.isArray(props.value) ? props.value : [];
  const meta = props.context?.meta;
  const def = meta?.outbound_items?.child?.children;

  if (items.length === 0) {
    return null;
  }

  return (
    <View className="flex-1 flex-row gap-2">
      {items.map((item, index) =>
        item ? (
          <OutboundItemPopover key={item.id ?? index} value={item} def={def} />
        ) : null,
      )}
    </View>
  );
}

export default OutboundItemsCell;
export { OutboundItemsCell };
