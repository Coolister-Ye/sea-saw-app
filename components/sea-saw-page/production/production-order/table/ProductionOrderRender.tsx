import React, { memo } from "react";
import type { CustomCellRendererProps } from "ag-grid-react";
import ProductionOrderPopover from "./ProductionOrderPopover";

interface ProductionOrder {
  id?: string | number;
  [key: string]: any;
}

function ProductionOrderRender(
  props: CustomCellRendererProps<ProductionOrder[]>,
) {
  const orders = Array.isArray(props.value) ? props.value : [];
  const meta = props.context?.meta;
  const def = meta?.production_orders?.child?.children;

  if (orders.length === 0) {
    return null;
  }

  return (
    <>
      {orders.map((order, index) =>
        order ? (
          <ProductionOrderPopover
            key={order.id ?? index}
            value={order}
            def={def}
          />
        ) : null,
      )}
    </>
  );
}

export default memo(ProductionOrderRender);
export { ProductionOrderRender };
