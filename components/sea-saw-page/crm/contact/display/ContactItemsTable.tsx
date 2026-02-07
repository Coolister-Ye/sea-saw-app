import React from "react";
import i18n from "@/locale/i18n";
import type { AgGridReactProps } from "ag-grid-react";
import { FormDef } from "@/hooks/useFormDefs";
import { ItemsTable } from "@/components/sea-saw-page/base";

interface ContactItemsTableProps {
  def?: FormDef;
  value?: any[] | null;
  className?: string;
  agGridReactProps?: AgGridReactProps;
}

export default function ContactItemsTable({
  def,
  value,
  className = "",
  agGridReactProps,
}: ContactItemsTableProps) {
  return (
    <ItemsTable
      def={def}
      value={value}
      className={className}
      emptyMessage={i18n.t("No contacts found")}
      agGridReactProps={agGridReactProps}
      excludeFields={[]}
    />
  );
}
