/**
 * useCRMPage - 统一管理 CRM 页面的通用逻辑
 *
 * 抽取所有 CRM 页面共有的：
 * - Meta 数据获取
 * - 表单定义转换
 * - 抽屉状态管理 (View / Edit)
 * - 表格选择状态
 * - CRUD 操作处理
 * - 删除确认弹窗
 */

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import i18n from '@/locale/i18n';
import { Modal, message } from "antd";
import type { MessageInstance } from "antd/es/message/interface";

import { HeaderMetaProps } from "@/components/sea-saw-design/table/interface";
import { FormDef } from "@/hooks/useFormDefs";
import useDataService from "@/hooks/useDataService";
import { normalizeBoolean, stripIdsDeep } from "@/utils";

/* ========================
 * Types
 * ======================== */

export interface CRMPageConfig {
  /** 实体名称，对应 Constants.ts 中的 key */
  entity: string;

  /** 用于删除确认框显示的名称字段 */
  nameField?: string;

  /** 需要从 copy 操作中排除的字段 */
  excludeFromCopy?: string[];

  /** 需要从 headerMeta 中过滤的字段 */
  filterMetaFields?: string[];

  /** 是否启用删除功能 */
  enableDelete?: boolean;

  /** 自定义 copy 数据构建函数 */
  buildCopyData?: (data: any) => any;
}

export interface UseCRMPageReturn {
  /* ================= State ================= */
  /** 是否正在加载 meta */
  loadingMeta: boolean;
  /** Meta 加载错误信息 */
  metaError: string | null;
  /** 原始 header meta */
  headerMeta: Record<string, HeaderMetaProps>;
  /** 转换后的 form definitions */
  formDefs: FormDef[];
  /** 编辑抽屉是否打开 */
  isEditOpen: boolean;
  /** 查看抽屉是否打开 */
  isViewOpen: boolean;
  /** 当前查看的行数据 */
  viewRow: any;
  /** 当前编辑的数据 (null 表示新建) */
  editData: any;
  /** 复制按钮是否禁用 */
  copyDisabled: boolean;
  /** 删除按钮是否禁用 */
  deleteDisabled: boolean;

  /* ================= Actions ================= */
  /** 打开新建抽屉 */
  openCreate: () => void;
  /** 打开查看抽屉 */
  openView: (row: any) => void;
  /** 打开复制抽屉 (基于当前选中行) */
  openCopy: () => void;
  /** 打开删除确认框 (基于当前选中行) */
  openDelete: () => void;
  /** 关闭查看抽屉 */
  closeView: () => void;
  /** 关闭编辑抽屉 */
  closeEdit: (res?: any) => void;
  /** 创建成功回调 */
  handleCreateSuccess: (res?: any) => void;
  /** 更新成功回调 */
  handleUpdateSuccess: (res?: any) => void;
  /** 刷新表格数据 */
  refreshTable: () => void;

  /* ================= Refs ================= */
  /** 表格组件 ref */
  tableRef: React.RefObject<any>;
  /** AG Grid API ref */
  gridApiRef: React.RefObject<any>;

  /* ================= Table Props ================= */
  /** 表格事件处理 (onRowClicked, onGridReady, onSelectionChanged) */
  tableProps: {
    onRowClicked: (e: any) => void;
    onGridReady: (params: any) => void;
    onSelectionChanged: (e: any) => void;
  };

  /* ================= Message ================= */
  messageApi: MessageInstance;
  contextHolder: React.ReactElement;
}

/* ========================
 * Default Copy Builder
 * ======================== */

function defaultBuildCopyData(
  data: any,
  excludeFields: string[] = []
): any {
  if (!data) return null;

  const { id, pk, created_at, updated_at, ...rest } = data;

  // 过滤掉需要排除的字段
  const filtered = { ...rest };
  excludeFields.forEach((field) => {
    delete filtered[field];
  });

  return stripIdsDeep(filtered);
}

/* ========================
 * Constants
 * ======================== */

const EMPTY_ARRAY: string[] = [];

/* ========================
 * Hook
 * ======================== */

export function useCRMPage(config: CRMPageConfig): UseCRMPageReturn {
  const {
    entity,
    nameField = "name",
    enableDelete = false,
    buildCopyData,
  } = config;

  // 使用 useRef 稳定化数组引用，避免无限循环
  const excludeFromCopyRef = useRef(config.excludeFromCopy ?? EMPTY_ARRAY);
  const filterMetaFieldsRef = useRef(config.filterMetaFields ?? EMPTY_ARRAY);

  const { getViewSet } = useDataService();
  const viewSet = useMemo(() => getViewSet(entity), [getViewSet, entity]);

  /* ================= Refs ================= */
  const tableRef = useRef<any>(null);
  const gridApiRef = useRef<any>(null);

  /* ================= Message ================= */
  const [messageApi, contextHolder] = message.useMessage();

  /* ================= UI State ================= */
  const [isEditOpen, setEditOpen] = useState(false);
  const [isViewOpen, setViewOpen] = useState(false);
  const [viewRow, setViewRow] = useState<any>(null);
  const [editData, setEditData] = useState<any>(null);
  const [copyDisabled, setCopyDisabled] = useState(true);
  const [deleteDisabled, setDeleteDisabled] = useState(true);

  /* ================= Meta State ================= */
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [headerMeta, setHeaderMeta] = useState<Record<string, HeaderMetaProps>>(
    {}
  );

  /* ================= Form Defs ================= */
  const formDefs = useMemo<FormDef[]>(
    () =>
      Object.entries(headerMeta).map(([field, meta]) => ({
        field,
        ...meta,
        read_only: normalizeBoolean(meta.read_only),
      })),
    [headerMeta]
  );

  /* ================= Fetch Meta ================= */
  const fetchHeaderMeta = useCallback(async () => {
    setLoadingMeta(true);
    setMetaError(null);
    try {
      const res = await viewSet.options();
      let meta = res?.actions?.POST ?? {};

      // 过滤指定字段
      const fieldsToFilter = filterMetaFieldsRef.current;
      if (fieldsToFilter.length > 0) {
        const filtered = { ...meta };
        fieldsToFilter.forEach((field: string) => {
          delete filtered[field];
        });
        meta = filtered;
      }

      setHeaderMeta(meta);
    } catch (err: any) {
      console.error(`Failed to load ${entity} Meta:`, err);
      setMetaError(err?.message || i18n.t("Failed to load metadata"));
    } finally {
      setLoadingMeta(false);
    }
  }, [viewSet, entity, i18n]);

  useEffect(() => {
    fetchHeaderMeta();
  }, [fetchHeaderMeta]);

  /* ================= Actions ================= */
  const openCreate = useCallback(() => {
    setEditData(null);
    setEditOpen(true);
  }, []);

  const openView = useCallback((row: any) => {
    setViewRow(row);
    setViewOpen(true);
  }, []);

  const openCopy = useCallback(() => {
    const node = gridApiRef.current?.getSelectedNodes?.()[0];
    if (!node?.data) return;

    const copyData = buildCopyData
      ? buildCopyData(node.data)
      : defaultBuildCopyData(node.data, excludeFromCopyRef.current);

    setEditData(copyData);
    setEditOpen(true);
  }, [buildCopyData]);

  const openDelete = useCallback(() => {
    if (!enableDelete) return;

    const node = gridApiRef.current?.getSelectedNodes?.()[0];
    if (!node?.data) return;

    const displayName = node.data[nameField] || `ID: ${node.data.id}`;

    Modal.confirm({
      title: i18n.t("Are you sure to delete?"),
      content: `${i18n.t(nameField)}: ${displayName}`,
      okText: i18n.t("Delete"),
      okType: "danger",
      cancelText: i18n.t("Cancel"),
      onOk: async () => {
        try {
          messageApi.open({
            key: "delete",
            type: "loading",
            content: i18n.t("Deleting..."),
            duration: 0,
          });

          await viewSet.delete({ id: node.data.id });

          messageApi.open({
            key: "delete",
            type: "success",
            content: i18n.t("Delete successfully"),
          });

          // Refresh table
          tableRef.current?.api?.refreshServerSide();

          // Close view drawer if the deleted item was being viewed
          if (viewRow?.id === node.data.id) {
            setViewOpen(false);
            setViewRow(null);
          }
        } catch (err: any) {
          console.error("Delete failed:", err);
          messageApi.open({
            key: "delete",
            type: "error",
            content:
              err?.message ||
              err?.response?.data?.message ||
              i18n.t("Delete failed"),
          });
        }
      },
    });
  }, [enableDelete, nameField, viewSet, viewRow, messageApi, i18n]);

  /* ================= Close Handlers ================= */
  const closeView = useCallback(() => {
    setViewOpen(false);
    setViewRow(null);
  }, []);

  const closeEdit = useCallback((res?: any) => {
    setEditOpen(false);
    setEditData(null);

    if (res?.data) setViewRow(res.data);
  }, []);

  /* ================= Success Handlers ================= */
  const handleCreateSuccess = useCallback((res?: any) => {
    if (!res) return;

    tableRef.current?.api?.refreshServerSide();

    // 支持两种响应格式: { data: ... } 或直接数据
    const data = res.data ?? res;
    if (data?.id) {
      setViewRow(data);
    }
  }, []);

  const handleUpdateSuccess = useCallback((res?: any) => {
    // 支持两种响应格式: { data: ... } 或直接数据
    const updated = res?.data ?? res;
    if (!updated) return;

    setViewRow(updated);

    const api = tableRef.current?.api;
    if (!api) return;

    const node = api.getRowNode(String(updated.id));

    if (node) {
      node.updateData(updated);
      api.ensureNodeVisible(node, "middle");
    } else {
      api.refreshServerSide({ route: [], purge: false });
    }
  }, []);

  /* ================= Refresh ================= */
  const refreshTable = useCallback(() => {
    tableRef.current?.api?.refreshServerSide();
  }, []);

  /* ================= Table Props ================= */
  const tableProps = useMemo(
    () => ({
      onRowClicked: (e: any) => openView(e.data),
      onGridReady: (params: any) => {
        gridApiRef.current = params.api;
      },
      onSelectionChanged: (e: any) => {
        const selected = e.api.getSelectedNodes();
        const hasSelection = selected.length > 0;
        setCopyDisabled(!hasSelection);
        setDeleteDisabled(!hasSelection);
      },
    }),
    [openView]
  );

  /* ================= Return ================= */
  return {
    // State
    loadingMeta,
    metaError,
    headerMeta,
    formDefs,
    isEditOpen,
    isViewOpen,
    viewRow,
    editData,
    copyDisabled,
    deleteDisabled,
    // Actions
    openCreate,
    openView,
    openCopy,
    openDelete,
    closeView,
    closeEdit,
    handleCreateSuccess,
    handleUpdateSuccess,
    refreshTable,
    // Refs
    tableRef,
    gridApiRef,
    // Table Props
    tableProps,
    // Message
    messageApi,
    contextHolder,
  };
}

export default useCRMPage;
