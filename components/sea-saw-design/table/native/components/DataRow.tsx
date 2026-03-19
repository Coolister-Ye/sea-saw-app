import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import type { ComputedColumn, CellRendererProps } from "../types";
import { formatValue } from "../utils";

export const ROW_HEIGHT = 44;

type DataRowProps = {
  row: Record<string, any>;
  columns: ComputedColumn[];
  isEven: boolean;
  isSelected: boolean;
  context?: Record<string, any>;
  onPress?: () => void;
};

export function DataRow({
  row,
  columns,
  isEven,
  isSelected,
  context,
  onPress,
}: DataRowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={[
        styles.row,
        isEven && styles.rowEven,
        isSelected && styles.rowSelected,
      ]}
    >
      {isSelected && <View style={styles.selectionAccent} />}
      {columns.map((col) => {
        const value = row[col.field];
        return (
          <View
            key={col.field}
            style={[
              styles.cell,
              { width: col.width },
              isSelected && styles.cellSelected,
            ]}
          >
            {resolveCellContent(col, value, row, context)}
          </View>
        );
      })}
    </TouchableOpacity>
  );
}

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
      {formatValue(value, col.fieldMeta)}
    </Text>
  );
}

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
