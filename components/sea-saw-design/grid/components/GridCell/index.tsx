/**
 * GridCell — renders a single data cell.
 *
 * Dispatcher priority (mirrors AG Grid ValueService):
 *   1. cellRenderer({ value, data, context })
 *   2. renderCell(value, row)
 *   3. valueFormatter → Text  (default)
 */
import React, { memo } from "react";
import { View, Text } from "react-native";
import { resolveValue, formatCellValue } from "./utils";
import { GRID_ROW_HEIGHT } from "../../constants";
import type { ComputedColumn, CellRendererProps } from "../../types";

export { GRID_ROW_HEIGHT };

type GridCellProps = {
  col: ComputedColumn;
  width: number;
  row: Record<string, any>;
  isSelected: boolean;
  context?: Record<string, any>;
};

export const GridCell = memo(function GridCell({
  col,
  width,
  row,
  isSelected,
  context,
}: GridCellProps) {
  const value = resolveValue(col, row, context);

  return (
    <View
      style={{ width, height: GRID_ROW_HEIGHT }}
      className={[
        "justify-center overflow-hidden border-r border-[#e5e7eb]",
        isSelected ? "bg-[#eff6ff]" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <View className="px-3">
        {renderCellContent(col, value, row, context)}
      </View>
    </View>
  );
});

function renderCellContent(
  col: ComputedColumn,
  value: any,
  row: Record<string, any>,
  context?: Record<string, any>,
) {
  if (col.cellRenderer) {
    const props: CellRendererProps = { value, data: row, context };
    return col.cellRenderer(props);
  }
  if (col.renderCell) {
    return col.renderCell(value, row, col.fieldMeta);
  }
  return (
    <Text className="text-[13px] text-[#1f2937]" numberOfLines={1}>
      {formatCellValue(col, value, row, context)}
    </Text>
  );
}
