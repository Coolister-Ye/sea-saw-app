import React from "react";
import i18n from "@/locale/i18n";
import type { AgGridReactProps } from "ag-grid-react";
import { FormDef } from "@/hooks/useFormDefs";
import { ItemsTable } from "@/components/sea-saw-page/base";

interface ProductItemsTableProps {
  def?: FormDef;
  value?: any[] | null;
  className?: string;
  agGridReactProps?: AgGridReactProps;
}

export default function ProductItemsTable({
  def,
  value,
  className = "",
  agGridReactProps,
}: ProductItemsTableProps) {
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
