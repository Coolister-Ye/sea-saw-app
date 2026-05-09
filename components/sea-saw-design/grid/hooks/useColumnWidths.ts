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

import { useState, useCallback, useRef, useMemo } from "react";
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

  // Refs keep getWidth stable (empty dep array) across column list changes
  const widthOverridesRef = useRef(widthOverrides);
  widthOverridesRef.current = widthOverrides;
  const leftColsRef = useRef(leftCols);
  leftColsRef.current = leftCols;
  const centerColsRef = useRef(centerCols);
  centerColsRef.current = centerCols;
  const rightColsRef = useRef(rightCols);
  rightColsRef.current = rightCols;

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

      // Build a Set of flex-eligible fields once (O(n)) to avoid O(n²) find inside forEach
      const flexFields = new Set(
        centerCols.filter((c) => c.flex != null).map((c) => c.field),
      );
      const newOverrides = new Map(overrides);
      flexed.forEach((c) => {
        if (flexFields.has(c.field)) {
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

  // Stable identity — reads from refs so column list changes don't invalidate GridRow memos
  const getWidth = useCallback((field: string) => {
    const ow = widthOverridesRef.current.get(field);
    if (ow != null) return ow;
    const col =
      leftColsRef.current.find((c) => c.field === field) ??
      centerColsRef.current.find((c) => c.field === field) ??
      rightColsRef.current.find((c) => c.field === field);
    return col?.width ?? 120;
  }, []);

  const leftSectionWidth = useMemo(
    () => leftCols.reduce((s, c) => s + getWidth(c.field), 0),
    [leftCols, widthOverrides],
  );
  const rightSectionWidth = useMemo(
    () => rightCols.reduce((s, c) => s + getWidth(c.field), 0),
    [rightCols, widthOverrides],
  );
  const scrollableWidth = useMemo(() => {
    const w = centerCols.reduce((s, c) => s + getWidth(c.field), 0);
    return Math.max(300, w);
  }, [centerCols, widthOverrides]);

  return {
    getWidth,
    setWidth,
    onContainerLayout,
    scrollableWidth,
    leftSectionWidth,
    rightSectionWidth,
  };
}
