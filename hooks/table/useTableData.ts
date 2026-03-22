import { useState, useCallback, useRef } from "react";
import { debounce } from "lodash";
import { flattenData } from "@/utils";
import { changeToPlural } from "@/utils";
import { useToast } from "@/context/Toast";
import { assignKey } from "./useEditableCell";
import type { PaginationProps, TableAction } from "./tableReducer";

interface UseTableDataOptions {
  table: string;
  viewSet: any;
  request: any;
  ordering?: string;
  columnsRef: React.MutableRefObject<any>;
  flatColumnsRef: React.MutableRefObject<any>;
  columnsPref: React.MutableRefObject<any>;
  dataRef: React.MutableRefObject<any>;
  flatDataRef: React.MutableRefObject<any>;
  dispatch: React.Dispatch<TableAction>;
  processColumns: (
    meta: any,
    pref: any[],
    handlers: any,
  ) => any[];
  loadUserPreference: () => Promise<any>;
  /** 当前 editing handlers（在父层初始化后注入） */
  handlersRef: React.MutableRefObject<any>;
}

export function useTableData({
  table,
  viewSet,
  request,
  ordering,
  columnsRef,
  flatColumnsRef,
  columnsPref,
  dataRef,
  flatDataRef,
  dispatch,
  processColumns,
  loadUserPreference,
  handlersRef,
}: UseTableDataOptions) {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const orderingRef = useRef<any>(ordering);
  const filtersRef = useRef<any>(null);
  const paginationModelRef = useRef<PaginationProps>({ page: 1, page_size: 50 });

  const loadTableData = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: columnsMeta }, { data: rows }, { data: userPref }] =
        await Promise.all([
          viewSet.options(),
          viewSet.list({ params: { ordering, ...paginationModelRef.current } }),
          loadUserPreference(),
        ]);

      const { column_pref: columnPref } = userPref;
      const processedColumns = processColumns(
        columnsMeta.actions.POST || columnsMeta.actions.OPTIONS,
        columnPref || [],
        handlersRef.current,
      );
      const processedData = assignKey(
        flattenData(
          rows.results,
          processedColumns.map((col: any) => col.dataIndex),
          [],
        ),
      );

      columnsRef.current = columnsMeta.actions.POST;
      dataRef.current = rows.results;
      flatDataRef.current = processedData;
      flatColumnsRef.current = processedColumns;
      columnsPref.current = columnPref;

      dispatch({ type: "SET_COLUMNS", payload: processedColumns });
      dispatch({ type: "SET_FLAT_DATA", payload: processedData });
      dispatch({ type: "SET_DATA", payload: rows.results });
      dispatch({ type: "SET_DATA_COUNT", payload: rows.count });
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, [viewSet, ordering, processColumns, columnsRef, dataRef, flatDataRef, flatColumnsRef, columnsPref, dispatch, loadUserPreference, handlersRef]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const refreshData = useCallback(
    debounce(
      async ({
        ordering: ord = orderingRef.current,
        filters = filtersRef.current,
        pagination = paginationModelRef.current,
      }: { ordering?: string; filters?: any; pagination?: PaginationProps } = {}) => {
        setLoading(true);
        try {
          const { data: rows } = await viewSet.list({
            params: { ordering: ord, ...pagination, ...filters },
          });
          const processedData = assignKey(
            flattenData(
              rows.results,
              flatColumnsRef.current.map((col: { dataIndex: any }) => col.dataIndex),
              [],
            ),
          );

          dataRef.current = rows.results;
          flatDataRef.current = processedData;
          orderingRef.current = ord;
          filtersRef.current = filters;
          paginationModelRef.current = pagination ?? paginationModelRef.current;

          dispatch({ type: "SET_PAGINATION_MODEL", payload: pagination ?? paginationModelRef.current });
          dispatch({ type: "SET_FLAT_DATA", payload: processedData });
          dispatch({ type: "SET_DATA", payload: rows.results });
          dispatch({ type: "SET_DATA_COUNT", payload: rows.count });
        } catch (error) {
          console.error("Error loading list data:", error);
        } finally {
          setLoading(false);
        }
      },
      300,
    ),
    [],
  );

  const handlePaginationChange = useCallback(
    async (pagination: PaginationProps) => {
      if (
        JSON.stringify(pagination) ===
        JSON.stringify(paginationModelRef.current)
      )
        return;
      await refreshData({ pagination });
    },
    [refreshData],
  );

  const handleLocaleChange = useCallback(
    async (locale: string) => {
      setLoading(true);
      try {
        const { data: columnsMeta } = await viewSet.options();
        const processedColumns = processColumns(
          columnsMeta.actions.POST || columnsMeta.actions.OPTIONS,
          columnsPref.current || [],
          handlersRef.current,
        );
        columnsRef.current = columnsMeta.actions.POST;
        flatColumnsRef.current = processedColumns;
        dispatch({ type: "SET_COLUMNS", payload: processedColumns });
      } catch (error) {
        console.error("Error loading list data:", error);
      } finally {
        setLoading(false);
      }
    },
    [viewSet, processColumns, columnsRef, flatColumnsRef, columnsPref, dispatch, handlersRef],
  );

  const handleDownload = useCallback(async () => {
    const body = {
      model: changeToPlural(table),
      filters: filtersRef.current,
    };
    const downloadTask = await request({ uri: "crmDownload", method: "POST", body });
    showToast({ message: downloadTask.data.message, variant: "success" });
  }, [table, request, showToast]);

  return {
    loading,
    orderingRef,
    filtersRef,
    paginationModelRef,
    loadTableData,
    refreshData,
    handlePaginationChange,
    handleLocaleChange,
    handleDownload,
  };
}
