import React, { memo, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import type { ComputedColumn, CellRendererProps } from "../types";
import { resolveValue, formatCellValue } from "../utils";

export const ROW_HEIGHT = 44;

/* ═══════════════════════════════════════════════════════════════════════════
   DataCell — mirrors ag-grid's per-cell component lifecycle.
   Memoised so only cells whose column or row data changes re-render,
   e.g. flex width recalculation only re-renders affected column cells.
   ═══════════════════════════════════════════════════════════════════════════ */

type DataCellProps = {
  col: ComputedColumn;
  row: Record<string, any>;
  isSelected: boolean;
  context?: Record<string, any>;
};

const DataCell = memo(function DataCell({
  col,
  row,
  isSelected,
  context,
}: DataCellProps) {
  const value = resolveValue(col, row, context);
  return (
    <View
      style={[
        styles.cell,
        { width: col.width },
        isSelected && styles.cellSelected,
      ]}
    >
      {resolveCellContent(col, value, row, context)}
    </View>
  );
});

function resolveCellContent(
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
    return col.renderCell(value, row);
  }
  return (
    <Text style={styles.cellText} numberOfLines={1}>
      {formatCellValue(col, value, row, context)}
    </Text>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   DataRow — memoised row container.
   Owns its press closure so TableBody never needs to wrap it per-row,
   enabling React.memo to bail out when row data is unchanged.
   ═══════════════════════════════════════════════════════════════════════════ */

type DataRowProps = {
  row: Record<string, any>;
  /**
   * Stable string key — passed explicitly so DataRow can create its own
   * press closure without TableBody re-wrapping it on every render.
   */
  rowKey: string;
  columns: ComputedColumn[];
  isEven: boolean;
  isSelected: boolean;
  context?: Record<string, any>;
  /**
   * Stable callback (useCallback from the orchestrator).
   * DataRow creates a single internal closure from it.
   */
  onRowPress?: (row: Record<string, any>, key: string) => void;
};

export const DataRow = memo(function DataRow({
  row,
  rowKey,
  columns,
  isEven,
  isSelected,
  context,
  onRowPress,
}: DataRowProps) {
  const handlePress = useCallback(
    () => onRowPress?.(row, rowKey),
    [onRowPress, row, rowKey],
  );

  return (
    <TouchableOpacity
      onPress={onRowPress ? handlePress : undefined}
      activeOpacity={onRowPress ? 0.7 : 1}
      style={[
        styles.row,
        isEven && styles.rowEven,
        isSelected && styles.rowSelected,
      ]}
    >
      {isSelected && <View style={styles.selectionAccent} />}
      {columns.map((col) => (
        <DataCell
          key={col.field}
          col={col}
          row={row}
          isSelected={isSelected}
          context={context}
        />
      ))}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    minHeight: ROW_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
    backgroundColor: "#fff",
    position: "relative",
  },
  rowEven: {
    backgroundColor: "#fafafa",
  },
  rowSelected: {
    backgroundColor: "#e6f4ff",
    borderBottomColor: "#bae0ff",
  },
  selectionAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: "#1677ff",
    zIndex: 1,
  },
  cell: {
    justifyContent: "center",
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: "#f0f0f0",
  },
  cellSelected: {
    borderRightColor: "#bae0ff",
  },
  cellText: {
    fontSize: 13,
    color: "#262626",
  },
});
