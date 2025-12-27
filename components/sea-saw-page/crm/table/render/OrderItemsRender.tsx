import React, { memo } from "react";
import type { CustomCellRendererProps } from "ag-grid-react";
import OrderItemPopover from "../display/OrderItemPopover";

interface OrderItem {
  id?: string | number;
  [key: string]: any;
}

function OrderItemsRender(props: CustomCellRendererProps<OrderItem[]>) {
  const items = Array.isArray(props.value) ? props.value : [];
  const meta = props.context?.meta;
  const def = meta?.order_items?.child?.children;

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      {items.map((item, index) =>
        item ? (
          <OrderItemPopover key={item.id ?? index} value={item} def={def} />
        ) : null
      )}
    </>
  );
}

export default OrderItemsRender;
export { OrderItemsRender };
