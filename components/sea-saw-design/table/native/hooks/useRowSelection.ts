import { useState, useCallback } from "react";
import type { RowSelectionConfig } from "../types";

export type UseRowSelectionResult = {
  selectedRowKey: string | null;
  isSelectable: boolean;
  /** Toggle selection for a row key (deselects if already selected) */
  toggleRow: (key: string) => void;
  clearSelection: () => void;
};

/**
 * Manages row selection state — mirrors ag-grid's SelectionService.
 *
 * Supports singleRow mode (only one row selected at a time).
 * Tap a selected row again to deselect it.
 */
export function useRowSelection(
  rowSelection?: RowSelectionConfig,
): UseRowSelectionResult {
  const [selectedRowKey, setSelectedRowKey] = useState<string | null>(null);
  const isSelectable = !!rowSelection;

  const toggleRow = useCallback((key: string) => {
    setSelectedRowKey((prev) => (prev === key ? null : key));
  }, []);

  const clearSelection = useCallback(() => setSelectedRowKey(null), []);

  return { selectedRowKey, isSelectable, toggleRow, clearSelection };
}
