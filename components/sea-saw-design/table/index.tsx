import React, {
  useCallback,
  useMemo,
  useState,
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import { View, ActivityIndicator } from "react-native";
import { AgGridReact } from "ag-grid-react";
import {
  ColDef,
  GetRowIdParams,
  GridReadyEvent,
  IServerSideGetRowsParams,
} from "ag-grid-community";

import useDataService from "@/hooks/useDataService";
import { useLocale } from "@/context/Locale";
import { devError } from "@/utils/logger";
import {
  convertAgGridFilterToDjangoParams,
  convertAgGridSorterToDjangoParams,
  getAgFilterType,
  getFilterParams,
  getCellDataType,
  getValueFormatter,
} from "./utils";
import type { HeaderMetaProps, TableProps, ColDefinition } from "./interface";

/* ═══════════════════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════════════════ */

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const DEFAULT_COL_WIDTH = 120;

/* ═══════════════════════════════════════════════════════════════════════════
   UTILITIES
   ═══════════════════════════════════════════════════════════════════════════ */

/** Type guard to check if meta is HeaderMetaProps (has 'type' field) */
function isHeaderMetaProps(
  meta: HeaderMetaProps | Record<string, HeaderMetaProps>
): meta is HeaderMetaProps {
  return "type" in meta && typeof meta.type === "string";
}

/** Normalize header metadata from various response formats */
function normalizeHeaderMeta(
  meta: HeaderMetaProps | Record<string, HeaderMetaProps> | undefined
): Record<string, HeaderMetaProps> {
  if (!meta) return {};

  if (isHeaderMetaProps(meta)) {
    if (meta.children) return meta.children;
    if (meta.child?.children) return meta.child.children;
    return {};
  }

  return meta;
}

/** Get row ID from data object */
function getRowId(params: GetRowIdParams): string {
  return String(params.data.pk ?? params.data.id ?? Math.random());
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

const Table = forwardRef<AgGridReact, TableProps>(function Table(
  {
    table,
    colDefinitions,
    headerMeta: initialHeaderMeta,
    onGridReady,
    ...gridProps
  },
  ref
) {
  const { getViewSet } = useDataService();
  const { i18n } = useLocale();

  const viewSet = useMemo(() => getViewSet(table), [getViewSet, table]);
  const gridRef = useRef<AgGridReact>(null);

  const [columnDefs, setColumnDefs] = useState<ColDef[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useImperativeHandle(ref, () => gridRef.current as AgGridReact, []);

  /* ─────────────────────────────────────────────────────────────────────────
     DATA SOURCE
     ───────────────────────────────────────────────────────────────────────── */

  const fetchData = useCallback(
    async (params: IServerSideGetRowsParams<any>) => {
      const {
        startRow = 0,
        endRow = DEFAULT_PAGE_SIZE,
        filterModel,
        sortModel,
      } = params.request;

      const filters = convertAgGridFilterToDjangoParams(filterModel);
      const sorter = convertAgGridSorterToDjangoParams(sortModel);

      try {
        const response = await viewSet.list({
          params: {
            limit: endRow - startRow,
            offset: startRow,
            pager: "limit_offset",
            ...filters,
            ...sorter,
          },
        });

        params.success({
          rowData: response.results ?? [],
          rowCount: response.count,
        });
      } catch (err) {
        devError("Table fetch failed:", err);
        params.fail();
      }
    },
    [viewSet]
  );

  const datasource = useMemo(() => ({ getRows: fetchData }), [fetchData]);

  /* ─────────────────────────────────────────────────────────────────────────
     COLUMN DEFINITIONS
     ───────────────────────────────────────────────────────────────────────── */

  const buildColumnDefs = useCallback(
    (meta: Record<string, HeaderMetaProps>): ColDef[] => {
      const processedFields = new Set<string>();

      // Build columns from metadata
      const metaColumns = Object.entries(meta)
        .filter(([key]) => !colDefinitions?.[key]?.skip)
        .map(([field, fieldMeta]) => {
          processedFields.add(field);
          const customDef = colDefinitions?.[field] ?? {};

          return {
            field,
            headerName: fieldMeta.label,
            filter: getAgFilterType(fieldMeta.type, fieldMeta.operations ?? []),
            filterParams: getFilterParams(fieldMeta.operations ?? []),
            cellDataType: getCellDataType(fieldMeta.type),
            valueFormatter: getValueFormatter(
              fieldMeta.type,
              fieldMeta.display_fields
            ),
            sortable: true,
            resizable: true,
            minWidth: DEFAULT_COL_WIDTH,
            ...customDef,
          } as ColDef;
        });

      // Add extra columns from colDefinitions not in metadata
      const extraColumns = Object.entries(colDefinitions ?? {})
        .filter(([key, def]) => !processedFields.has(key) && !def?.skip)
        .map(([field, def]) => ({
          field,
          minWidth: DEFAULT_COL_WIDTH,
          sortable: true,
          resizable: true,
          ...def,
        }));

      return [...metaColumns, ...extraColumns];
    },
    [colDefinitions]
  );

  /* ─────────────────────────────────────────────────────────────────────────
     METADATA LOADING
     ───────────────────────────────────────────────────────────────────────── */

  useEffect(() => {
    let isMounted = true;

    async function loadMetadata() {
      setIsLoading(true);
      setError(null);

      try {
        let meta: Record<string, HeaderMetaProps>;

        if (initialHeaderMeta) {
          meta = normalizeHeaderMeta(initialHeaderMeta);
        } else {
          const response = await viewSet.options();
          meta = normalizeHeaderMeta(response.actions?.POST);
        }

        if (isMounted) {
          setColumnDefs(buildColumnDefs(meta));
        }
      } catch (err) {
        devError("Failed to load table metadata:", err);
        if (isMounted) {
          setError(i18n.t("Failed to load table configuration"));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadMetadata();

    return () => {
      isMounted = false;
    };
  }, [initialHeaderMeta, viewSet, buildColumnDefs, i18n]);

  /* ─────────────────────────────────────────────────────────────────────────
     EVENT HANDLERS
     ───────────────────────────────────────────────────────────────────────── */

  const handleGridReady = useCallback(
    (event: GridReadyEvent) => {
      event.api.setGridOption("serverSideDatasource", datasource);
      onGridReady?.(event);
    },
    [datasource, onGridReady]
  );

  /* ─────────────────────────────────────────────────────────────────────────
     RENDER
     ───────────────────────────────────────────────────────────────────────── */

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <View className="text-red-500 text-center">{error}</View>
      </View>
    );
  }

  return (
    <View className="flex-1 h-full">
      <AgGridReact
        ref={gridRef}
        rowModelType="serverSide"
        columnDefs={columnDefs}
        defaultColDef={{
          sortable: true,
          resizable: true,
          width: DEFAULT_COL_WIDTH,
        }}
        getRowId={getRowId}
        pagination
        paginationPageSize={DEFAULT_PAGE_SIZE}
        paginationPageSizeSelector={PAGE_SIZE_OPTIONS}
        onGridReady={handleGridReady}
        {...gridProps}
      />
    </View>
  );
});

/* ═══════════════════════════════════════════════════════════════════════════
   EXPORTS
   ═══════════════════════════════════════════════════════════════════════════ */

export default Table;
export { Table };
export type { TableProps, ColDefinition };
