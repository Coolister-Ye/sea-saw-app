import { useState, useEffect, useMemo } from "react";
import i18n from "@/locale/i18n";
import { devError } from "@/utils/logger";
import type { HeaderMetaProps } from "../../interface";
import type { ComputedColumn, NativeColDefinition } from "../types";
import { normalizeHeaderMeta, buildColumns } from "../utils";

type UseTableMetaParams = {
  viewSet: any;
  initialHeaderMeta?: HeaderMetaProps | Record<string, HeaderMetaProps>;
  colDefinitions?: Record<string, NativeColDefinition>;
  hideWriteOnly: boolean;
  columnOrder?: string[];
};

type UseTableMetaResult = {
  columns: ComputedColumn[];
  isLoading: boolean;
  error: string | null;
};

export function useTableMeta({
  viewSet,
  initialHeaderMeta,
  colDefinitions,
  hideWriteOnly,
  columnOrder,
}: UseTableMetaParams): UseTableMetaResult {
  const [columns, setColumns] = useState<ComputedColumn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stable strings for object/array props — callers often pass inline literals
  // that create new references on every render without changing content.
  // Using JSON.stringify prevents spurious OPTIONS re-fetches.
  const colDefsStr = useMemo(
    () => JSON.stringify(colDefinitions ?? null),
    [colDefinitions],
  );
  const columnOrderStr = useMemo(
    () => JSON.stringify(columnOrder ?? null),
    [columnOrder],
  );

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setError(null);

    (async () => {
      try {
        let meta: Record<string, HeaderMetaProps>;

        if (initialHeaderMeta) {
          meta = normalizeHeaderMeta(initialHeaderMeta);
        } else {
          const res = await viewSet.options();
          meta = normalizeHeaderMeta(res.actions?.POST);
        }

        if (mounted) {
          setColumns(
            buildColumns(
              meta,
              colDefinitions,
              hideWriteOnly,
              columnOrder,
            ),
          );
        }
      } catch (err) {
        devError("NativeTable useTableMeta: failed", err);
        if (mounted) setError(i18n.t("Failed to load table configuration"));
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialHeaderMeta, viewSet, colDefsStr, hideWriteOnly, columnOrderStr]);

  return { columns, isLoading, error };
}
