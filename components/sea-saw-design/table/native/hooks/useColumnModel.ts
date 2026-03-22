import { useState, useCallback, useMemo } from "react";
import { LayoutChangeEvent } from "react-native";
import { useTableMeta } from "./useTableMeta";
import { applyFlexWidths } from "../utils";
import type { ComputedColumn, NativeColDefinition } from "../types";
import type { HeaderMetaProps } from "../../interface";

type UseColumnModelParams = {
  viewSet: any;
  initialHeaderMeta?: HeaderMetaProps | Record<string, HeaderMetaProps>;
  colDefinitions?: Record<string, NativeColDefinition>;
  hideWriteOnly: boolean;
  columnOrder?: string[];
};

export type ColumnModelResult = {
  /** Pinned-left columns */
  leftCols: ComputedColumn[];
  /** Center columns with flex widths resolved after layout */
  centerCols: ComputedColumn[];
  /** Pinned-right columns */
  rightCols: ComputedColumn[];
  /** All columns in display order for getColumnState() */
  allCols: ComputedColumn[];
  /** Total pixel width of the pinned-left section */
  leftWidth: number;
  /** Total pixel width of the pinned-right section */
  rightWidth: number;
  /** Content width of the scrollable center section (min 300px) */
  scrollableWidth: number;
  hasPinnedLeft: boolean;
  hasPinnedRight: boolean;
  /** Attach to the root container's onLayout to trigger flex resolution */
  onContainerLayout: (e: LayoutChangeEvent) => void;
  isLoading: boolean;
  error: string | null;
};

/**
 * Manages the full column pipeline:
 *   raw meta → ComputedColumns → pinned sections → flex width resolution
 *
 * Mirrors ag-grid's ColumnModel + VisibleColsService + ColumnFlexService
 * combined into a single React hook.
 *
 * Pipeline stages:
 *   1. Fetch OPTIONS metadata and build ComputedColumns  (useTableMeta)
 *   2. Split into left / center / right sections        (VisibleColsService)
 *   3. Resolve flex widths after container layout       (ColumnFlexService)
 */
export function useColumnModel({
  viewSet,
  initialHeaderMeta,
  colDefinitions,
  hideWriteOnly,
  columnOrder,
}: UseColumnModelParams): ColumnModelResult {
  /* ── Stage 1: fetch metadata & build ComputedColumns ── */
  const { columns, isLoading, error } = useTableMeta({
    viewSet,
    initialHeaderMeta,
    colDefinitions,
    hideWriteOnly,
    columnOrder,
  });

  /* ── Stage 2: split into pinned sections (VisibleColsService) ── */
  const leftCols = useMemo(
    () => columns.filter((c) => c.pinned === "left"),
    [columns],
  );
  const rawCenterCols = useMemo(
    () => columns.filter((c) => !c.pinned),
    [columns],
  );
  const rightCols = useMemo(
    () => columns.filter((c) => c.pinned === "right"),
    [columns],
  );

  const leftWidth = useMemo(
    () => leftCols.reduce((s, c) => s + c.width, 0),
    [leftCols],
  );
  const rightWidth = useMemo(
    () => rightCols.reduce((s, c) => s + c.width, 0),
    [rightCols],
  );

  /* ── Stage 3: flex resolution (ColumnFlexService) ── */
  const [containerWidth, setContainerWidth] = useState(0);

  const onContainerLayout = useCallback((e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  }, []);

  const centerCols = useMemo(() => {
    if (containerWidth === 0) return rawCenterCols;
    return applyFlexWidths(
      rawCenterCols,
      containerWidth - leftWidth - rightWidth,
    );
  }, [rawCenterCols, containerWidth, leftWidth, rightWidth]);

  const scrollableWidth = useMemo(
    () => Math.max(centerCols.reduce((s, c) => s + c.width, 0), 300),
    [centerCols],
  );

  const allCols = useMemo(
    () => [...leftCols, ...centerCols, ...rightCols],
    [leftCols, centerCols, rightCols],
  );

  return {
    leftCols,
    centerCols,
    rightCols,
    allCols,
    leftWidth,
    rightWidth,
    scrollableWidth,
    hasPinnedLeft: leftCols.length > 0,
    hasPinnedRight: rightCols.length > 0,
    onContainerLayout,
    isLoading,
    error,
  };
}
