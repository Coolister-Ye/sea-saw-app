/**
 * useGridSorting — sort state and helpers for Grid.
 *
 * Manages TanStack SortingState with AG Grid-compatible behaviour:
 *   • Always-multi-sort: tap once → asc, again → desc, third time → removed
 *   • setColumnSort: direct set/clear (used by column menu)
 *   • Resets page to 0 on any sort change
 *
 * Mirrors AG Grid's SortController + alwaysMultiSort pattern.
 */

import { useState, useCallback } from "react";
import type { SortingState } from "@tanstack/react-table";
import type { PaginationState } from "@tanstack/react-table";

type UseGridSortingParams = {
  /** Called on sort change to reset to first page */
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
};

export type UseGridSortingResult = {
  sorting: SortingState;
  /** Toggle a column's sort: unsorted → asc → desc → unsorted */
  handleSort(field: string): void;
  /** Directly set or clear a column's sort direction */
  setColumnSort(field: string, dir: "asc" | "desc" | null): void;
};

export function useGridSorting({
  setPagination,
}: UseGridSortingParams): UseGridSortingResult {
  const [sorting, setSorting] = useState<SortingState>([]);

  const resetPage = useCallback(
    () => setPagination((p) => ({ ...p, pageIndex: 0 })),
    [setPagination],
  );

  const handleSort = useCallback(
    (field: string) => {
      setSorting((prev) => {
        const idx = prev.findIndex((s) => s.id === field);
        // Not sorted → asc
        if (idx === -1) return [...prev, { id: field, desc: false }];
        // Asc → desc
        if (!prev[idx].desc) {
          const next = [...prev];
          next[idx] = { id: field, desc: true };
          return next;
        }
        // Desc → remove
        return prev.filter((s) => s.id !== field);
      });
      resetPage();
    },
    [resetPage],
  );

  const setColumnSort = useCallback(
    (field: string, dir: "asc" | "desc" | null) => {
      setSorting((prev) => {
        if (dir === null) return prev.filter((s) => s.id !== field);
        const idx = prev.findIndex((s) => s.id === field);
        if (idx === -1) return [...prev, { id: field, desc: dir === "desc" }];
        const next = [...prev];
        next[idx] = { id: field, desc: dir === "desc" };
        return next;
      });
      resetPage();
    },
    [resetPage],
  );

  return { sorting, handleSort, setColumnSort };
}
