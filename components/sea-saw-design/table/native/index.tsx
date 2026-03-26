/**
 * NativeTable — Django ViewSet wrapper around Grid.
 *
 * Handles the Django-specific plumbing that Grid doesn't know about:
 *   • OPTIONS fetch → ComputedColumn[]  (via useTableMeta)
 *   • ViewSet list() → IGridDatasource  (page/ordering/filter params)
 *   • quickFilterParam mapping          (_quickFilter → API param name)
 *
 * All generic grid behaviour (pagination, sorting, column pinning, flex widths,
 * row selection, column menu) is delegated to Grid.
 */
import React, { forwardRef, useMemo, useRef } from "react";
import { Grid } from "@/components/sea-saw-design/grid";
import type { GridRef, IGridDatasource } from "@/components/sea-saw-design/grid";
import useDataService from "@/hooks/useDataService";
import { useTableMeta } from "./hooks/useTableMeta";
import type { NativeTableProps, NativeTableRef } from "./types";

const NativeTable = forwardRef<NativeTableRef, NativeTableProps>(
  function NativeTable(
    {
      table,
      colDefinitions,
      headerMeta,
      hideWriteOnly = false,
      queryParams,
      columnOrder,
      quickFilterParam = "search",
      // onEdit has no equivalent in Grid — accepted and ignored for API compat
      onEdit: _onEdit,
      ...gridProps
    },
    ref,
  ) {
    /* ── ViewSet ─────────────────────────────────────────────────────── */
    const { getViewSet } = useDataService();
    const viewSet = useMemo(() => getViewSet(table), [getViewSet, table]);

    /* ── Column metadata (OPTIONS → ComputedColumn[]) ────────────────── */
    const {
      columns: columnDefs,
      isLoading: isMetaLoading,
      error: metaError,
    } = useTableMeta({
      viewSet,
      initialHeaderMeta: headerMeta,
      colDefinitions,
      hideWriteOnly,
      columnOrder,
    });

    /* ── Datasource — stable reference; queryParams via ref ──────────── */
    const queryParamsRef = useRef(queryParams);
    queryParamsRef.current = queryParams;
    const quickFilterParamRef = useRef(quickFilterParam);
    quickFilterParamRef.current = quickFilterParam;

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
          Object.assign(params, restFilter, queryParamsRef.current);

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
      [viewSet],
    );

    /* ── Render ──────────────────────────────────────────────────────── */
    return (
      <Grid
        {...gridProps}
        ref={ref as React.Ref<GridRef>}
        columnDefs={columnDefs}
        datasource={datasource}
        loading={isMetaLoading || !!metaError}
      />
    );
  },
);

export default NativeTable;
export { NativeTable };

export type {
  NativeColDefinition,
  NativeColumnGroupDef,
  NativeTableProps,
  NativeTableRef,
  ComputedColumn,
  CellRendererProps,
  ValueGetterParams,
  ValueFormatterParams,
  RowSelectionConfig,
  SortItem,
  SortState,
  ColState,
} from "./types";
