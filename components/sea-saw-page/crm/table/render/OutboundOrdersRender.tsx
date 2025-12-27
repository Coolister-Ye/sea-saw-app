import React, { memo } from "react";
import type { CustomCellRendererProps } from "ag-grid-react";
import OutboundOrderPopover from "../display/OutboundOrderPopover";

interface OutboundOrder {
  id?: string | number;
  outbound_items?: Record<string, any>[];
  [key: string]: any;
}

function OutboundOrdersRender(props: CustomCellRendererProps<OutboundOrder[]>) {
  const orders = Array.isArray(props.value) ? props.value : [];
  const meta = props.context?.meta;
  const def = meta?.outbound_orders?.child?.children;

  if (orders.length === 0) {
    return null;
  }

  return (
    <>
      {orders.map((item, index) =>
        item ? (
          <OutboundOrderPopover key={item.id ?? index} value={item} def={def} />
        ) : null
      )}
    </>
  );
}

export default memo(OutboundOrdersRender);
export { OutboundOrdersRender };
