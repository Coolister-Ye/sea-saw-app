// 文件路径：@/hooks/useFormDefs.ts
import { useState, useEffect, useCallback, useMemo } from "react";
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
  columnOrder?: string[];
}

export function useFormDefs({ table, def, columnOrder }: UseFormDefsProps) {
  const { getViewSet } = useDataService();
  const [networkFormDefs, setNetworkFormDefs] = useState<FormDef[]>([]);

  // Memoize viewSet to prevent infinite loops (CRITICAL per CLAUDE.md)
  const viewSet = useMemo(
    () => (table ? getViewSet(table) : null),
    [getViewSet, table]
  );

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
   * 根据 columnOrder 排序字段
   * ----------------------------- */
  const sortFormDefs = useCallback(
    (defs: FormDef[]) => {
      if (!columnOrder || columnOrder.length === 0) return defs;

      // Create a map for quick lookup
      const orderMap = new Map(
        columnOrder.map((field, index) => [field, index])
      );

      // Sort: fields in columnOrder first (by order), then others
      return [...defs].sort((a, b) => {
        const orderA = orderMap.get(a.field);
        const orderB = orderMap.get(b.field);

        // Both in order: sort by order
        if (orderA !== undefined && orderB !== undefined) {
          return orderA - orderB;
        }

        // Only a in order: a comes first
        if (orderA !== undefined) return -1;

        // Only b in order: b comes first
        if (orderB !== undefined) return 1;

        // Neither in order: keep original order
        return 0;
      });
    },
    [columnOrder]
  );

  // Process local def with useMemo - only recompute when def content actually changes
  const localFormDefs = useMemo(() => {
    if (!def) return [];

    const target =
      (def as any).children ||
      (def as any).child?.children ||
      def;
    const defs = getFormDefFromHeaderMeta(target);
    return sortFormDefs(defs);
    // Don't include def in dependencies - we'll use a serialized version below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // Use stringified def for comparison to avoid reference changes
    def ? JSON.stringify(def) : null,
    getFormDefFromHeaderMeta,
    sortFormDefs,
  ]);

  /** -----------------------------
   * 从网络获取字段定义（仅在没有 def 时）
   * ----------------------------- */
  useEffect(() => {
    // If we have local def, don't fetch
    if (def || !viewSet) return;

    let cancelled = false;

    (async () => {
      try {
        const response = await viewSet.options();
        const meta: Record<string, HeaderMetaProps> =
          response?.data?.actions?.POST ?? {};
        const defs = getFormDefFromHeaderMeta(meta);
        const sortedDefs = sortFormDefs(defs);

        if (!cancelled) {
          setNetworkFormDefs(sortedDefs);
        }
      } catch (error) {
        console.error("Error fetching form definitions:", error);
        if (!cancelled) {
          setNetworkFormDefs([]);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [def, viewSet, getFormDefFromHeaderMeta, sortFormDefs]);

  // Return local defs if available, otherwise network defs
  return def ? localFormDefs : networkFormDefs;
}
