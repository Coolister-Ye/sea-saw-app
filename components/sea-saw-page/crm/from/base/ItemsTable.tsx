import React, { useMemo } from "react";
import { View } from "react-native";
import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import type { ColDef, Theme } from "ag-grid-community";

import { Text } from "@/components/ui/text";
import { useLocale } from "@/context/Locale";
import { FormDef } from "@/hooks/useFormDefs";
import { HeaderMetaProps } from "@/components/sea-saw-design/table/interface";
import { theme as defaultTheme } from "@/components/sea-saw-design/table/theme";
import EmptySlot from "./EmptySlot";

export interface ColumnConfig {
  field: string;
  headerName?: string;
  flex?: number;
  minWidth?: number;
  valueFormatter?: (params: { value: any; data?: any }) => string;
  valueGetter?: (params: { data: any }) => any;
  cellRenderer?: (params: any) => React.ReactNode;
}

/** Helper type for column builder function */
export type ColumnBuilder = (
  getLabel: (field: string, fallback?: string) => string,
) => ColumnConfig[];

export interface ItemsTableProps {
  def?: FormDef;
  value?: any[] | null;
  className?: string;
  agGridReactProps?: AgGridReactProps;
  /** Custom column configurations - if provided, these override auto-generated columns */
  columns?: ColumnConfig[] | ColumnBuilder;
  /** Column overrides - merged with auto-generated columns from def */
  columnOverrides?: Record<string, Partial<ColumnConfig>>;
  /** Fields to exclude from auto-generated columns */
  excludeFields?: string[];
  /** Empty message when no items */
  emptyMessage?: string;
  /** Default table height */
  height?: number;
  /** Row height for calculating dynamic height */
  rowHeight?: number;
  /** Show total count header */
  showTotal?: boolean;
  /** Custom AG Grid theme */
  theme?: Theme;
}

/**
 * Reusable items table component using AG Grid
 * Can be used for ProductItems, ProductionItems, or any other list data
 */
export default function ItemsTable({
  def,
  value,
  className = "",
  agGridReactProps,
  columns,
  columnOverrides,
  excludeFields = ["id"],
  emptyMessage,
  height = 400,
  rowHeight = 35,
  showTotal = false,
  theme,
}: ItemsTableProps) {
  const { i18n } = useLocale();

  const items = useMemo(() => value ?? [], [value]);

  // Build field label map from def
  const fieldLabelMap = useMemo(() => {
    const children: Record<string, HeaderMetaProps> =
      def?.child?.children ?? {};
    const map: Record<string, string> = {};
    Object.entries(children).forEach(([field, meta]) => {
      if (meta.label) {
        map[field] = meta.label;
      }
    });
    return map;
  }, [def]);

  // Helper to get label with fallback
  const getLabel = useMemo(
    () => (field: string, fallback?: string) =>
      fieldLabelMap[field] ??
      (fallback ? (i18n.t?.(fallback) ?? fallback) : field),
    [fieldLabelMap, i18n],
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      editable: false,
      filter: false,
      flex: 1,
      minWidth: 120,
      resizable: true,
      suppressHeaderMenuButton: false,
      mainMenuItems: ["autoSizeThis", "autoSizeAll"],
    }),
    [],
  );

  const columnDefs = useMemo<ColDef[]>(() => {
    // If custom columns provided (as array or builder function), use them directly
    if (columns) {
      const columnArray =
        typeof columns === "function" ? columns(getLabel) : columns;
      return columnArray.map((col: ColumnConfig) => ({
        field: col.field,
        headerName: col.headerName ?? col.field,
        flex: col.flex ?? 1,
        minWidth: col.minWidth,
        valueFormatter: col.valueFormatter,
        valueGetter: col.valueGetter,
        cellRenderer: col.cellRenderer,
      }));
    }

    // Auto-generate from def metadata
    const headerMeta: Record<string, HeaderMetaProps> =
      def?.child?.children ?? {};

    let cols = Object.entries(headerMeta)
      .filter(([field]) => !excludeFields.includes(field))
      .map(([field, meta]) => {
        const override = columnOverrides?.[field];
        return {
          field,
          headerName: override?.headerName ?? meta.label ?? field,
          flex: override?.flex ?? 1,
          minWidth: override?.minWidth,
          valueFormatter:
            override?.valueFormatter ??
            ((params: { value: any }) => params.value ?? "-"),
          valueGetter: override?.valueGetter,
          cellRenderer: override?.cellRenderer,
        };
      });

    // Fallback: infer from data
    if (cols.length === 0 && items.length > 0) {
      cols = Object.keys(items[0])
        .filter((field) => !excludeFields.includes(field))
        .map((field) => {
          const override = columnOverrides?.[field];
          return {
            field,
            headerName: override?.headerName ?? field,
            flex: override?.flex ?? 1,
            minWidth: override?.minWidth,
            valueFormatter:
              override?.valueFormatter ??
              ((params: { value: any }) => params.value ?? "-"),
            valueGetter: override?.valueGetter,
            cellRenderer: override?.cellRenderer,
          };
        });
    }

    return cols;
  }, [
    def?.child?.children,
    items,
    columns,
    columnOverrides,
    excludeFields,
    getLabel,
  ]);

  if (!items.length) {
    return <EmptySlot message={emptyMessage ?? i18n.t("No items")} />;
  }

  const tableHeight = Math.min(items.length * rowHeight + 45, height);

  return (
    <View className={`w-full ${className}`} style={{ overflow: "hidden" }}>
      {/* Table */}
      <View style={{ width: "100%", height: tableHeight }}>
        <AgGridReact
          theme={theme ?? defaultTheme}
          rowData={items}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={false}
          suppressMovableColumns={true}
          domLayout="normal"
          getContextMenuItems={() => [
            "copy",
            "copyWithHeaders",
            "separator",
            "export",
          ]}
          {...agGridReactProps}
        />
      </View>
    </View>
  );
}
