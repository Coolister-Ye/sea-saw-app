import React from "react";
import { Text } from "react-native";
import type { CustomCellRendererProps } from "ag-grid-react";
import ProductionStatusTag from "../display/renderers/ProductionStatusTag";

function ProductionStatusRender(props: CustomCellRendererProps) {
  const statusValue = props.value as string | null;
  const statusDef = props.context?.meta?.status;

  if (!statusValue) {
    return <Text className="text-muted-foreground">—</Text>;
  }

  return <ProductionStatusTag value={statusValue} def={statusDef} />;
}

export default ProductionStatusRender;
export { ProductionStatusRender };
