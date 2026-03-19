import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComputedColumn, SortState } from "../types";

export const HEADER_HEIGHT = 40;

type HeaderRowProps = {
  columns: ComputedColumn[];
  sortState: SortState;
  onSort: (field: string) => void;
};

/**
 * Table header row with multi-column sort support.
 *
 * Sort indicators per column:
 *  - Active asc/desc: blue arrow + numeric priority badge (when >1 col sorted)
 *  - Sortable but unsorted: faint swap icon
 *  - Not sortable: no icon
 *
 * Tap cycles: unsorted → asc → desc → unsorted (AgGrid alwaysMultiSort).
 */
export function HeaderRow({ columns, sortState, onSort }: HeaderRowProps) {
  const hasMultiSort = sortState.length > 1;

  return (
    <View style={styles.row}>
      {columns.map((col) => {
        const sortIdx = sortState.findIndex((s) => s.field === col.field);
        const isSorted = sortIdx !== -1;
        const direction = isSorted ? sortState[sortIdx].direction : null;
        const priority = sortIdx + 1; // 1-based for display

        return (
          <TouchableOpacity
            key={col.field}
            style={[styles.cell, { width: col.width }]}
            onPress={() => col.sortable && onSort(col.field)}
            activeOpacity={col.sortable ? 0.6 : 1}
          >
            <Text style={styles.label} numberOfLines={1}>
              {col.headerName}
            </Text>

            {col.sortable && isSorted && direction ? (
              <View style={styles.sortIndicator}>
                <Ionicons
                  name={direction === "asc" ? "arrow-up" : "arrow-down"}
                  size={11}
                  color="#1677ff"
                />
                {hasMultiSort && (
                  <View style={styles.priorityBadge}>
                    <Text style={styles.priorityText}>{priority}</Text>
                  </View>
                )}
              </View>
            ) : col.sortable ? (
              <Ionicons
                name="swap-vertical-outline"
                size={11}
                color="#d9d9d9"
                style={{ marginLeft: 3 }}
              />
            ) : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    height: HEADER_HEIGHT,
    backgroundColor: "#fafafa",
    borderBottomWidth: 1,
    borderBottomColor: "#e8e8e8",
  },
  cell: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: "#f0f0f0",
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: "#262626",
    flexShrink: 1,
  },
  sortIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 3,
    gap: 2,
    flexShrink: 0,
  },
  priorityBadge: {
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#1677ff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  priorityText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#fff",
    lineHeight: 13,
  },
});
