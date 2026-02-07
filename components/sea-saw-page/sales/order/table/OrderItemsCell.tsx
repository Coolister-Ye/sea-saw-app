import React from "react";
import type { CustomCellRendererProps } from "ag-grid-react";
import OrderItemPopover from "../display/OrderItemPopover";

interface OrderItem {
  id?: string | number;
  [key: string]: any;
}

function OrderItemsCell(props: CustomCellRendererProps<OrderItem[]>) {
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
        ) : null,
      )}
    </>
  );
}

export default OrderItemsCell;
export { OrderItemsCell };
