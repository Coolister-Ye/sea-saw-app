import React, {
  useCallback,
  useMemo,
  useState,
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import { View } from "react-native";
import { AgGridReact } from "ag-grid-react";
import {
  ColDef,
  GetRowIdParams,
  GridReadyEvent,
  IServerSideGetRowsParams,
} from "ag-grid-community";

import useDataService from "@/hooks/useDataService";
import {
  convertAgGridFilterToDjangoParams,
  convertAgGridSorterToDjangoParams,
  getAgFilterType,
  getFilterParams,
  getCellDataType,
  getValueFormatter,
} from "./utils";
import { HeaderMetaProps, TableProps } from "./interface";

const PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

/* ================= Utils ================= */
function normalizeHeaderMeta(meta: any): Record<string, HeaderMetaProps> {
  if (!meta) return {};
  if (meta.children) return meta.children;
  if (meta.child?.children) return meta.child.children;
  return meta;
}

/* ================= Component ================= */
const Table = forwardRef<AgGridReact, TableProps>(
  ({ table, colDefinitions, headerMeta, onGridReady, ...props }, ref) => {
    const { list, options } = useDataService();

    const gridRef = useRef<AgGridReact>(null);
    const [columnDefs, setColumnDefs] = useState<ColDef[]>([]);

    useImperativeHandle(ref, () => gridRef.current as AgGridReact, []);

    /* ================= DataSource ================= */
    const fetchData = useCallback(
      async (params: IServerSideGetRowsParams<any>) => {
        const {
          startRow = 0,
          endRow = PAGE_SIZE,
          filterModel,
          sortModel,
        } = params.request;

        const filters = convertAgGridFilterToDjangoParams(filterModel);
        const sorter = convertAgGridSorterToDjangoParams(sortModel);

        try {
          const res = await list({
            contentType: table,
            params: {
              limit: endRow - startRow,
              offset: startRow,
              pager: "limit_offset",
              ...filters,
              ...sorter,
            },
          });

          params.success({ rowData: res.results });
        } catch (err) {
          console.error("Fetch rows failed:", err);
          params.fail();
        }
      },
      [list, table]
    );

    const datasource = useMemo(() => ({ getRows: fetchData }), [fetchData]);

    /* ================= ColumnDefs ================= */
    const buildColumnDefs = useCallback(
      (meta: Record<string, HeaderMetaProps>): ColDef[] => {
        const used = new Set<string>();

        const baseCols = Object.entries(meta)
          .filter(([k]) => !colDefinitions?.[k]?.skip)
          .map(([key, def]) => {
            used.add(key);

            return {
              field: key,
              headerName: def.label,
              filter: getAgFilterType(def.type, def.operations ?? []),
              filterParams: getFilterParams(def.operations ?? []),
              cellDataType: getCellDataType(def.type),
              valueFormatter: getValueFormatter(def.type, def.display_fields),
              sortable: true,
              resizable: true,
              minWidth: 120,
              ...colDefinitions?.[key],
            } as ColDef;
          });

        const extraCols =
          Object.entries(colDefinitions || {})
            .filter(([k, v]) => !used.has(k) && !v?.skip)
            .map(([k, v]) => ({
              field: k,
              minWidth: 120,
              ...v,
            })) ?? [];

        return [...baseCols, ...extraCols];
      },
      [colDefinitions]
    );

    /* ================= HeaderMeta ================= */
    useEffect(() => {
      const load = async () => {
        try {
          if (headerMeta) {
            setColumnDefs(buildColumnDefs(normalizeHeaderMeta(headerMeta)));
            return;
          }

          const res = await options({ contentType: table });
          setColumnDefs(
            buildColumnDefs(normalizeHeaderMeta(res.actions?.POST))
          );
        } catch (err) {
          console.error("Load header meta failed:", err);
        }
      };

      load();
    }, [headerMeta, options, table, buildColumnDefs]);

    /* ================= GridReady ================= */
    const handleGridReady = useCallback(
      (params: GridReadyEvent) => {
        params.api.setGridOption("serverSideDatasource", datasource);
        onGridReady?.(params);
      },
      [datasource, onGridReady]
    );

    /* ================= Render ================= */
    return (
      <View className="flex-1 h-full">
        <AgGridReact
          ref={gridRef}
          rowModelType="serverSide"
          columnDefs={columnDefs}
          defaultColDef={{
            sortable: true,
            resizable: true,
            width: 100,
          }}
          getRowId={(p: GetRowIdParams) => String(p.data.pk || p.data.id)}
          pagination
          paginationPageSize={PAGE_SIZE}
          paginationPageSizeSelector={PAGE_SIZE_OPTIONS}
          onGridReady={handleGridReady}
          {...props}
        />
      </View>
    );
  }
);

export default Table;
export type { TableProps };
export { Table };
