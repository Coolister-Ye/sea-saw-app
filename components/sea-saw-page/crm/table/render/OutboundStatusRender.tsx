import React from "react";
import { Text } from "react-native";
import type { CustomCellRendererProps } from "ag-grid-react";
import OutboundStatusTag from "../../from/display/order/outbound/OutboundStatusTag";

function OutboundStatusRender(props: CustomCellRendererProps) {
  const statusValue = props.value as string | null;
  const statusDef = props.context?.meta?.status;

  if (!statusValue) {
    return <Text className="text-muted-foreground">—</Text>;
  }

  return <OutboundStatusTag value={statusValue} def={statusDef} />;
}

export default OutboundStatusRender;
export { OutboundStatusRender };
