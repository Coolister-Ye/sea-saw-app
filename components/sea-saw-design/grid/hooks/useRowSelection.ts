import { useState, useCallback } from "react";
import type { RowSelectionConfig } from "../types";

export type UseRowSelectionResult = {
  /**
   * Returns true if the given row key is currently selected.
   * Works for both singleRow and multiRow modes.
   */
  isRowSelected: (key: string) => boolean;
  /** All currently selected row keys */
  selectedKeys: Set<string>;
  /** Number of selected rows */
  selectedCount: number;
  /** True when rowSelection config is provided */
  isSelectable: boolean;
  /** True when mode is 'multiRow' */
  isMultiRow: boolean;
  /**
   * Toggle selection for a single row key.
   * Single-row mode: deselects current row if it equals key, otherwise selects key.
   * Multi-row mode: adds key if absent, removes if present.
   */
  toggleRow: (key: string) => void;
  /**
   * Toggle selection for all provided keys (select-all / deselect-all).
   * Multi-row mode only. If all keys are already selected, deselects all.
   * Otherwise selects all.
   * Mirrors ag-grid's "header checkbox" select-all behaviour.
   */
  toggleAll: (keys: string[]) => void;
  /** Clear all selected rows */
  clearSelection: () => void;
};

/**
 * Manages row selection state — mirrors ag-grid's SelectionService.
 *
 * Supports both singleRow and multiRow modes.
 * In singleRow mode only one key is ever in the set.
 * In multiRow mode any number of keys can be selected.
 */
export function useRowSelection(
  rowSelection?: RowSelectionConfig,
): UseRowSelectionResult {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  const isSelectable = !!rowSelection;
  const isMultiRow = rowSelection?.mode === "multiRow";

  const toggleRow = useCallback(
    (key: string) => {
      setSelectedKeys((prev) => {
        if (!isMultiRow) {
          const next = new Set<string>();
          if (!prev.has(key)) next.add(key);
          return next;
        }
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
    },
    [isMultiRow],
  );

  const toggleAll = useCallback((keys: string[]) => {
    setSelectedKeys((prev) => {
      const allSelected = keys.length > 0 && keys.every((k) => prev.has(k));
      if (allSelected) return new Set<string>();
      return new Set(keys);
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedKeys(new Set()), []);

  const isRowSelected = useCallback(
    (key: string) => selectedKeys.has(key),
    [selectedKeys],
  );

  return {
    isRowSelected,
    selectedKeys,
    selectedCount: selectedKeys.size,
    isSelectable,
    isMultiRow,
    toggleRow,
    toggleAll,
    clearSelection,
  };
}
