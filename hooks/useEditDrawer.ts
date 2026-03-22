import { useState, useCallback, useRef } from "react";
import { stripIdsDeep } from "@/utils";

export interface UseEditDrawerConfig {
  /** 需要从 copy 数据中排除的字段 */
  excludeFromCopy?: string[];
  /** 自定义 copy 数据构建函数，优先于 excludeFromCopy */
  buildCopyData?: (data: any) => any;
}

export interface UseEditDrawerReturn {
  isEditOpen: boolean;
  editData: any;
  openCreate: () => void;
  openCopy: () => void;
  /** 仅关闭 drawer，不处理 viewRow 同步（由 useEntityPage 的 closeEdit 包装） */
  closeEditDrawer: () => void;
}

const EMPTY_ARRAY: string[] = [];

function defaultBuildCopyData(data: any, excludeFields: string[]): any {
  if (!data) return null;
  const { id, pk, created_at, updated_at, ...rest } = data;
  const filtered = { ...rest };
  excludeFields.forEach((field) => {
    delete filtered[field];
  });
  return stripIdsDeep(filtered);
}

export function useEditDrawer(
  gridApiRef: React.RefObject<any>,
  config?: UseEditDrawerConfig,
): UseEditDrawerReturn {
  const excludeFromCopyRef = useRef(config?.excludeFromCopy ?? EMPTY_ARRAY);
  const buildCopyData = config?.buildCopyData;

  const [isEditOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const openCreate = useCallback(() => {
    setEditData(null);
    setEditOpen(true);
  }, []);

  const openCopy = useCallback(() => {
    const node = gridApiRef.current?.getSelectedNodes?.()[0];
    if (!node?.data) return;

    const copyData = buildCopyData
      ? buildCopyData(node.data)
      : defaultBuildCopyData(node.data, excludeFromCopyRef.current);

    setEditData(copyData);
    setEditOpen(true);
  }, [gridApiRef, buildCopyData]);

  const closeEditDrawer = useCallback(() => {
    setEditOpen(false);
    setEditData(null);
  }, []);

  return { isEditOpen, editData, openCreate, openCopy, closeEditDrawer };
}
