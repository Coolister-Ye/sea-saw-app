import React from "react";
import { Text } from "react-native";
import type { CustomCellRendererProps } from "ag-grid-react";
import OrderStatusTag from "../../from/display/order/renderers/OrderStatusTag";

function OrderStatusRender(props: CustomCellRendererProps) {
  const statusValue = props.value as string | null;
  const statusDef = props.context?.meta?.status;

  if (!statusValue) {
    return <Text className="text-muted-foreground">—</Text>;
  }

  return <OrderStatusTag value={statusValue} def={statusDef} />;
}

export default OrderStatusRender;
export { OrderStatusRender };
