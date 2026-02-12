import React from "react";
import type { AgGridReactProps } from "ag-grid-react";
import { ItemsViewToggle } from "@/components/sea-saw-page/base";
import PurchaseItemsCard from "./PurchaseItemsCard";
import PurchaseItemsTable from "./PurchaseItemsTable";
import { PurchaseItemsDisplayProps } from "../types";

interface PurchaseItemsViewToggleProps extends PurchaseItemsDisplayProps {
  agGridReactProps?: AgGridReactProps;
  onItemClick?: (index: number) => void;
}

export default function PurchaseItemsViewToggle({
  def,
  value,
  agGridReactProps,
  onItemClick,
}: PurchaseItemsViewToggleProps) {
  return (
    <ItemsViewToggle
      def={def}
      value={value}
      agGridReactProps={agGridReactProps}
      onItemClick={onItemClick}
      CardComponent={PurchaseItemsCard}
      TableComponent={PurchaseItemsTable}
    />
  );
}
