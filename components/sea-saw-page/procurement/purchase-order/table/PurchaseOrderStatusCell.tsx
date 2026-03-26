import React from "react";
import { Text } from "react-native";
import type { CustomCellRendererProps } from "ag-grid-react";
import PurchaseOrderStatusTag from "../display/renderers/PurchaseOrderStatusTag";

function PurchaseOrderStatusCell(props: CustomCellRendererProps) {
  const statusValue = props.value as string | null;
  const statusDef = props.context?.meta?.status;

  if (!statusValue) {
    return <Text className="text-muted-foreground">—</Text>;
  }

  return <PurchaseOrderStatusTag value={statusValue} def={statusDef} />;
}

export default PurchaseOrderStatusCell;
export { PurchaseOrderStatusCell };
