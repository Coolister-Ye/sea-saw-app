/**
 * useTable - 表格状态管理组合 hook
 *
 * 对外接口与重构前完全一致，现有调用方无需改动。
 *
 * 内部由 4 个子 hook 组合：
 * - tableReducer      : 类型、初始状态、reducer
 * - useEditableCell   : 行内编辑 + CRUD 操作
 * - useTableColumns   : 列配置处理、用户偏好排序
 * - useTableData      : 数据加载、防抖刷新、分页、下载
 */

import { useCallback, useEffect, useRef, useReducer, useMemo } from "react";
import { debounce } from "lodash";
import useDataService from "./useDataService";
import { useAuthStore } from "@/stores/authStore";
import { useLocaleStore } from "@/stores/localeStore";

import { tableReducer, initialTableState } from "./table/tableReducer";
import type { TableConfigType } from "./table/tableReducer";
import { useEditableCell } from "./table/useEditableCell";
import { useTableColumns } from "./table/useTableColumns";
import { useTableData } from "./table/useTableData";

export function useTable({
  table,
  tableRef,
  defaultColWidth = 120,
  fixedCols,
  colConfig = {},
  actionConfig,
  ordering,
}: TableConfigType) {
  const { getViewSet, request } = useDataService();
  const viewSet = useMemo(() => getViewSet(table), [getViewSet, table]);

  const [state, dispatch] = useReducer(tableReducer, initialTableState);
  const { paginationModel, columns, data, flatData, dataCount } = state;

  /* ── 共享 Refs（多个子 hook 共同读写） ── */
  const columnsRef = useRef<any>(null);
  const flatColumnsRef = useRef<any>(null);
  const columnsPref = useRef<any>(null);
  const dataRef = useRef<any>(data);
  const flatDataRef = useRef<any>(flatData);

  // 保持 dataRef / flatDataRef 同步
  dataRef.current = data;
  flatDataRef.current = flatData;

  /* ── 生命周期 Refs ── */
  const hasMounted = useRef(false);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const isLocaleLoading = useLocaleStore((s) => s.isLoading);
  const isAppReady = hasHydrated && !isLocaleLoading;
  const locale = useLocaleStore((s) => s.locale);
  const prevLocale = useRef(locale);

  /* ── handlersRef：用于打破 useEditableCell ↔ useTableData 的循环依赖 ── */
  const handlersRef = useRef<any>({});

  /* ── 子 hook：行内编辑 ── */
  const editableCell = useEditableCell({
    table,
    tableRef,
    viewSet,
    getViewSet,
    flatData,
    columnsRef,
    dataRef,
    flatDataRef,
    flatColumnsRef,
    dispatch,
    onRefresh: () => tableDataHook.refreshData(),
  });

  /* ── 子 hook：列处理 ── */
  const { processColumns, handleColsRerange } = useTableColumns({
    defaultColWidth,
    fixedCols,
    colConfig,
    actionConfig,
    columnsRef,
    flatColumnsRef,
    columnsPref,
    dataRef,
    flatDataRef,
    editingKeyRef: editableCell.editingKeyRef,
    dispatch,
  });

  /* ── 用户列偏好加载（传给 useTableData） ── */
  const loadUserPreference = useCallback(
    () =>
      request({
        uri: "getUserColPreference",
        method: "GET",
        suffix: `${table}/`,
      }),
    [request, table],
  );

  /* ── 子 hook：数据加载 ── */
  const tableDataHook = useTableData({
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
  });

  /* ── 注入 handlers（供 processColumns 运行时使用） ── */
  handlersRef.current = {
    handleSave: editableCell.handleSave,
    handleCancel: editableCell.handleCancel,
    handleEdit: editableCell.handleEdit,
    handleDelete: editableCell.handleDelete,
    splitRecord: editableCell.splitRecord,
  };

  /* ── 初始加载 & locale 变化处理 ── */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedLoadData = useCallback(
    debounce(tableDataHook.loadTableData, 300),
    [table],
  );

  useEffect(() => {
    if (!isAppReady) return;

    if (hasMounted.current) {
      if (prevLocale.current !== locale) {
        tableDataHook.handleLocaleChange(locale);
      }
    } else {
      debouncedLoadData();
      hasMounted.current = true;
    }

    prevLocale.current = locale;
  }, [locale, isAppReady]);

  /* ── 对外接口（与重构前完全一致） ── */
  return {
    flatData,
    data,
    columns,
    dataCount,
    paginationModel,
    loading: tableDataHook.loading,
    handleAdd: editableCell.handleAdd,
    loadTableData: tableDataHook.loadTableData,
    handleColsRerange,
    setColumns: (cols: any[]) => dispatch({ type: "SET_COLUMNS", payload: cols }),
    handleDownload: tableDataHook.handleDownload,
    handlePaginationChange: tableDataHook.handlePaginationChange,
    refreshData: tableDataHook.refreshData,
  };
}
