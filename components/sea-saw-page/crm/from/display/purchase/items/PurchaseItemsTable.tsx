import React, { useMemo } from "react";
import i18n from '@/locale/i18n';
import { View } from "react-native";
import { AgGridReact } from "ag-grid-react";
import type { AgGridReactProps } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import { Text } from "@/components/ui/text";
import { getFieldLabelMap } from "@/utils";
import { myTableTheme } from "@/components/sea-saw-design/table/theme";
import EmptySlot from "../../../base/EmptySlot";

interface PurchaseItemsTableProps {
  def?: any;
  value?: any[] | null;
  className?: string;
  agGridReactProps?: AgGridReactProps;
}

export default function PurchaseItemsTable({
  def,
  value = [],
  className = "",
  agGridReactProps,
}: PurchaseItemsTableProps) {
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
        field: "purchase_qty",
        headerName: getLabel("purchase_qty", "Purchase Qty"),
        flex: 1,
        minWidth: 120,
        valueFormatter: ({ value }) => (value != null ? String(value) : "-"),
      },
      {
        field: "unit_price",
        headerName: getLabel("unit_price", "Unit Price"),
        flex: 1,
        minWidth: 100,
        valueFormatter: ({ value }) => (value ? Number(value).toFixed(2) : "-"),
      },
      {
        field: "total_price",
        headerName: getLabel("total_price", "Total Price"),
        flex: 1,
        minWidth: 120,
        valueFormatter: ({ value }) => (value ? Number(value).toFixed(2) : "-"),
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
      {
        field: "total_gross_weight",
        headerName: getLabel("total_gross_weight", "Total Gross Wt"),
        flex: 1,
        minWidth: 130,
        valueFormatter: ({ value }) =>
          value ? Number(value).toFixed(2) + " kg" : "-",
      },
      {
        field: "total_net_weight",
        headerName: getLabel("total_net_weight", "Total Net Wt"),
        flex: 1,
        minWidth: 130,
        valueFormatter: ({ value }) =>
          value ? Number(value).toFixed(2) + " kg" : "-",
      },
    ];
  }, [getLabel]);

  /** Empty state */
  if (!value?.length) {
    return <EmptySlot message={i18n.t("No purchase items")} />;
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
