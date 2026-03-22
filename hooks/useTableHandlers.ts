import { useState, useCallback, useRef } from "react";

export interface UseTableHandlersReturn {
  tableRef: React.RefObject<any>;
  gridApiRef: React.RefObject<any>;
  copyDisabled: boolean;
  deleteDisabled: boolean;
  onGridReady: (params: any) => void;
  onSelectionChanged: (e: any) => void;
  refreshTable: () => void;
}

/**
 * 管理 AG Grid 的 ref、选择状态和表格事件处理。
 *
 * @param onRowClick - 行点击回调（可选）。传入后 onRowClicked 会调用它；
 *   不传则不处理行点击（页面自行传 onRowClicked 给 Table）。
 */
export function useTableHandlers(
  onRowClick?: (row: any) => void,
): UseTableHandlersReturn {
  const tableRef = useRef<any>(null);
  const gridApiRef = useRef<any>(null);

  const [copyDisabled, setCopyDisabled] = useState(true);
  const [deleteDisabled, setDeleteDisabled] = useState(true);

  const onGridReady = useCallback((params: any) => {
    gridApiRef.current = params.api;
  }, []);

  const onSelectionChanged = useCallback((e: any) => {
    const selected = e.api.getSelectedNodes();
    const hasSelection = selected.length > 0;
    setCopyDisabled(!hasSelection);
    setDeleteDisabled(!hasSelection);
  }, []);

  const refreshTable = useCallback(() => {
    tableRef.current?.api?.refreshServerSide();
  }, []);

  return {
    tableRef,
    gridApiRef,
    copyDisabled,
    deleteDisabled,
    onGridReady,
    onSelectionChanged,
    refreshTable,
  };
}
