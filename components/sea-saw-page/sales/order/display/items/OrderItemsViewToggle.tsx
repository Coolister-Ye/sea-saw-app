import React from "react";
import type { AgGridReactProps } from "ag-grid-react";
import type { HeaderMetaProps } from "@/components/sea-saw-design/table/interface";
import { ItemsViewToggle } from "@/components/sea-saw-page/base";
import OrderItemsCard from "./OrderItemsCard";
import OrderItemsTable from "./OrderItemsTable";

interface OrderItemsViewToggleProps {
  /** Field definitions (already extracted as child?.children from parent) */
  def?: Record<string, HeaderMetaProps>;
  value?: any[] | null;
  agGridReactProps?: AgGridReactProps;
  onItemClick?: (index: number) => void;
}

export default function OrderItemsViewToggle({
  def,
  value,
  agGridReactProps,
  onItemClick,
}: OrderItemsViewToggleProps) {
  return (
    <ItemsViewToggle
      def={def}
      value={value}
      agGridReactProps={agGridReactProps}
      onItemClick={onItemClick}
      CardComponent={OrderItemsCard}
      TableComponent={OrderItemsTable}
    />
  );
}
