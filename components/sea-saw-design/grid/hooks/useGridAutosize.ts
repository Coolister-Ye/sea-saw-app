/**
 * useGridAutosize — estimates best-fit column widths from rendered data.
 *
 * Mirrors AG Grid's AutoSizeColumnsFeature:
 *   width = max(headerWidth, maxContentWidth) + padding, clamped to [min, max]
 *
 * Since React Native cannot measure real rendered text in the DOM, we estimate
 * using: charCount × CHAR_WIDTH + horizontal padding.
 * Accuracy is ~90% for Latin text at 13px font size.
 *
 * Columns are skipped when:
 *   • col.suppressAutoSize === true  (explicit opt-out, mirrors ag-grid)
 *   • col has cellRenderer/renderCell but no valueFormatter  (custom renderers
 *     display content unrelated to the raw field value, so raw-value estimation
 *     would be wrong; only the header width is used in this case)
 */
import { useCallback } from "react";
import type { ComputedColumn } from "../types";
import { resolveValue, formatCellValue } from "../components/GridCell/utils";

const CHAR_WIDTH = 7.5;   // px per character at 13px font
const CELL_PADDING = 24;  // 2 × 12px horizontal cell padding
const HEADER_EXTRA = 36;  // sort icon + menu button space
const MIN_WIDTH = 60;
const MAX_AUTO_WIDTH = 500;

function estimateWidth(str: string): number {
  return str.length * CHAR_WIDTH + CELL_PADDING;
}

/** Returns true when the column renders custom UI and raw-value estimation is unreliable. */
function hasCustomRendererOnly(col: ComputedColumn): boolean {
  return (col.cellRenderer != null || col.renderCell != null) && col.valueFormatter == null;
}

export function useGridAutosize({
  columns,
  rows,
  setWidth,
}: {
  columns: ComputedColumn[];
  rows: Record<string, any>[];
  setWidth(field: string, width: number): void;
}) {
  const autosizeColumn = useCallback(
    (field: string) => {
      const col = columns.find((c) => c.field === field);
      if (!col || col.suppressAutoSize) return;

      const headerWidth = (col.headerName ?? field).length * CHAR_WIDTH + HEADER_EXTRA;

      let contentWidth: number;
      if (hasCustomRendererOnly(col)) {
        // Custom renderer — raw value doesn't represent display width.
        // Size to header only; let the caller set an explicit width if needed.
        contentWidth = MIN_WIDTH;
      } else {
        contentWidth = rows.reduce((max, row) => {
          const value = resolveValue(col, row);
          const str = formatCellValue(col, value, row);
          return Math.max(max, estimateWidth(str));
        }, MIN_WIDTH);
      }

      const newWidth = Math.min(
        MAX_AUTO_WIDTH,
        Math.max(col.minWidth ?? MIN_WIDTH, headerWidth, contentWidth),
      );
      setWidth(field, newWidth);
    },
    [columns, rows, setWidth],
  );

  const autosizeAllColumns = useCallback(() => {
    columns
      .filter((col) => !col.suppressAutoSize)
      .forEach((col) => autosizeColumn(col.field));
  }, [columns, autosizeColumn]);

  return { autosizeColumn, autosizeAllColumns };
}
