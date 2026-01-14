// 文件路径：@/hooks/useFormDefs.ts
import { useState, useEffect, useCallback } from "react";
import useDataService from "@/hooks/useDataService";
import type {
  HeaderMetaProps,
  FormDef,
} from "@/components/sea-saw-design/form/interface";
import { normalizeBoolean } from "@/utils";

export type { FormDef };

interface UseFormDefsProps {
  table?: string;
  def?: Record<string, HeaderMetaProps> | any;
}

export function useFormDefs({ table, def }: UseFormDefsProps) {
  const { getViewSet } = useDataService();
  const [formDefs, setFormDefs] = useState<FormDef[]>([]);

  /** -----------------------------
   * 工具函数：把 meta 转为 FormDef 数组
   * ----------------------------- */
  const getFormDefFromHeaderMeta = useCallback(
    (meta: Record<string, HeaderMetaProps> = {}) =>
      Object.entries(meta).map(([field, definitions]) => ({
        field,
        ...definitions,
        required: normalizeBoolean(definitions.required),
        read_only: normalizeBoolean(definitions.read_only),
      })),
    []
  );

  /** -----------------------------
   * 从后端获取字段定义
   * ----------------------------- */
  const fetchFormDefsFromNetwork = useCallback(async () => {
    if (!table) return [];
    try {
      const viewSet = getViewSet(table);
      const response = await viewSet.options();
      if (!response.status) return [];
      const meta: Record<string, HeaderMetaProps> =
        response.data.actions?.POST ?? {};
      return getFormDefFromHeaderMeta(meta);
    } catch (error) {
      console.error("Error fetching form definitions:", error);
      return [];
    }
  }, [getViewSet, table, getFormDefFromHeaderMeta]);

  /** -----------------------------
   * 从本地 def 获取字段定义
   * ----------------------------- */
  const fetchFormDefsFromLocal = useCallback(() => {
    if (!def) return [];
    const target = (def as any).children || (def as any).child?.children || def;
    return getFormDefFromHeaderMeta(target);
  }, [def, getFormDefFromHeaderMeta]);

  /** -----------------------------
   * 初始化加载字段定义
   * ----------------------------- */
  useEffect(() => {
    (async () => {
      const defs = def
        ? fetchFormDefsFromLocal()
        : await fetchFormDefsFromNetwork();
      setFormDefs(defs);
    })();
  }, [def, fetchFormDefsFromLocal, fetchFormDefsFromNetwork]);

  return formDefs;
}
