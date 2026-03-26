/**
 * useGridData — generic server-side data hook for Grid.
 *
 * Calls datasource.getRows() whenever pagination, sorting, or filterModel
 * changes. Mirrors AG Grid IServerSideDatasource protocol exactly.
 *
 * filterModel is opaque to Grid — it is built by Grid from the quick-filter
 * input (key "_quickFilter") and passed through to the datasource unchanged.
 * The datasource (e.g. NativeTable's ViewSet wrapper) is responsible for
 * mapping filterModel keys to actual API params.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import { devError } from "@/utils/logger";
import type { IGridDatasource } from "../types";

type UseGridDataParams = {
  datasource?: IGridDatasource;
  pagination: PaginationState;
  sorting: SortingState;
  filterModel?: Record<string, any>;
  /** Block fetching (e.g. while column metadata is loading externally) */
  loading?: boolean;
};

type UseGridDataResult = {
  rows: Record<string, any>[];
  total: number;
  isLoading: boolean;
  error: string | null;
  refresh(): void;
};

export function useGridData({
  datasource,
  pagination,
  sorting,
  filterModel,
  loading = false,
}: UseGridDataParams): UseGridDataResult {
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(() => setRefreshTick((n) => n + 1), []);

  useEffect(() => {
    if (loading || !datasource) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    const { pageIndex, pageSize } = pagination;
    const startRow = pageIndex * pageSize;
    const endRow = startRow + pageSize;

    const sortModel = sorting.map((s) => ({
      colId: s.id,
      sort: s.desc ? ("desc" as const) : ("asc" as const),
    }));

    datasource.getRows({
      startRow,
      endRow,
      sortModel,
      filterModel,
      success({ rowData, rowCount }) {
        if (cancelled || !mountedRef.current) return;
        setRows(rowData);
        setTotal(rowCount);
        setIsLoading(false);
      },
      fail() {
        if (cancelled || !mountedRef.current) return;
        devError("Grid useGridData: datasource.getRows failed");
        setError("Failed to load data");
        setIsLoading(false);
      },
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    datasource,
    loading,
    pagination.pageIndex,
    pagination.pageSize,
    JSON.stringify(sorting),
    JSON.stringify(filterModel),
    refreshTick,
  ]);

  return { rows, total, isLoading, error, refresh };
}
