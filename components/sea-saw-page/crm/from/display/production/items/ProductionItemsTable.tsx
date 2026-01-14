import React, { useMemo } from "react";
import { View } from "react-native";
import { AgGridReact } from "ag-grid-react";
import type { AgGridReactProps } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import { Text } from "@/components/ui/text";
import { useLocale } from "@/context/Locale";
import { getFieldLabelMap } from "@/utils";
import { myTableTheme } from "@/components/sea-saw-design/table/theme";
import EmptySlot from "../../../base/EmptySlot";
import { ProductionItem } from "../types";

interface ProductionItemsTableProps {
  def?: any;
  value?: ProductionItem[] | null;
  className?: string;
  agGridReactProps?: AgGridReactProps;
}

export default function ProductionItemsTable({
  def,
  value = [],
  className = "",
  agGridReactProps,
}: ProductionItemsTableProps) {
  const { i18n } = useLocale();

  const fieldLabelMap = useMemo(
    () => getFieldLabelMap(def?.child?.children ?? {}),
    [def]
  );

  const getLabel = (field: string, fallback?: string) =>
    fieldLabelMap[field] ?? (fallback ? i18n.t?.(fallback) ?? fallback : field);

  /** Default column definition */
  const defaultColDef = useMemo<ColDef>(
    () => ({
      editable: false,
      filter: false,
      flex: 1,
      minWidth: 100,
      resizable: true,
    }),
    []
  );

  /** Column definitions */
  const columnDefs = useMemo<ColDef[]>(() => {
    return [
      {
        field: "product_name",
        headerName: getLabel("product_name", "Product Name"),
        flex: 2,
        minWidth: 150,
      },
      {
        field: "specification",
        headerName: getLabel("specification", "Specification"),
        flex: 2,
        minWidth: 150,
      },
      {
        field: "size",
        headerName: getLabel("size", "Size"),
        flex: 1,
        minWidth: 80,
      },
      {
        field: "unit",
        headerName: getLabel("unit", "Unit"),
        flex: 1,
        minWidth: 80,
      },
      {
        field: "planned_qty",
        headerName: getLabel("planned_qty", "Planned Qty"),
        flex: 1,
        minWidth: 100,
        valueFormatter: ({ value }) => (value != null ? String(value) : "-"),
      },
      {
        field: "produced_qty",
        headerName: getLabel("produced_qty", "Produced Qty"),
        flex: 1,
        minWidth: 100,
        valueFormatter: ({ value }) => (value != null ? String(value) : "-"),
      },
      {
        field: "progress",
        headerName: getLabel("progress", "Progress"),
        flex: 1,
        minWidth: 100,
        valueGetter: (params) => {
          const planned = params.data?.planned_qty;
          const produced = params.data?.produced_qty;
          if (planned && produced) {
            return (
              ((Number(produced) / Number(planned)) * 100).toFixed(1) + "%"
            );
          }
          return "-";
        },
      },
      {
        field: "glazing",
        headerName: getLabel("glazing", "Glazing"),
        flex: 1,
        minWidth: 80,
        valueFormatter: ({ value }) =>
          value ? (Number(value) * 100).toFixed(0) + "%" : "-",
      },
      {
        field: "inner_packaging",
        headerName: getLabel("inner_packaging", "Inner Pkg"),
        flex: 1,
        minWidth: 100,
      },
      {
        field: "outter_packaging",
        headerName: getLabel("outter_packaging", "Outer Pkg"),
        flex: 1,
        minWidth: 100,
      },
      {
        field: "gross_weight",
        headerName: getLabel("gross_weight", "Gross Wt"),
        flex: 1,
        minWidth: 100,
        valueFormatter: ({ value }) =>
          value ? Number(value).toFixed(2) + " kg" : "-",
      },
      {
        field: "net_weight",
        headerName: getLabel("net_weight", "Net Wt"),
        flex: 1,
        minWidth: 100,
        valueFormatter: ({ value }) =>
          value ? Number(value).toFixed(2) + " kg" : "-",
      },
    ];
  }, [getLabel]);

  /** Empty state */
  if (!value?.length) {
    return <EmptySlot message={i18n.t("No production items")} />;
  }

  return (
    <View className={`w-full ${className}`} style={{ overflow: "hidden" }}>
      {/* Header */}
      <View className="mb-3 flex-row items-center justify-end pr-2">
        <Text className="text-xs text-gray-400">
          {i18n.t("Total")}: {value.length}
        </Text>
      </View>

      {/* Table */}
      <View style={{ width: "100%", height: 400 }}>
        <AgGridReact
          theme={myTableTheme}
          rowData={value}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={false}
          suppressMovableColumns={true}
          {...agGridReactProps}
        />
      </View>
    </View>
  );
}
