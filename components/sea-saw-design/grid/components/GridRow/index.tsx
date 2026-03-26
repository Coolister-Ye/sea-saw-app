/**
 * GridRow — memoized data row for Grid.
 *
 * Quartz theme: height 30px, rowBorder #f3f4f6,
 *   hover #f3f4f6, selected #eff6ff, accent stripe #3b82f6
 */
import React, { memo, useCallback, useState } from "react";
import { View, TouchableOpacity, Platform } from "react-native";
import { GridCell } from "../GridCell";
import { GRID_ROW_HEIGHT } from "../../constants";
import type { ComputedColumn } from "../../types";

type GridRowProps = {
  row: Record<string, any>;
  rowKey: string;
  columns: ComputedColumn[];
  getWidth: (field: string) => number;
  isEven: boolean;
  isSelected: boolean;
  context?: Record<string, any>;
  onRowPress?: (row: Record<string, any>, key: string) => void;
};

export const GridRow = memo(function GridRow({
  row,
  rowKey,
  columns,
  getWidth,
  isEven,
  isSelected,
  context,
  onRowPress,
}: GridRowProps) {
  const [hovered, setHovered] = useState(false);

  const handlePress = useCallback(
    () => onRowPress?.(row, rowKey),
    [onRowPress, row, rowKey],
  );

  const bgColor = isSelected
    ? "#eff6ff"
    : hovered
      ? "#f3f4f6"
      : isEven
        ? "#fafafa"
        : "#ffffff";

  return (
    <TouchableOpacity
      onPress={onRowPress ? handlePress : undefined}
      activeOpacity={onRowPress ? 0.7 : 1}
      {...(Platform.OS === "web"
        ? { onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false) }
        : {})}
      style={{
        flexDirection: "row",
        height: GRID_ROW_HEIGHT,
        borderBottomWidth: 1,
        borderBottomColor: "#f3f4f6",
        backgroundColor: bgColor,
        position: "relative",
      }}
    >
      {isSelected && (
        <View
          style={{
            position: "absolute",
            left: 0, top: 0, bottom: 0,
            width: 3,
            backgroundColor: "#3b82f6",
            zIndex: 1,
          }}
        />
      )}
      {columns.map((col) => (
        <GridCell
          key={col.field}
          col={col}
          width={getWidth(col.field)}
          row={row}
          isSelected={isSelected}
          context={context}
        />
      ))}
    </TouchableOpacity>
  );
});
