/**
 * useGridColumnState — manages all column state for Grid.
 *
 * Handles:
 *   • Column pinning, visibility, ordering state
 *   • Computed sections (leftCols / centerCols / rightCols)
 *   • Runtime mutations: pin, hide, show, move
 *   • Column menu state: open / close
 *
 * Mirrors AG Grid's ColumnModel + VisibleColsService + column menu logic,
 * but backed by TanStack ColumnPinningState / VisibilityState / ColumnOrderState
 * types for consistent, predictable state shapes.
 *
 * Note: Column group spans are computed in the parent (Grid) after column widths
 * are available from useColumnWidths, avoiding a circular dependency.
 */

import { useState, useCallback, useMemo } from "react";
import {
  type ColumnPinningState,
  type VisibilityState,
  type ColumnOrderState,
} from "@tanstack/react-table";

import { GridCheckboxCell } from "../components/GridCheckboxCell";
import { GRID_SELECTION_FIELD } from "../constants";
import type { ComputedColumn } from "../types";
import type { GridColumnMenuState } from "../components/GridColumnMenu";

/* ─────────────────────────────────────────────────────────────────────────
   Constants
   ───────────────────────────────────────────────────────────────────────── */

const CHECKBOX_COL_WIDTH = 44;

const CLOSED_MENU: GridColumnMenuState = {
  visible: false,
  field: "",
  headerName: "",
  x: 0,
  y: 0,
};

const SELECTION_COMPUTED_COL: ComputedColumn = {
  field: GRID_SELECTION_FIELD,
  headerName: "",
  width: CHECKBOX_COL_WIDTH,
  sortable: false,
  pinned: "left",
  resizable: false,
  suppressMenu: true,
  cellRenderer: GridCheckboxCell,
};

/* ─────────────────────────────────────────────────────────────────────────
   Types
   ───────────────────────────────────────────────────────────────────────── */

type UseGridColumnStateParams = {
  /** Columns from OPTIONS metadata (from useTableMeta) */
  metaColumns: ComputedColumn[];
  showCheckboxColumn: boolean;
};

export type UseGridColumnStateResult = {
  /* ── Column sections ── */
  allMetaCols: ComputedColumn[];
  orderedColumns: ComputedColumn[];
  leftCols: ComputedColumn[];
  centerCols: ComputedColumn[];
  rightCols: ComputedColumn[];

  /* ── Raw state (needed by imperative ref) ── */
  columnPinning: ColumnPinningState;
  columnVisibility: VisibilityState;

  /* ── Mutations ── */
  setColumnPinned(field: string, pinned: "left" | "right" | null): void;
  hideColumn(field: string): void;
  showColumn(field: string): void;
  getHiddenColumns(): string[];
  moveColumn(field: string, direction: -1 | 1): void;

  /* ── Column menu ── */
  menuState: GridColumnMenuState;
  openMenu(field: string, x: number, y: number): void;
  closeMenu(): void;
};

/* ═══════════════════════════════════════════════════════════════════════════
   Hook
   ═══════════════════════════════════════════════════════════════════════════ */

export function useGridColumnState({
  metaColumns,
  showCheckboxColumn,
}: UseGridColumnStateParams): UseGridColumnStateResult {
  /* ── State ──────────────────────────────────────────────────────────── */
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>(() => ({
    left: showCheckboxColumn ? [SELECTION_COLUMN_FIELD] : [],
    right: [],
  }));

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);
  const [menuState, setMenuState] = useState<GridColumnMenuState>(CLOSED_MENU);

  /* ── Column pipeline ────────────────────────────────────────────────── */

  // 1. Add checkbox column if needed
  const allMetaCols = useMemo<ComputedColumn[]>(() => {
    return showCheckboxColumn
      ? [SELECTION_COMPUTED_COL, ...metaColumns]
      : metaColumns;
  }, [metaColumns, showCheckboxColumn]);

  // 2. Apply runtime pinning state
  const columnsWithPinning = useMemo<ComputedColumn[]>(() => {
    return allMetaCols.map((col) => ({
      ...col,
      pinned: columnPinning.left?.includes(col.field)
        ? ("left" as const)
        : columnPinning.right?.includes(col.field)
          ? ("right" as const)
          : undefined,
    }));
  }, [allMetaCols, columnPinning]);

  // 3. Filter hidden columns
  const visibleColumns = useMemo<ComputedColumn[]>(() => {
    return columnsWithPinning.filter((col) => columnVisibility[col.field] !== false);
  }, [columnsWithPinning, columnVisibility]);

  // 4. Apply display order (from moveColumn operations)
  const orderedColumns = useMemo<ComputedColumn[]>(() => {
    if (columnOrder.length === 0) return visibleColumns;
    const map = new Map(visibleColumns.map((c) => [c.field, c]));
    const seen = new Set<string>();
    const ordered: ComputedColumn[] = [];
    columnOrder.forEach((id) => {
      const col = map.get(id);
      if (col) { ordered.push(col); seen.add(id); }
    });
    visibleColumns.forEach((col) => {
      if (!seen.has(col.field)) ordered.push(col);
    });
    return ordered;
  }, [visibleColumns, columnOrder]);

  // 5. Split into pinned sections
  const leftCols = useMemo(
    () => orderedColumns.filter((c) => c.pinned === "left"),
    [orderedColumns],
  );
  const centerCols = useMemo(
    () => orderedColumns.filter((c) => !c.pinned),
    [orderedColumns],
  );
  const rightCols = useMemo(
    () => orderedColumns.filter((c) => c.pinned === "right"),
    [orderedColumns],
  );

  /* ── Mutations ──────────────────────────────────────────────────────── */

  const setColumnPinned = useCallback(
    (field: string, pinned: "left" | "right" | null) => {
      setColumnPinning((prev) => {
        const left = (prev.left ?? []).filter((f) => f !== field);
        const right = (prev.right ?? []).filter((f) => f !== field);
        if (pinned === "left") left.push(field);
        if (pinned === "right") right.push(field);
        return { left, right };
      });
    },
    [],
  );

  const hideColumn = useCallback(
    (field: string) => setColumnVisibility((prev) => ({ ...prev, [field]: false })),
    [],
  );

  const showColumn = useCallback(
    (field: string) => setColumnVisibility((prev) => ({ ...prev, [field]: true })),
    [],
  );

  const getHiddenColumns = useCallback(
    () =>
      Object.entries(columnVisibility)
        .filter(([, v]) => v === false)
        .map(([k]) => k),
    [columnVisibility],
  );

  const moveColumn = useCallback(
    (field: string, direction: -1 | 1) => {
      const col = orderedColumns.find((c) => c.field === field);
      if (!col) return;
      const section =
        col.pinned === "left" ? leftCols : col.pinned === "right" ? rightCols : centerCols;
      const idx = section.findIndex((c) => c.field === field);
      const targetIdx = idx + direction;
      if (targetIdx < 0 || targetIdx >= section.length) return;

      const newOrder = orderedColumns.map((c) => c.field);
      const globalIdx = newOrder.indexOf(field);
      const swapGlobal = newOrder.indexOf(section[targetIdx].field);
      [newOrder[globalIdx], newOrder[swapGlobal]] = [newOrder[swapGlobal], newOrder[globalIdx]];
      setColumnOrder(newOrder);
    },
    [orderedColumns, leftCols, centerCols, rightCols],
  );

  /* ── Column menu ────────────────────────────────────────────────────── */

  const closeMenu = useCallback(() => setMenuState(CLOSED_MENU), []);

  const openMenu = useCallback(
    (field: string, x: number, y: number) => {
      const col = orderedColumns.find((c) => c.field === field);
      if (!col) return;
      const sectionCols =
        col.pinned === "left" ? leftCols : col.pinned === "right" ? rightCols : centerCols;
      const sectionIdx = sectionCols.findIndex((c) => c.field === field);
      setMenuState({
        visible: true,
        field,
        headerName: col.headerName,
        x,
        y,
        pinned: col.pinned,
        sortable: col.sortable,
        canMoveLeft: sectionIdx > 0,
        canMoveRight: sectionIdx < sectionCols.length - 1,
      });
    },
    [orderedColumns, leftCols, centerCols, rightCols],
  );

  return {
    allMetaCols,
    orderedColumns,
    leftCols,
    centerCols,
    rightCols,
    columnPinning,
    columnVisibility,
    setColumnPinned,
    hideColumn,
    showColumn,
    getHiddenColumns,
    moveColumn,
    menuState,
    openMenu,
    closeMenu,
  };
}

