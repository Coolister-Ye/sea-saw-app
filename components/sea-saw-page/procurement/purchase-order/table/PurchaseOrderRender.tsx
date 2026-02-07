import React, { memo } from "react";
import type { CustomCellRendererProps } from "ag-grid-react";
import PurchaseOrderPopover from "./PurchaseOrderPopover";

interface PurchaseOrder {
  id?: string | number;
  [key: string]: any;
}

function PurchaseOrderRender(props: CustomCellRendererProps<PurchaseOrder[]>) {
  const orders = Array.isArray(props.value) ? props.value : [];
  const meta = props.context?.meta;
  const def = meta?.purchase_orders?.child?.children;

  if (orders.length === 0) {
    return null;
  }

  return (
    <>
      {orders.map((order, index) =>
        order ? (
          <PurchaseOrderPopover
            key={order.id ?? index}
            value={order}
            def={def}
          />
        ) : null,
      )}
    </>
  );
}

export default memo(PurchaseOrderRender);
export { PurchaseOrderRender };
