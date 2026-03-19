import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { devError } from "@/utils/logger";
import type { SortItem, SortState } from "../types";

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 50;

type UseTableDataParams = {
  viewSet: any;
  queryParams?: Record<string, any>;
  /** Block fetching until metadata is ready */
  isMetaLoading: boolean;
  metaError: string | null;
};

type UseTableDataResult = {
  rows: Record<string, any>[];
  total: number;
  page: number;
  pageSize: number;
  /** Ordered multi-sort array — index 0 = primary sort */
  sortState: SortState;
  isLoading: boolean;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  /**
   * Toggle sort for a column (always-multi-sort, matching AgGrid alwaysMultiSort).
   * Cycles: unsorted → asc → desc → unsorted.
   * Other already-sorted columns are unaffected.
   */
  handleSort: (field: string) => void;
  /** Optimistic row removal after delete */
  removeRow: (rowId: number | string) => void;
  /** Force a re-fetch without resetting page or sort */
  refresh: () => void;
};

export function useTableData({
  viewSet,
  queryParams,
  isMetaLoading,
  metaError,
}: UseTableDataParams): UseTableDataResult {
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  /** Multi-sort: ordered array of SortItems. Empty = no sort. */
  const [sortState, setSortState] = useState<SortState>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Stable string for queryParams — prevents infinite loops when caller
  // creates a new object literal with the same content on every render.
  const queryParamsStr = useMemo(
    () => JSON.stringify(queryParams ?? {}),
    [queryParams],
  );

  // Reset to page 1 whenever the external filter params change
  const prevQueryParamsStr = useRef(queryParamsStr);
  useEffect(() => {
    if (prevQueryParamsStr.current !== queryParamsStr) {
      prevQueryParamsStr.current = queryParamsStr;
      setPage(1);
    }
  }, [queryParamsStr]);

  useEffect(() => {
    if (isMetaLoading || metaError) return;

    let mounted = true;
    setIsLoading(true);

    (async () => {
      try {
        const offset = (page - 1) * pageSize;

        // Build Django ordering: "field1,-field2,field3" (minus = desc)
        const ordering =
          sortState.length > 0
            ? sortState
                .map((s) => (s.direction === "asc" ? s.field : `-${s.field}`))
                .join(",")
            : undefined;

        const res = await viewSet.list({
          params: {
            limit: pageSize,
            offset,
            pager: "limit_offset",
            ...(ordering ? { ordering } : {}),
            ...queryParams,
          },
        });

        if (mounted) {
          setRows(res.results ?? []);
          setTotal(res.count ?? 0);
        }
      } catch (err) {
        devError("NativeTable useTableData: fetch failed", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, sortState, queryParamsStr, viewSet, isMetaLoading, metaError, refreshCounter]);

  /**
   * Toggle sort for one column.
   *
   * Matches AgGrid alwaysMultiSort behaviour:
   *   tap 1 → added as asc (lowest priority in sort list)
   *   tap 2 → changed to desc
   *   tap 3 → removed from sort list
   *
   * Sort order of other columns is preserved.
   */
  const handleSort = useCallback((field: string) => {
    setSortState((prev) => {
      const idx = prev.findIndex((s) => s.field === field);
      if (idx === -1) {
        return [...prev, { field, direction: "asc" }];
      }
      if (prev[idx].direction === "asc") {
        return prev.map((s, i) =>
          i === idx ? { ...s, direction: "desc" } : s,
        ) as SortItem[];
      }
      return prev.filter((_, i) => i !== idx);
    });
    setPage(1);
  }, []);

  const refresh = useCallback(() => setRefreshCounter((c) => c + 1), []);

  const removeRow = useCallback((rowId: number | string) => {
    setRows((prev) => prev.filter((r) => (r.pk ?? r.id) !== rowId));
    setTotal((t) => Math.max(0, t - 1));
  }, []);

  return {
    rows,
    total,
    page,
    pageSize,
    sortState,
    isLoading,
    setPage,
    setPageSize,
    handleSort,
    removeRow,
    refresh,
  };
}
