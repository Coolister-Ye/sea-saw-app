import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";
import type { ComputedColumn } from "../types";

export const ROW_HEIGHT = 44;
const SKELETON_COUNT = 8;

type SkeletonCellProps = { width: number; delay: number };

/**
 * A single skeleton cell with a pulsing shimmer animation.
 * Each cell has a staggered `delay` so columns animate at slightly different phases,
 * giving a wave-like shimmer effect similar to AG Grid's skeleton overlay.
 */
function SkeletonCell({ width, delay }: SkeletonCellProps) {
  const opacity = useRef(new Animated.Value(0.25)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.25,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity, delay]);

  return (
    <View style={[styles.cell, { width }]}>
      <Animated.View style={[styles.placeholder, { opacity }]} />
    </View>
  );
}

type SkeletonRowProps = {
  columns: ComputedColumn[];
  rowIndex: number;
};

function SkeletonRow({ columns, rowIndex }: SkeletonRowProps) {
  return (
    <View style={[styles.row, rowIndex % 2 === 0 && styles.rowEven]}>
      {columns.map((col, colIdx) => (
        <SkeletonCell
          key={col.field}
          width={col.width}
          // Stagger by row and column so the shimmer ripples diagonally
          delay={(rowIndex * 60 + colIdx * 30) % 400}
        />
      ))}
    </View>
  );
}

type SkeletonRowsProps = {
  columns: ComputedColumn[];
  count?: number;
};

/**
 * Renders a configurable number of animated skeleton rows.
 * Shown during the initial data fetch when no rows are available yet —
 * mirrors AgGrid's built-in loading skeleton overlay.
 */
export function SkeletonRows({ columns, count = SKELETON_COUNT }: SkeletonRowsProps) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonRow key={i} columns={columns} rowIndex={i} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    height: ROW_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
    backgroundColor: "#fff",
  },
  rowEven: {
    backgroundColor: "#fafafa",
  },
  cell: {
    justifyContent: "center",
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: "#f0f0f0",
  },
  placeholder: {
    height: 12,
    borderRadius: 6,
    backgroundColor: "#e8e8e8",
    width: "75%",
  },
});
