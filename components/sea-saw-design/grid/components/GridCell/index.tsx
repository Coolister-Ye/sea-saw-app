/**
 * GridCell — renders a single data cell.
 *
 * Dispatcher priority (mirrors AG Grid ValueService):
 *   1. cellRenderer({ value, data, context })
 *   2. renderCell(value, row)
 *   3. valueFormatter → Text  (default)
 */
import React, { memo } from "react";
import { StyleSheet, View, Text } from "react-native";
import { resolveValue, formatCellValue } from "./utils";
import { GRID_ROW_HEIGHT } from "../../constants";
import type { ComputedColumn, CellRendererProps } from "../../types";

export { GRID_ROW_HEIGHT };

type GridCellProps = {
  col: ComputedColumn;
  width: number;
  row: Record<string, any>;
  context?: Record<string, any>;
};

const cellStyle = StyleSheet.create({
  row: { height: GRID_ROW_HEIGHT },
});

export const GridCell = memo(function GridCell({
  col,
  width,
  row,
  context,
}: GridCellProps) {
  const value = resolveValue(col, row, context);

  return (
    <View
      style={[cellStyle.row, { width }]}
      className="flex-row items-center overflow-hidden border-r border-gray-200 px-3"
    >
      {renderCellContent(col, value, row, context)}
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
    const Renderer = col.cellRenderer as React.ComponentType<CellRendererProps>;
    return <Renderer value={value} data={row} context={context} />;
  }
  if (col.renderCell) {
    return col.renderCell(value, row, col.fieldMeta);
  }
  return (
    <Text className="flex-1 text-[13px] text-gray-800" numberOfLines={1}>
      {formatCellValue(col, value, row, context)}
    </Text>
  );
}
