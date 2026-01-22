import React, { useMemo } from "react";
import type { AgGridReactProps } from "ag-grid-react";
import { useLocale } from "@/context/Locale";
import { FormDef } from "@/hooks/useFormDefs";
import { ItemsTable, type ColumnConfig } from "../../../base";

interface OutboundItemsTableProps {
  def?: FormDef;
  value?: any[] | null;
  className?: string;
  agGridReactProps?: AgGridReactProps;
}

export default function OutboundItemsTable({
  def,
  value,
  className = "",
  agGridReactProps,
}: OutboundItemsTableProps) {
  const { i18n } = useLocale();

  // Only override columns that need special formatting
  const columnOverrides = useMemo<Record<string, Partial<ColumnConfig>>>(
    () => ({
      glazing: {
        valueFormatter: ({ value }) =>
          value ? (Number(value) * 100).toFixed(0) + "%" : "-",
      },
      // Format weight fields with trim
      gross_weight: {
        valueFormatter: ({ value }) =>
          value != null ? Number(value).toFixed(2).replace(/\.?0+$/, "") : "-",
      },
      net_weight: {
        valueFormatter: ({ value }) =>
          value != null ? Number(value).toFixed(2).replace(/\.?0+$/, "") : "-",
      },
      total_gross_weight: {
        valueFormatter: ({ value }) =>
          value != null ? Number(value).toFixed(2).replace(/\.?0+$/, "") : "-",
      },
      total_net_weight: {
        valueFormatter: ({ value }) =>
          value != null ? Number(value).toFixed(2).replace(/\.?0+$/, "") : "-",
      },
      outbound_net_weight: {
        valueFormatter: ({ value }) =>
          value != null ? Number(value).toFixed(2).replace(/\.?0+$/, "") : "-",
      },
      outbound_gross_weight: {
        valueFormatter: ({ value }) =>
          value != null ? Number(value).toFixed(2).replace(/\.?0+$/, "") : "-",
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
      emptyMessage={i18n.t("No outbound items")}
      showTotal={true}
      agGridReactProps={agGridReactProps}
    />
  );
}
