import React, {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button, Form } from "antd";
import i18n from "@/locale/i18n";

import { Grid } from "@/components/sea-saw-design/grid";
import type {
  GridRef,
  IGridDatasource,
  GridColumnGroupDef,
  RowSelectionConfig,
} from "@/components/sea-saw-design/grid";

import useDataService from "@/hooks/useDataService";
import { SearchForm } from "@/components/sea-saw-design/form/SearchForm";
import { useTableMeta } from "./native/hooks/useTableMeta";
import type { HeaderMetaProps } from "./interface";
import type { NativeColDefinition } from "./native/types";

export type GridTableProps = {
  /** API endpoint key — maps to Constants.ts */
  table: string;
  /** Custom column overrides keyed by field name */
  colDefinitions?: Record<string, NativeColDefinition>;
  /** Pre-loaded field metadata — skips the OPTIONS call when provided */
  headerMeta?: HeaderMetaProps | Record<string, HeaderMetaProps>;
  /** Hide fields marked write_only in metadata (default: false) */
  hideWriteOnly?: boolean;
  /** Extra query parameters forwarded to the list API on every fetch */
  queryParams?: Record<string, any>;
  /** Explicit column order; unlisted fields appear after ordered ones */
  columnOrder?: string[];
  /** Show the search panel sidebar (default: true) */
  searchable?: boolean;
  /** Control search panel visibility externally (default: false) */
  searchPanelOpen?: boolean;
  /** Show the inline quick-filter search bar above the grid (default: false) */
  enableQuickFilter?: boolean;
  /** Query parameter name for quick-filter requests (default: "search") */
  quickFilterParam?: string;
  /** Placeholder for the quick-filter input */
  quickFilterPlaceholder?: string;
  context?: Record<string, any>;
  columnGroups?: GridColumnGroupDef[];
  rowSelection?: RowSelectionConfig;
  onRowPress?: (row: Record<string, any>) => void;
  onRowClicked?: (event: { data: Record<string, any> }) => void;
  defaultPageSize?: number;
  /* AG Grid compat props — accepted and silently ignored */
  onGridReady?: any;
  suppressUpdate?: boolean;
  suppressDelete?: boolean;
  onDeleteSuccess?: (row: Record<string, any>) => void;
};

const GridTable = forwardRef<GridRef, GridTableProps>(function GridTable(
  {
    table,
    colDefinitions,
    headerMeta: initialHeaderMeta,
    hideWriteOnly = false,
    queryParams,
    columnOrder,
    searchable = true,
    searchPanelOpen = false,
    enableQuickFilter = false,
    quickFilterParam = "search",
    quickFilterPlaceholder,
    context,
    columnGroups,
    rowSelection,
    onRowPress,
    onRowClicked,
    defaultPageSize,
    onGridReady: _onGridReady,
    suppressUpdate: _suppressUpdate,
    suppressDelete: _suppressDelete,
    onDeleteSuccess: _onDeleteSuccess,
  },
  ref,
) {
  const { getViewSet } = useDataService();
  const viewSet = useMemo(() => getViewSet(table), [getViewSet, table]);
  const [searchForm] = Form.useForm();

  const { columns, headerMetaData, isLoading: isMetaLoading } = useTableMeta({
    viewSet,
    initialHeaderMeta,
    colDefinitions,
    hideWriteOnly,
    columnOrder,
  });

  /* searchParamsRef holds the latest filter values; incrementing searchTick
     recreates the datasource reference, which triggers Grid's datasource-change
     effect to reset pagination to page 0 before re-fetching. */
  const searchParamsRef = useRef<Record<string, any>>({});
  const [searchTick, setSearchTick] = useState(0);

  const queryParamsRef = useRef(queryParams);
  queryParamsRef.current = queryParams;
  const quickFilterParamRef = useRef(quickFilterParam);
  quickFilterParamRef.current = quickFilterParam;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const datasource = useMemo<IGridDatasource>(
    () => ({
      getRows({ startRow, endRow, sortModel, filterModel, success, fail }) {
        const pageSize = endRow - startRow;
        const pageIndex = Math.floor(startRow / pageSize);

        const ordering =
          sortModel
            .map((s) => `${s.sort === "desc" ? "-" : ""}${s.colId}`)
            .join(",") || undefined;

        const { _quickFilter, ...restFilter } = filterModel ?? {};

        const params: Record<string, any> = {
          page: pageIndex + 1,
          page_size: pageSize,
        };
        if (ordering) params.ordering = ordering;
        if (_quickFilter) params[quickFilterParamRef.current] = _quickFilter;
        Object.assign(params, restFilter, queryParamsRef.current, searchParamsRef.current);

        viewSet
          .list({ params })
          .then((res: any) => {
            success({
              rowData: res.results ?? res,
              rowCount: res.count ?? (Array.isArray(res) ? res.length : 0),
            });
          })
          .catch(() => fail());
      },
    }),
    [viewSet, searchTick], // searchTick is the re-fetch trigger; queryParams/searchParams read via refs
  );

  const handleSearchSubmit = useCallback((params: Record<string, any>) => {
    searchParamsRef.current = params;
    setSearchTick((t) => t + 1);
  }, []);

  const handleSearchReset = useCallback(() => {
    searchForm.resetFields();
    searchParamsRef.current = {};
    setSearchTick((t) => t + 1);
  }, [searchForm]);

  return (
    <View style={styles.root}>
      {searchable && searchPanelOpen && (
        <View style={styles.sidebar}>
          <View style={styles.sidebarHeader}>
            <Text style={styles.sidebarTitle}>{i18n.t("filter")}</Text>
          </View>
          <View style={styles.sidebarBody}>
            <SearchForm
              form={searchForm}
              metadata={headerMetaData}
              layout="vertical"
              onFinish={handleSearchSubmit}
            />
          </View>
          <View style={styles.sidebarFooter}>
            <Button
              type="primary"
              size="small"
              onClick={() => searchForm.submit()}
              style={styles.footerBtn}
            >
              {i18n.t("search")}
            </Button>
            <Button size="small" onClick={handleSearchReset} style={styles.footerBtn}>
              {i18n.t("reset")}
            </Button>
          </View>
        </View>
      )}
      <View style={styles.gridContainer}>
        <Grid
          ref={ref}
          columnDefs={columns}
          datasource={datasource}
          columnGroups={columnGroups}
          context={context}
          enableQuickFilter={enableQuickFilter}
          quickFilterPlaceholder={quickFilterPlaceholder}
          onRowPress={onRowPress}
          onRowClicked={onRowClicked}
          rowSelection={rowSelection}
          loading={isMetaLoading}
          defaultPageSize={defaultPageSize}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: "row",
  },
  sidebar: {
    width: 260,
    borderRightWidth: 1,
    borderRightColor: "#f0f0f0",
  },
  sidebarHeader: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sidebarTitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#595959",
  },
  sidebarBody: {
    flex: 1,
    overflow: "hidden",
  },
  sidebarFooter: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  footerBtn: {
    flex: 1,
  },
  gridContainer: {
    flex: 1,
  },
});

export default GridTable;
export { GridTable };
export type { NativeColDefinition as GridTableColDefinition };
