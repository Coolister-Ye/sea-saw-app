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
  /**
   * When true, a quick-filter text input is managed internally.
   * Mirrors ag-grid FilterManager.
   */
  enableQuickFilter?: boolean;
  /**
   * Query-param key used for the quick filter value (default: "search").
   * Merged into queryParams as `{ [quickFilterParam]: debouncedValue }`.
   */
  quickFilterParam?: string;
};

type UseTableDataResult = {
  rows: Record<string, any>[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  /** Ordered multi-sort array — index 0 = primary sort */
  sortState: SortState;
  isLoading: boolean;
  /**
   * Toggle sort for a column (always-multi-sort, matching AgGrid alwaysMultiSort).
   * Cycles: unsorted → asc → desc → unsorted.
   */
  handleSort: (field: string) => void;
  /** Pagination handlers — mirrors ag-grid PaginationService API */
  handleFirst: () => void;
  handlePrev: () => void;
  handleNext: () => void;
  handleLast: () => void;
  handleGoToPage: (p: number) => void;
  handlePageSizeChange: (size: number) => void;
  /** Optimistic row removal after delete */
  removeRow: (rowId: number | string) => void;
  /** Force a re-fetch without resetting page or sort */
  refresh: () => void;
  // NOTE: setPage / setPageSize are intentionally not exposed.
  // Use the pagination handlers above instead.
  /** Raw (unDebounced) quick filter text — bind to QuickFilterBar value */
  quickFilterInput: string;
  /** Handler for QuickFilterBar onChangeText */
  onQuickFilterChange: (text: string) => void;
};

const QUICK_FILTER_DEBOUNCE_MS = 400;

export function useTableData({
  viewSet,
  queryParams,
  isMetaLoading,
  metaError,
  enableQuickFilter = false,
  quickFilterParam = "search",
}: UseTableDataParams): UseTableDataResult {
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  /** Multi-sort: ordered array of SortItems. Empty = no sort. */
  const [sortState, setSortState] = useState<SortState>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);

  /* ── Quick filter (mirrors ag-grid FilterManager) ── */
  const [quickFilterInput, setQuickFilterInput] = useState("");
  const [debouncedFilter, setDebouncedFilter] = useState("");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const onQuickFilterChange = useCallback((text: string) => {
    setQuickFilterInput(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedFilter(text.trim());
      setPage(1);
    }, QUICK_FILTER_DEBOUNCE_MS);
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
  }, []);

  // Merge quick filter into queryParams when active
  const effectiveQueryParams = useMemo(() => {
    if (!enableQuickFilter || !debouncedFilter) return queryParams;
    return { ...queryParams, [quickFilterParam]: debouncedFilter };
  }, [queryParams, enableQuickFilter, debouncedFilter, quickFilterParam]);

  // Stable string for queryParams — prevents infinite loops when caller
  // creates a new object literal with the same content on every render.
  const queryParamsStr = useMemo(
    () => JSON.stringify(effectiveQueryParams ?? {}),
    [effectiveQueryParams],
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
            ...effectiveQueryParams,
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

  /* ── Pagination handlers (mirrors ag-grid PaginationService) ── */
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleFirst = useCallback(() => setPage(1), []);
  const handlePrev = useCallback(
    () => setPage((p) => Math.max(1, p - 1)),
    [],
  );
  const handleNext = useCallback(
    () => setPage((p) => Math.min(p + 1, totalPages)),
    [totalPages],
  );
  const handleLast = useCallback(
    () => setPage(totalPages),
    [totalPages],
  );
  const handleGoToPage = useCallback(
    (p: number) => setPage(Math.min(Math.max(1, p), totalPages)),
    [totalPages],
  );
  const handlePageSizeChange = useCallback(
    (size: number) => {
      setPageSize(size);
      setPage(1);
    },
    [],
  );

  return {
    rows,
    total,
    page,
    pageSize,
    totalPages,
    sortState,
    isLoading,
    handleSort,
    handleFirst,
    handlePrev,
    handleNext,
    handleLast,
    handleGoToPage,
    handlePageSizeChange,
    removeRow,
    refresh,
    quickFilterInput,
    onQuickFilterChange,
  };
}
