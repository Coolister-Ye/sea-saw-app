import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import i18n from "@/locale/i18n";

import { HeaderMetaProps } from "@/components/sea-saw-design/table/interface";
import { FormDef } from "@/hooks/useFormDefs";
import useDataService from "@/hooks/useDataService";
import { normalizeBoolean } from "@/utils";

export interface UseEntityMetaOptions {
  /** 需要从 headerMeta 中过滤掉的字段 */
  filterMetaFields?: string[];
}

export interface UseEntityMetaReturn {
  loadingMeta: boolean;
  metaError: string | null;
  headerMeta: Record<string, HeaderMetaProps>;
  formDefs: FormDef[];
  /** viewSet 实例，供其他 hooks 使用（如 useEntityDelete） */
  viewSet: ReturnType<ReturnType<typeof useDataService>["getViewSet"]>;
}

const EMPTY_ARRAY: string[] = [];

export function useEntityMeta(
  entity: string,
  options?: UseEntityMetaOptions,
): UseEntityMetaReturn {
  const filterMetaFieldsRef = useRef(options?.filterMetaFields ?? EMPTY_ARRAY);

  const { getViewSet } = useDataService();
  const viewSet = useMemo(() => getViewSet(entity), [getViewSet, entity]);

  const [loadingMeta, setLoadingMeta] = useState(false);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [headerMeta, setHeaderMeta] = useState<Record<string, HeaderMetaProps>>({});

  const formDefs = useMemo<FormDef[]>(
    () =>
      Object.entries(headerMeta).map(([field, meta]) => ({
        field,
        ...meta,
        read_only: normalizeBoolean(meta.read_only),
      })),
    [headerMeta],
  );

  const fetchHeaderMeta = useCallback(async () => {
    setLoadingMeta(true);
    setMetaError(null);
    try {
      const res = await viewSet.options();
      let meta = res?.actions?.POST ?? {};

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
  }, [viewSet, entity]);

  useEffect(() => {
    fetchHeaderMeta();
  }, [fetchHeaderMeta]);

  return { loadingMeta, metaError, headerMeta, formDefs, viewSet };
}
