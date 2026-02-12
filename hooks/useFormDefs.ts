// 文件路径：@/hooks/useFormDefs.ts
import { useState, useEffect, useMemo } from "react";
import useDataService from "@/hooks/useDataService";
import type {
  HeaderMetaProps,
  FormDef,
} from "@/components/sea-saw-design/form/interface";
import { convertToFormDefs, sortFormDefs } from "@/utils/formDefUtils";

export type { FormDef };

interface UseFormDefsProps {
  table: string;
  columnOrder?: string[];
}

/**
 * Fetch and normalize form definitions from backend OPTIONS
 * ONLY for network requests - no local def conversion
 *
 * For local def conversion, use convertToFormDefs() directly
 */
export function useFormDefs({ table, columnOrder }: UseFormDefsProps) {
  const { getViewSet } = useDataService();
  const [formDefs, setFormDefs] = useState<FormDef[]>([]);

  // Memoize viewSet to prevent infinite loops (CRITICAL per CLAUDE.md)
  const viewSet = useMemo(() => getViewSet(table), [getViewSet, table]);

  /** Fetch from network */
  useEffect(() => {
    // Skip if no table or empty table
    if (!table || !viewSet) return;

    let cancelled = false;

    (async () => {
      try {
        const response = await viewSet.options();
        const meta: Record<string, HeaderMetaProps> =
          response?.data?.actions?.POST ?? {};

        // Convert and sort
        const defs = convertToFormDefs(meta);
        const sortedDefs = sortFormDefs(defs, columnOrder);

        if (!cancelled) {
          setFormDefs(sortedDefs);
        }
      } catch (error) {
        console.error("Error fetching form definitions:", error);
        if (!cancelled) {
          setFormDefs([]);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [viewSet, columnOrder]);

  return formDefs;
}
