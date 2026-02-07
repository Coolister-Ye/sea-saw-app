import React, { memo } from "react";
import type { CustomCellRendererProps } from "ag-grid-react";
import OrderPopover from "../display/OrderPopover";

interface Order {
  id?: string | number;
  [key: string]: any;
}

function OrdersRender(props: CustomCellRendererProps<Order | Order[]>) {
  const meta = props.context?.meta;

  // Handle both single object and array
  const orders = Array.isArray(props.value)
    ? props.value
    : props.value
      ? [props.value]
      : [];

  // Get def from either 'order' (single) or 'orders' (array) metadata
  const def = meta?.order?.children ?? meta?.orders?.child?.children;

  if (orders.length === 0) {
    return null;
  }

  return (
    <>
      {orders.map((order, index) =>
        order ? (
          <OrderPopover key={order.id ?? index} value={order} def={def} />
        ) : null,
      )}
    </>
  );
}

export default memo(OrdersRender);
export { OrdersRender };
