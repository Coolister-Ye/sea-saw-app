/**
 * useColumnWidths — manages pixel widths for Grid columns.
 *
 * Mirrors AG Grid's ColumnFlexService + ResizeFeature combined.
 *
 * Responsibilities:
 *   • Stores per-column pixel widths in a Map (initial values from ComputedColumn)
 *   • Re-runs flex distribution when container width changes (onContainerLayout)
 *   • Exposes setWidth() for interactive resize (removes flex for that column)
 *   • Re-distributes when the column list changes (pinning / visibility mutations)
 */

import { useState, useCallback, useRef } from "react";
import type { LayoutChangeEvent } from "react-native";
import { applyFlexWidths } from "../utils";
import type { ComputedColumn } from "../types";

type UseColumnWidthsResult = {
  /** Get current pixel width for a field */
  getWidth(field: string): number;
  /** Set a fixed pixel width (removes flex) */
  setWidth(field: string, width: number): void;
  /** Attach to root container onLayout */
  onContainerLayout(e: LayoutChangeEvent): void;
  /** Current total pixel width of the scrollable center section (min 300) */
  scrollableWidth: number;
  /** Total pixel width of pinned-left section */
  leftSectionWidth: number;
  /** Total pixel width of pinned-right section */
  rightSectionWidth: number;
};

export function useColumnWidths(
  leftCols: ComputedColumn[],
  centerCols: ComputedColumn[],
  rightCols: ComputedColumn[],
): UseColumnWidthsResult {
  // widths override map: field → pixel width
  const [widthOverrides, setWidthOverrides] = useState<Map<string, number>>(new Map());
  const containerWidthRef = useRef(0);

  /** Apply flex distribution to center columns given a container width */
  const computeFlexWidths = useCallback(
    (containerWidth: number, overrides: Map<string, number>) => {
      const leftW = leftCols.reduce(
        (s, c) => s + (overrides.get(c.field) ?? c.width),
        0,
      );
      const rightW = rightCols.reduce(
        (s, c) => s + (overrides.get(c.field) ?? c.width),
        0,
      );
      const available = Math.max(300, containerWidth - leftW - rightW);

      // Apply widthOverrides before flex distribution
      const centerWithOverrides = centerCols.map((c) => {
        const ow = overrides.get(c.field);
        return ow != null ? { ...c, width: ow, flex: undefined } : c;
      });

      const flexed = applyFlexWidths(centerWithOverrides, available);
      const newOverrides = new Map(overrides);
      flexed.forEach((c) => {
        // Only update override if flex was active for this column
        if (centerCols.find((cc) => cc.field === c.field)?.flex != null) {
          newOverrides.set(c.field, c.width);
        }
      });
      return newOverrides;
    },
    [leftCols, centerCols, rightCols],
  );

  const onContainerLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const w = e.nativeEvent.layout.width;
      if (w === containerWidthRef.current) return;
      containerWidthRef.current = w;
      setWidthOverrides((prev) => computeFlexWidths(w, prev));
    },
    [computeFlexWidths],
  );

  const setWidth = useCallback((field: string, width: number) => {
    setWidthOverrides((prev) => {
      const next = new Map(prev);
      next.set(field, width);
      return computeFlexWidths(containerWidthRef.current, next);
    });
  }, [computeFlexWidths]);

  const getWidth = useCallback(
    (field: string) => {
      const ow = widthOverrides.get(field);
      if (ow != null) return ow;
      const col =
        leftCols.find((c) => c.field === field) ??
        centerCols.find((c) => c.field === field) ??
        rightCols.find((c) => c.field === field);
      return col?.width ?? 120;
    },
    [widthOverrides, leftCols, centerCols, rightCols],
  );

  const leftSectionWidth = leftCols.reduce(
    (s, c) => s + getWidth(c.field),
    0,
  );
  const rightSectionWidth = rightCols.reduce(
    (s, c) => s + getWidth(c.field),
    0,
  );
  const centerContentWidth = centerCols.reduce(
    (s, c) => s + getWidth(c.field),
    0,
  );
  const scrollableWidth = Math.max(300, centerContentWidth);

  return {
    getWidth,
    setWidth,
    onContainerLayout,
    scrollableWidth,
    leftSectionWidth,
    rightSectionWidth,
  };
}
