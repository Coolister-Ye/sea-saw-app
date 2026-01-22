import React from "react";
import type { AgGridReactProps } from "ag-grid-react";
import { useLocale } from "@/context/Locale";
import { FormDef } from "@/hooks/useFormDefs";
import { ItemsTable } from "../../../base";

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
  const { i18n } = useLocale();

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
