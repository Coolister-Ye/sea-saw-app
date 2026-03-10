import React, {
  useCallback,
  useMemo,
  useState,
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import { View, Text, ActivityIndicator } from "react-native";
import i18n from "@/locale/i18n";
import { Button, Form } from "antd";
import { AgGridReact } from "ag-grid-react";
import {
  ColDef,
  GetRowIdParams,
  GridReadyEvent,
  IServerSideGetRowsParams,
  INoRowsOverlayParams,
} from "ag-grid-community";
import Ionicons from "@expo/vector-icons/Ionicons";

import useDataService from "@/hooks/useDataService";
import { devError } from "@/utils/logger";
import { SearchForm } from "@/components/sea-saw-design/form/SearchForm";
import {
  convertAgGridFilterToDjangoParams,
  convertAgGridSorterToDjangoParams,
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
  meta: HeaderMetaProps | Record<string, HeaderMetaProps>,
): meta is HeaderMetaProps {
  return "type" in meta && typeof meta.type === "string";
}

/** Normalize header metadata from various response formats */
function normalizeHeaderMeta(
  meta: HeaderMetaProps | Record<string, HeaderMetaProps> | undefined,
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

/** Custom No Rows Overlay Component */
function NoRowsOverlay(
  params: INoRowsOverlayParams & { noRowsMessage?: string },
) {
  return (
    <View className="flex-1 items-center justify-center py-12">
      <Ionicons name="file-tray-outline" size={48} color="#9ca3af" />
      <Text className="text-gray-400 text-base mt-3">
        {params.noRowsMessage || "No data yet"}
      </Text>
    </View>
  );
}

/** Custom Loading Overlay Component */
function LoadingOverlay(params: { loadingMessage?: string }) {
  return (
    <View className="flex-1 items-center justify-center py-12">
      <ActivityIndicator />
      <Text className="text-gray-500 text-base mt-3">
        {params.loadingMessage || "Loading..."}
      </Text>
    </View>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

const Table = forwardRef<AgGridReact, TableProps>(function Table(
  {
    table,
    colDefinitions,
    headerMeta: initialHeaderMeta,
    hideWriteOnly = false,
    queryParams,
    columnOrder,
    searchable = true,
    searchPanelOpen = false,
    onGridReady,
    ...gridProps
  },
  ref,
) {
  const { getViewSet } = useDataService();
  const viewSet = useMemo(() => getViewSet(table), [getViewSet, table]);
  const gridRef = useRef<AgGridReact>(null);
  const [searchForm] = Form.useForm();

  const [columnDefs, setColumnDefs] = useState<ColDef[]>([]);
  const [headerMetaData, setHeaderMetaData] = useState<
    Record<string, HeaderMetaProps>
  >({});

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      resizable: true,
      width: DEFAULT_COL_WIDTH,
    }),
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gridReady, setGridReady] = useState(false);
  const [searchParams, setSearchParams] = useState<Record<string, any>>({});

  useImperativeHandle(ref, () => gridRef.current as AgGridReact);

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

      // Show loading overlay
      gridRef.current?.api?.setGridOption("loading", true);

      try {
        const response = await viewSet.list({
          params: {
            limit: endRow - startRow,
            offset: startRow,
            pager: "limit_offset",
            ...filters,
            ...sorter,
            ...queryParams,
            ...searchParams,
          },
        });

        const rowData = response.results ?? [];
        params.success({
          rowData,
          rowCount: response.count,
        });

        // Hide loading overlay
        gridRef.current?.api?.setGridOption("loading", false);

        // Show no rows overlay when first page returns empty
        if (startRow === 0 && rowData.length === 0) {
          gridRef.current?.api?.showNoRowsOverlay();
        }
      } catch (err) {
        devError("Table fetch failed:", err);
        gridRef.current?.api?.setGridOption("loading", false);
        params.fail();
      }
    },
    [viewSet, queryParams, searchParams],
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
        .filter(([key, fieldMeta]) => {
          // Skip if explicitly configured to skip
          if (colDefinitions?.[key]?.skip) return false;

          // Skip if hideWriteOnly is enabled and field is write_only
          if (hideWriteOnly && fieldMeta.write_only) return false;

          return true;
        })
        .map(([field, fieldMeta]) => {
          processedFields.add(field);
          const customDef = colDefinitions?.[field] ?? {};

          return {
            field,
            headerName: fieldMeta.label,
            filter: false,
            cellDataType: getCellDataType(fieldMeta.type),
            valueFormatter: getValueFormatter(
              fieldMeta.type,
              fieldMeta.display_fields,
              fieldMeta.choices,
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

      const allColumns = [...metaColumns, ...extraColumns];

      // Apply column ordering if specified
      if (columnOrder && columnOrder.length > 0) {
        const orderedColumns: ColDef[] = [];
        const columnMap = new Map(allColumns.map((col) => [col.field, col]));

        // Add columns in the specified order
        columnOrder.forEach((fieldName) => {
          const column = columnMap.get(fieldName);
          if (column) {
            orderedColumns.push(column);
            columnMap.delete(fieldName);
          }
        });

        // Add remaining columns that weren't in columnOrder
        columnMap.forEach((column) => {
          orderedColumns.push(column);
        });

        return orderedColumns;
      }

      return allColumns;
    },
    [colDefinitions, hideWriteOnly, columnOrder],
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
          setHeaderMetaData(meta);
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
      setGridReady(true);
      onGridReady?.(event);
    },
    [onGridReady],
  );

  // Update datasource whenever it changes (after grid is ready)
  useEffect(() => {
    if (gridReady && gridRef.current?.api) {
      gridRef.current.api.setGridOption("serverSideDatasource", datasource);
    }
  }, [gridReady, datasource]);

  /* ─────────────────────────────────────────────────────────────────────────
     SEARCH HANDLERS
     ───────────────────────────────────────────────────────────────────────── */

  const handleSearchSubmit = useCallback((params: Record<string, any>) => {
    setSearchParams(params);
  }, []);

  const handleSearchReset = useCallback(() => {
    searchForm.resetFields();
    setSearchParams({});
  }, [searchForm]);

  /* ─────────────────────────────────────────────────────────────────────────
     RENDER
     ───────────────────────────────────────────────────────────────────────── */

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
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
    <View className="flex-1 h-full flex-row">
      {/* Left search panel sidebar */}
      {searchable && searchPanelOpen && (
        <View
          style={{
            width: 260,
            borderRightWidth: 1,
            borderRightColor: "#f0f0f0",
            flexDirection: "column",
          }}
        >
          <View
            style={{
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderBottomWidth: 1,
              borderBottomColor: "#f0f0f0",
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: "500", color: "#595959" }}>
              {i18n.t("filter")}
            </Text>
          </View>

          <View style={{ flex: 1, overflow: "hidden" }}>
            <SearchForm
              form={searchForm}
              metadata={headerMetaData}
              layout="vertical"
              onFinish={handleSearchSubmit}
            />
          </View>

          <View
            style={{
              flexDirection: "row",
              gap: 8,
              padding: 12,
              borderTopWidth: 1,
              borderTopColor: "#f0f0f0",
            }}
          >
            <Button
              type="primary"
              size="small"
              onClick={() => searchForm.submit()}
              style={{ flex: 1 }}
            >
              {i18n.t("search")}
            </Button>
            <Button
              size="small"
              onClick={handleSearchReset}
              style={{ flex: 1 }}
            >
              {i18n.t("reset")}
            </Button>
          </View>
        </View>
      )}

      {/* AG Grid - takes remaining space */}
      <View style={{ flex: 1, height: "100%" }}>
        <AgGridReact
          ref={gridRef}
          rowModelType="serverSide"
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          getRowId={getRowId}
          pagination
          paginationPageSize={DEFAULT_PAGE_SIZE}
          paginationPageSizeSelector={PAGE_SIZE_OPTIONS}
          onGridReady={handleGridReady}
          noRowsOverlayComponent={NoRowsOverlay}
          noRowsOverlayComponentParams={{
            noRowsMessage: i18n.t("No data yet"),
          }}
          loadingOverlayComponent={LoadingOverlay}
          loadingOverlayComponentParams={{
            loadingMessage: i18n.t("Loading..."),
          }}
          {...gridProps}
        />
      </View>
    </View>
  );
});

/* ═══════════════════════════════════════════════════════════════════════════
   EXPORTS
   ═══════════════════════════════════════════════════════════════════════════ */

export default Table;
export { Table };
export type { TableProps, ColDefinition };
