import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { AgGridReact } from "ag-grid-react";
import type { AgGridReactProps } from "ag-grid-react";
import { ColDef } from "ag-grid-community";

import { useLocale } from "@/context/Locale";
import { FormDef } from "@/hooks/useFormDefs";
import { HeaderMetaProps } from "@/components/sea-saw-design/table/interface";
import { myTableTheme } from "@/components/sea-saw-design/table/theme";
import EmptySlot from "../../../base/EmptySlot";

type ProductItemsTableProps = {
  def?: FormDef;
  value?: any[] | null;
  className?: string;
  agGridReactProps?: AgGridReactProps;
};

export default function ProductItemsTable({
  def,
  value,
  className = "",
  agGridReactProps,
}: ProductItemsTableProps) {
  const { i18n } = useLocale();

  /** 默认列定义 */
  const defaultColDef = useMemo<ColDef>(
    () => ({
      editable: false,
      filter: false,
      flex: 1,
      minWidth: 100,
    }),
    []
  );

  /** 生成列定义 */
  const columnDefs = useMemo<ColDef[]>(() => {
    const headerMeta: Record<string, HeaderMetaProps> =
      def?.child?.children ?? {};

    return Object.entries(headerMeta).map(([field, meta]) => ({
      field,
      headerName: meta.label || field,
      flex: 1,
      valueFormatter: ({ value }) => value ?? "-",
    }));
  }, [def]);

  // 标准化 value 为数组
  const items = value ?? [];

  /** 空状态 */
  if (!items.length) {
    return <EmptySlot message={i18n.t("No product information")} />;
  }

  return (
    <View className={`w-full ${className}`} style={{ overflow: "hidden" }}>
      {/* Header */}
      <View className="mb-3 flex-row items-center justify-end pr-2">
        <Text className="text-xs text-gray-400">
          {i18n.t("Total")}: {items.length}
        </Text>
      </View>

      {/* Table */}
      <View style={{ width: "100%", height: 150 }}>
        <AgGridReact
          theme={myTableTheme}
          rowData={items}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={false}
          suppressMovableColumns={true} // 防止拖动列乱布局
          {...agGridReactProps}
        />
      </View>
    </View>
  );
}
