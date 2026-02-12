import React from "react";
import type { AgGridReactProps } from "ag-grid-react";
import { ItemsViewToggle } from "@/components/sea-saw-page/base";
import OutboundItemsCard from "./OutboundItemsCard";
import OutboundItemsTable from "./OutboundItemsTable";
import { OutboundItemsDisplayProps } from "../types";

interface OutboundItemsViewToggleProps extends OutboundItemsDisplayProps {
  agGridReactProps?: AgGridReactProps;
  onItemClick?: (index: number) => void;
}

export default function OutboundItemsViewToggle({
  def,
  value,
  agGridReactProps,
  onItemClick,
}: OutboundItemsViewToggleProps) {
  return (
    <ItemsViewToggle
      def={def}
      value={value}
      agGridReactProps={agGridReactProps}
      onItemClick={onItemClick}
      CardComponent={OutboundItemsCard}
      TableComponent={OutboundItemsTable}
    />
  );
}
