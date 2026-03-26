/**
 * Grid utilities — mirrors ag-grid internal services.
 *
 * This file is self-contained (no deps on table/native layer).
 */

import type { ComputedColumn } from "./types";

/* ─────────────────────────────────────────────────────────────────────────
   Row key resolution — mirrors ag-grid RowNode.id logic
   ───────────────────────────────────────────────────────────────────────── */

export function getRowKey(row: Record<string, any>, fallback: number): string {
  const id = row.pk ?? row.id;
  return id != null ? String(id) : `__row_${fallback}`;
}

/* ─────────────────────────────────────────────────────────────────────────
   Flex width distribution — mirrors ag-grid ColumnFlexService
   ─────────────────────────────────────────────────────────────────────────

   Algorithm (matches ag-grid's multi-pass violation handling):
   1. Separate flex columns from fixed columns.
   2. Fixed total = sum of fixed column widths.
   3. Remaining = availableWidth − fixedTotal.
   4. Distribute remaining among flex columns proportionally.
   5. Clamp each to [minWidth, maxWidth].  Violations are "frozen" at their
      clamped size and the remaining space is redistributed among the rest
      (up to 3 redistribution passes — same as ag-grid).
   6. Rounding correction: add any leftover pixel(s) to the last active flex
      column so columns fill the container exactly.
   ───────────────────────────────────────────────────────────────────────── */

const DEFAULT_FLEX_MIN_WIDTH = 50;

type FlexItem = {
  col: ComputedColumn;
  targetWidth: number;
  /** Frozen = clamped to min/max; excluded from further redistribution */
  frozen: boolean;
};

/**
 * Returns a new column array with pixel widths computed for flex columns.
 * Fixed-width columns are returned unchanged.
 *
 * @param columns        Center columns (no pinned columns — they are always fixed).
 * @param availableWidth Pixel width available for the center section.
 */
export function applyFlexWidths(
  columns: ComputedColumn[],
  availableWidth: number,
): ComputedColumn[] {
  const flexCols = columns.filter((c) => (c.flex ?? 0) > 0);
  if (flexCols.length === 0 || availableWidth <= 0) return columns;

  const fixedWidth = columns
    .filter((c) => !c.flex)
    .reduce((sum, c) => sum + c.width, 0);

  const remaining = Math.max(0, availableWidth - fixedWidth);
  const totalFlex = flexCols.reduce((sum, c) => sum + c.flex!, 0);
  if (totalFlex === 0) return columns;

  // Initial distribution
  let items: FlexItem[] = flexCols.map((col) => ({
    col,
    targetWidth: Math.round((col.flex! / totalFlex) * remaining),
    frozen: false,
  }));

  // Up to 3 redistribution passes for min/max violations (mirrors ag-grid)
  for (let pass = 0; pass < 3; pass++) {
    let frozenWidth = 0;
    let activeFlex = 0;

    for (const item of items) {
      if (item.frozen) {
        frozenWidth += item.targetWidth;
      } else {
        activeFlex += item.col.flex!;
      }
    }

    const activeRemaining = remaining - frozenWidth;
    if (activeFlex === 0) break;

    let hasViolation = false;
    items = items.map((item) => {
      if (item.frozen) return item;
      const target = Math.round((item.col.flex! / activeFlex) * activeRemaining);
      const minW = item.col.minWidth ?? DEFAULT_FLEX_MIN_WIDTH;
      const maxW = item.col.maxWidth;

      if (target < minW) {
        hasViolation = true;
        return { ...item, targetWidth: minW, frozen: true };
      }
      if (maxW != null && target > maxW) {
        hasViolation = true;
        return { ...item, targetWidth: maxW, frozen: true };
      }
      return { ...item, targetWidth: target };
    });

    if (!hasViolation) break;
  }

  // Rounding correction — prevent sub-pixel gaps at the right edge
  const activeItems = items.filter((i) => !i.frozen);
  if (activeItems.length > 0) {
    const distributed = items.reduce((s, i) => s + i.targetWidth, 0);
    const diff = remaining - distributed;
    const last = activeItems[activeItems.length - 1];
    const corrected = last.targetWidth + diff;
    const minW = last.col.minWidth ?? DEFAULT_FLEX_MIN_WIDTH;
    last.targetWidth = Math.max(minW, corrected);
  }

  // Build result map for O(1) lookup
  const widthMap = new Map<string, number>(
    items.map((i) => [i.col.field, i.targetWidth]),
  );

  return columns.map((col) => {
    const newWidth = widthMap.get(col.field);
    return newWidth != null ? { ...col, width: newWidth } : col;
  });
}
