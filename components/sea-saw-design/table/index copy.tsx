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
  RowEditingStartedEvent,
  RowEditingStoppedEvent,
  CellClassParams,
  ValueParserParams,
} from "ag-grid-community";

import useDataService from "@/hooks/useDataService";
import { useToast } from "@/context/Toast";

import { ActionCell } from "./ActionCell";
import {
  convertAgGridFilterToDjangoParams,
  convertAgGridSorterToDjangoParams,
  getAgFilterType,
  getFilterParams,
  getCellDataType,
  getCellEditor,
  getValueFormatter,
  focusFirstEditableCol,
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
  (
    {
      table,
      colDefinitions,
      headerMeta,
      suppressUpdate = true,
      suppressDelete = true,
      onGridReady,
      ...props
    },
    ref
  ) => {
    const { list, options, update, loading } = useDataService();
    const { showToast } = useToast();

    const gridRef = useRef<AgGridReact>(null);
    const originalRowDataRef = useRef<Map<string, any>>(new Map());

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

          res.status
            ? params.success({ rowData: res.data.results })
            : params.fail();
        } catch (err) {
          console.error("Fetch rows failed:", err);
          params.fail();
        }
      },
      [list, table]
    );

    const datasource = useMemo(() => ({ getRows: fetchData }), [fetchData]);

    /* ================= ColumnDefs ================= */

    const cellClassRules = useMemo(
      () => ({
        "not-editing-cell": (p: CellClassParams) => {
          const editing = p.api.getEditingCells();
          return !editing.some(
            (c) =>
              c.rowIndex === p.node.rowIndex &&
              c.column.getColId() === p.column.getColId()
          );
        },
        "editing-cell": (p: CellClassParams) => p.data?.actions === "update",
      }),
      []
    );

    const actionColumn = useMemo<ColDef[]>(
      () =>
        suppressUpdate && suppressDelete
          ? []
          : [
              {
                field: "actions",
                cellRenderer: ActionCell,
                cellRendererParams: {
                  table,
                  suppressUpdate,
                  suppressDelete,
                },
                pinned: "right",
                maxWidth: 65,
                editable: false,
                filter: false,
                sortable: false,
              },
            ],
      [suppressUpdate, suppressDelete, table]
    );

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
              editable: !def.read_only,
              filter: getAgFilterType(def.type, def.operations ?? []),
              filterParams: getFilterParams(def.operations ?? []),
              cellDataType: getCellDataType(def.type),
              cellEditor: getCellEditor(def.type),
              cellEditorParams: { dataType: def },
              valueFormatter: getValueFormatter(def.type, def.display_fields),
              valueParser: (p: ValueParserParams) => p.newValue,
              cellClassRules,
              sortable: true,
              resizable: true,
              flex: 1,
              ...colDefinitions?.[key],
            } as ColDef;
          });

        const extraCols =
          Object.entries(colDefinitions || {})
            .filter(([k, v]) => !used.has(k) && !v?.skip)
            .map(([k, v]) => ({ field: k, ...v })) ?? [];

        return [...baseCols, ...extraCols, ...actionColumn];
      },
      [colDefinitions, cellClassRules, actionColumn]
    );

    /* ================= HeaderMeta ================= */

    useEffect(() => {
      const load = async () => {
        if (headerMeta) {
          setColumnDefs(buildColumnDefs(normalizeHeaderMeta(headerMeta)));
          return;
        }
        const res = await options({ contentType: table });
        if (res?.status) {
          setColumnDefs(
            buildColumnDefs(normalizeHeaderMeta(res.data.actions?.POST))
          );
        }
      };
      load();
    }, [headerMeta, options, table, buildColumnDefs]);

    /* ================= Editing ================= */

    const onRowEditingStarted = useCallback((e: RowEditingStartedEvent) => {
      const id = e.data.pk || e.data.id;
      originalRowDataRef.current.set(id, { ...e.data });
    }, []);

    const onRowEditingStopped = useCallback(
      async (e: RowEditingStoppedEvent<any>) => {
        const { data, api, node, rowIndex } = e;
        const id = data.pk || data.id;

        const oldData = originalRowDataRef.current.get(id) || {};
        const { actions, ...newData } = data;

        if (JSON.stringify(oldData) === JSON.stringify(newData)) {
          node.setDataValue("actions", undefined);
          return;
        }

        const res = await update({
          contentType: table,
          id,
          body: newData,
        });

        if (res.status) {
          api.applyServerSideTransaction({ update: [res.data] });
        } else {
          showToast({ message: res.error?.message || "Update failed" });
          api.applyServerSideTransaction({ update: [oldData] });
          focusFirstEditableCol(api, rowIndex || 0);
        }
      },
      [update, table, showToast]
    );

    /* ================= GridReady ================= */

    const handleGridReady = useCallback(
      (params: GridReadyEvent) => {
        params.api.setGridOption("serverSideDatasource", datasource);

        onGridReady?.(params); // 合并调用
      },
      [datasource, onGridReady]
    );

    /* ================= Render ================= */

    return (
      <View className="flex-1 h-full">
        <AgGridReact
          ref={gridRef}
          rowModelType="serverSide"
          editType="fullRow"
          columnDefs={columnDefs}
          defaultColDef={{ editable: true, flex: 1 }}
          getRowId={(p: GetRowIdParams) => String(p.data.pk || p.data.id)}
          pagination
          paginationPageSize={PAGE_SIZE}
          paginationPageSizeSelector={PAGE_SIZE_OPTIONS}
          suppressClickEdit
          loading={loading}
          onGridReady={handleGridReady}
          onRowEditingStarted={onRowEditingStarted}
          onRowEditingStopped={onRowEditingStopped}
          {...props}
        />
      </View>
    );
  }
);

export default Table;
