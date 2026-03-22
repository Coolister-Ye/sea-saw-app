/**
 * useEntityPage - 实体页面通用逻辑的组合层
 *
 * 由 5 个原子 hook 组合而成：
 * - useEntityMeta   : OPTIONS 请求、headerMeta、formDefs
 * - useViewDrawer   : View 抽屉状态
 * - useTableHandlers: tableRef、gridApiRef、选择状态、表格事件
 * - useEditDrawer   : Edit 抽屉状态、copy 逻辑
 * - useEntityDelete : 删除确认弹窗
 *
 * 对外 API 与重构前完全一致，所有使用方无需改动。
 */

import { useCallback, useMemo } from "react";
import type { MessageInstance } from "antd/es/message/interface";

import { HeaderMetaProps } from "@/components/sea-saw-design/table/interface";
import { FormDef } from "@/hooks/useFormDefs";
import { useEntityMeta } from "@/hooks/useEntityMeta";
import { useViewDrawer } from "@/hooks/useViewDrawer";
import { useTableHandlers } from "@/hooks/useTableHandlers";
import { useEditDrawer } from "@/hooks/useEditDrawer";
import { useEntityDelete } from "@/hooks/useEntityDelete";

/* ========================
 * Types (保持与原接口完全一致)
 * ======================== */

export interface EntityPageConfig {
  entity: string;
  nameField?: string;
  excludeFromCopy?: string[];
  filterMetaFields?: string[];
  enableDelete?: boolean;
  buildCopyData?: (data: any) => any;
}

export interface UseEntityPageReturn {
  loadingMeta: boolean;
  metaError: string | null;
  headerMeta: Record<string, HeaderMetaProps>;
  formDefs: FormDef[];
  isEditOpen: boolean;
  isViewOpen: boolean;
  viewRow: any;
  editData: any;
  copyDisabled: boolean;
  deleteDisabled: boolean;
  openCreate: () => void;
  openView: (row: any) => void;
  openCopy: () => void;
  openDelete: () => void;
  closeView: () => void;
  closeEdit: (res?: any) => void;
  handleCreateSuccess: (res?: any) => void;
  handleUpdateSuccess: (res?: any) => void;
  refreshTable: () => void;
  tableRef: React.RefObject<any>;
  gridApiRef: React.RefObject<any>;
  tableProps: {
    onRowClicked: (e: any) => void;
    onGridReady: (params: any) => void;
    onSelectionChanged: (e: any) => void;
  };
  messageApi: MessageInstance;
  contextHolder: React.ReactElement;
}

/* ========================
 * Hook
 * ======================== */

export function useEntityPage(config: EntityPageConfig): UseEntityPageReturn {
  const {
    entity,
    nameField = "name",
    enableDelete = false,
    buildCopyData,
    excludeFromCopy,
    filterMetaFields,
  } = config;

  /* ── 原子 hooks ── */
  const meta = useEntityMeta(entity, { filterMetaFields });

  const viewDrawer = useViewDrawer();

  const tableHandlers = useTableHandlers();

  const editDrawer = useEditDrawer(tableHandlers.gridApiRef, {
    buildCopyData,
    excludeFromCopy,
  });

  const deleteHook = useEntityDelete(
    meta.viewSet,
    tableHandlers.tableRef,
    tableHandlers.gridApiRef,
    {
      enabled: enableDelete,
      nameField,
      viewRow: viewDrawer.viewRow,
      onDeleteSuccess: (id) => {
        if (viewDrawer.viewRow?.id === id) viewDrawer.closeView();
      },
    },
  );

  /* ── closeEdit：关闭 drawer 并同步 viewRow ── */
  const closeEdit = useCallback(
    (res?: any) => {
      editDrawer.closeEditDrawer();
      if (res?.data) viewDrawer.setViewRow(res.data);
    },
    [editDrawer.closeEditDrawer, viewDrawer.setViewRow],
  );

  /* ── 成功回调：需要 tableRef + setViewRow ── */
  const handleCreateSuccess = useCallback(
    (res?: any) => {
      if (!res) return;
      tableHandlers.tableRef.current?.api?.refreshServerSide();
      const data = res.data ?? res;
      if (data?.id) viewDrawer.setViewRow(data);
    },
    [tableHandlers.tableRef, viewDrawer.setViewRow],
  );

  const handleUpdateSuccess = useCallback(
    (res?: any) => {
      const updated = res?.data ?? res;
      if (!updated) return;

      viewDrawer.setViewRow(updated);

      const api = tableHandlers.tableRef.current?.api;
      if (!api) return;

      const node = api.getRowNode(String(updated.id));
      if (node) {
        node.updateData(updated);
        api.ensureNodeVisible(node, "middle");
      } else {
        api.refreshServerSide({ route: [], purge: false });
      }
    },
    [tableHandlers.tableRef, viewDrawer.setViewRow],
  );

  /* ── tableProps 组合 ── */
  const tableProps = useMemo(
    () => ({
      onRowClicked: (e: any) => viewDrawer.openView(e.data),
      onGridReady: tableHandlers.onGridReady,
      onSelectionChanged: tableHandlers.onSelectionChanged,
    }),
    [viewDrawer.openView, tableHandlers.onGridReady, tableHandlers.onSelectionChanged],
  );

  /* ── Return（与原接口完全一致） ── */
  return {
    // meta
    loadingMeta: meta.loadingMeta,
    metaError: meta.metaError,
    headerMeta: meta.headerMeta,
    formDefs: meta.formDefs,
    // view drawer
    isViewOpen: viewDrawer.isViewOpen,
    viewRow: viewDrawer.viewRow,
    openView: viewDrawer.openView,
    closeView: viewDrawer.closeView,
    // edit drawer
    isEditOpen: editDrawer.isEditOpen,
    editData: editDrawer.editData,
    openCreate: editDrawer.openCreate,
    openCopy: editDrawer.openCopy,
    closeEdit,
    // table
    tableRef: tableHandlers.tableRef,
    gridApiRef: tableHandlers.gridApiRef,
    copyDisabled: tableHandlers.copyDisabled,
    deleteDisabled: tableHandlers.deleteDisabled,
    refreshTable: tableHandlers.refreshTable,
    tableProps,
    // delete
    openDelete: deleteHook.openDelete,
    messageApi: deleteHook.messageApi,
    contextHolder: deleteHook.contextHolder,
    // success handlers
    handleCreateSuccess,
    handleUpdateSuccess,
  };
}

export default useEntityPage;
