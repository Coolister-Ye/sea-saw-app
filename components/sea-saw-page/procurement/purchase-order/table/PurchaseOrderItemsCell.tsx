import React from "react";
import type { CustomCellRendererProps } from "ag-grid-react";
import PurchaseItemPopover from "../display/PurchaseItemPopover";
import { View } from "@/components/sea-saw-design/view";

interface PurchaseItem {
  id?: string | number;
  [key: string]: any;
}

function PurchaseOrderItemsCell(props: CustomCellRendererProps<PurchaseItem[]>) {
  const items = Array.isArray(props.value) ? props.value : [];
  const meta = props.context?.meta;
  const def = meta?.purchase_items?.child?.children;

  if (items.length === 0) {
    return null;
  }

  return (
    <View className="flex-1 flex-row gap-2">
      {items.map((item, index) =>
        item ? (
          <PurchaseItemPopover key={item.id ?? index} value={item} def={def} />
        ) : null,
      )}
    </View>
  );
}

export default PurchaseOrderItemsCell;
export { PurchaseOrderItemsCell };
