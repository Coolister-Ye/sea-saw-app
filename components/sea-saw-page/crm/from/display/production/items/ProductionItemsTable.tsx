import React, { useMemo } from "react";
import i18n from '@/locale/i18n';
import type { AgGridReactProps } from "ag-grid-react";
import { FormDef } from "@/hooks/useFormDefs";
import { ItemsTable, type ColumnConfig } from "../../../base";

interface ProductionItemsTableProps {
  def?: FormDef;
  value?: any[] | null;
  className?: string;
  agGridReactProps?: AgGridReactProps;
}

export default function ProductionItemsTable({
  def,
  value,
  className = "",
  agGridReactProps,
}: ProductionItemsTableProps) {
  // Only override columns that need special formatting
  const columnOverrides = useMemo<Record<string, Partial<ColumnConfig>>>(
    () => ({
      glazing: {
        valueFormatter: ({ value }) =>
          value ? (Number(value) * 100).toFixed(0) + "%" : "-",
      },
    }),
    [],
  );

  return (
    <ItemsTable
      def={def}
      value={value}
      className={className}
      columnOverrides={columnOverrides}
      emptyMessage={i18n.t("No production items")}
      showTotal={true}
      agGridReactProps={agGridReactProps}
    />
  );
}
