import React, { memo } from "react";
import type { CustomCellRendererProps } from "ag-grid-react";
import OrderPopover from "../display/OrderPopover";

interface Order {
  id?: string | number;
  [key: string]: any;
}

function OrdersRender(props: CustomCellRendererProps<Order[]>) {
  const orders = Array.isArray(props.value) ? props.value : [];
  const meta = props.context?.meta;
  const def = meta?.orders?.child?.children;

  if (orders.length === 0) {
    return null;
  }

  return (
    <>
      {orders.map((order, index) =>
        order ? (
          <OrderPopover
            key={order.id ?? index}
            value={order}
            def={def}
          />
        ) : null
      )}
    </>
  );
}

export default memo(OrdersRender);
export { OrdersRender };
