import React from "react";
import i18n from "@/locale/i18n";
import type { AgGridReactProps } from "ag-grid-react";
import { HeaderMetaProps } from "@/components/sea-saw-design/table/interface";
import { ItemsTable } from "@/components/sea-saw-page/base";

interface PurchaseItemsTableProps {
  /** Field definitions (already extracted as child?.children from parent) */
  def?: Record<string, HeaderMetaProps>;
  value?: any[] | null;
  className?: string;
  agGridReactProps?: AgGridReactProps;
}

/**
 * PurchaseItemsTable - wrapper for ItemsTable with purchase-specific config
 * Note: Receives def as Record<string, HeaderMetaProps> (already extracted from parent)
 */
export default function PurchaseItemsTable({
  def,
  value,
  className = "",
  agGridReactProps,
}: PurchaseItemsTableProps) {
  return (
    <ItemsTable
      def={def}
      value={value}
      className={className}
      emptyMessage={i18n.t("No purchase items")}
      agGridReactProps={agGridReactProps}
    />
  );
}
