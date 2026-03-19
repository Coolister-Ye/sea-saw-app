import React from "react";
import type { CustomCellRendererProps } from "ag-grid-react";

import { View } from "@/components/sea-saw-design/view";
import ProductionItemPopover from "./ProductionItemPopover";

interface ProductionItem {
  id?: string | number;
  [key: string]: any;
}

function ProductionItemsCell(props: CustomCellRendererProps<ProductionItem[]>) {
  const items = Array.isArray(props.value) ? props.value : [];
  const meta = props.context?.meta;
  const def = meta?.production_items?.child?.children;

  if (items.length === 0) {
    return null;
  }

  return (
    <View className="flex-1 flex-row gap-2">
      {items.map((item, index) =>
        item ? (
          <ProductionItemPopover
            key={item.id ?? index}
            value={item}
            def={def}
          />
        ) : null,
      )}
    </View>
  );
}

export default ProductionItemsCell;
export { ProductionItemsCell };
