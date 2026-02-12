import React from "react";
import i18n from "@/locale/i18n";
import type { AgGridReactProps } from "ag-grid-react";
import { HeaderMetaProps } from "@/components/sea-saw-design/table/interface";
import { ItemsTable } from "@/components/sea-saw-page/base";

interface OrderItemsTableProps {
  /** Field definitions (already extracted as child?.children from parent) */
  def?: Record<string, HeaderMetaProps>;
  value?: any[] | null;
  className?: string;
  agGridReactProps?: AgGridReactProps;
}

/**
 * OrderItemsTable - wrapper for ItemsTable with order-specific config
 * Note: Receives def as Record<string, HeaderMetaProps> (already extracted from parent)
 */
export default function OrderItemsTable({
  def,
  value,
  className = "",
  agGridReactProps,
}: OrderItemsTableProps) {
  return (
    <ItemsTable
      def={def}
      value={value}
      className={className}
      emptyMessage={i18n.t("No product information")}
      agGridReactProps={agGridReactProps}
    />
  );
}
