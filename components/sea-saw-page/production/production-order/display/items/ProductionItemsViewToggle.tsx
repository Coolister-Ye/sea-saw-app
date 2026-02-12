import React from "react";
import type { AgGridReactProps } from "ag-grid-react";
import { ItemsViewToggle } from "@/components/sea-saw-page/base";
import ProductionItemsCard from "./ProductionItemsCard";
import ProductionItemsTable from "./ProductionItemsTable";
import { ProductionItemsDisplayProps } from "../types";

interface ProductionItemsViewToggleProps extends ProductionItemsDisplayProps {
  agGridReactProps?: AgGridReactProps;
  onItemClick?: (index: number) => void;
}

export default function ProductionItemsViewToggle({
  def,
  value,
  agGridReactProps,
  onItemClick,
}: ProductionItemsViewToggleProps) {
  return (
    <ItemsViewToggle
      def={def}
      value={value}
      agGridReactProps={agGridReactProps}
      onItemClick={onItemClick}
      CardComponent={ProductionItemsCard}
      TableComponent={ProductionItemsTable}
    />
  );
}
