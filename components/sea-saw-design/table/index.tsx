import useDataService from "@/hooks/useDataService";
import {
  CellClassParams,
  ColDef,
  GetRowIdParams,
  GridReadyEvent,
  IServerSideGetRowsParams,
  RowEditingStartedEvent,
  RowEditingStoppedEvent,
  SizeColumnsToContentStrategy,
  ValueParserParams,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import React, {
  useCallback,
  useMemo,
  useState,
  forwardRef,
  useRef,
  useImperativeHandle,
  useEffect,
} from "react";
import ForeignKeyCell from "./ForeignKeyCell";
import {
  convertAgGridFilterToDjangoParams,
  getAgFilterType,
  getFilterParams,
  getCellDataType,
  getCellEditor,
  getValueFormatter,
  convertAgGridSorterToDjangoParams,
  focusFirstEditableCol,
} from "./utils";
import { HeaderMetaProps, TableProps } from "./interface";
import { ActionCell } from "./ActionCell";
import "./style.css";
import { useToast } from "@/context/Toast";
import { Pressable, View, Text, Modal } from "react-native";

const PAGE_SIZE = 10;

const Table = forwardRef<AgGridReact, TableProps>(
  (
    {
      table,
      colDefinitions,
      headerMeta,
      suppressUpdate,
      suppressDelete,
      ...props
    },
    ref
  ) => {
    console.log("headerMeta", headerMeta);
    const { list, options, update } = useDataService();
    const [columnDefs, setColumnDefs] = useState<ColDef[]>([]);
    const originalRowDataRef = useRef<Map<string, any>>(new Map());
    const gridRef = useRef<AgGridReact>(null);
    const { showToast } = useToast();
    const headerMetaRef = useRef(headerMeta);

    useImperativeHandle(ref, () => gridRef.current as AgGridReact, []);

    const AddData = useCallback(async () => {
      gridRef.current?.api.setGridOption("pinnedTopRowData", [{}]);
      if (gridRef.current?.api) {
        setTimeout(() => {
          const node = gridRef.current?.api.getPinnedTopRow(0);
          if (node && gridRef.current?.api) {
            focusFirstEditableCol(gridRef.current.api, 0, "top");
            node.setDataValue("actions", "update");
          }
        }, 0);
      }
    }, []);

    const updateData = useCallback(
      async (event: RowEditingStoppedEvent<any>) => {
        const { data, api, rowIndex, node } = event;
        const rowId = data.pk || data.id;
        const { actions: _, ...oldData } =
          originalRowDataRef.current.get(rowId);
        const { actions, ...newData } = data;

        if (JSON.stringify(oldData) === JSON.stringify(newData)) {
          event.node.setDataValue("actions", undefined);
          return;
        }

        try {
          const response = await update({
            contentType: table,
            id: data.pk || data.id,
            body: data,
          });
          if (response.status) {
            api.applyServerSideTransaction({ update: [response.data] });
          } else {
            console.warn("update fail: ", response);
            showToast({
              message: response.error?.message || "update fail: unkown error",
            });
            api.applyServerSideTransaction({ update: [oldData] });
            node.setDataValue("actions", "update");
            focusFirstEditableCol(api, rowIndex || 0);
          }
        } catch (error) {
          console.error("update fail: ", error);
        }
      },
      [update, table]
    );

    const fetchData = useCallback(
      async (params: IServerSideGetRowsParams<any>) => {
        const {
          startRow = 0,
          endRow = PAGE_SIZE,
          filterModel,
          sortModel,
        } = params.request;
        const blockSize = endRow - startRow;
        const filters = convertAgGridFilterToDjangoParams(filterModel);
        const sorter = convertAgGridSorterToDjangoParams(sortModel);

        try {
          const response = await list({
            contentType: table,
            params: {
              limit: blockSize,
              offset: startRow,
              pager: "limit_offset",
              ...filters,
              ...sorter,
            },
          });

          if (response.status) {
            params.success({
              rowData: response.data.results,
              // rowCount: response.data.count,
            });
          } else {
            console.warn("@@Failed to load rows:", response);
            params.fail();
          }
        } catch (error) {
          console.error("Failed to load rows:", error);
          params.fail();
        }
      },
      [list, table]
    );

    function getCellRenderer(type: string, definitions: HeaderMetaProps) {
      return ({ value }: any) => {
        if (type === "nested object" || type === "field") {
          return (
            <ForeignKeyCell data={value} dataType={definitions} usePopover />
          );
        }
        return value;
      };
    }

    function getActionCellDef(): ColDef[] {
      if (suppressUpdate && suppressDelete) return [];
      return [
        {
          field: "actions",
          headerName: "",
          cellRenderer: ActionCell,
          cellRendererParams: {
            suppressUpdate,
            suppressDelete,
            table,
          },
          filter: false,
          sortable: false,
          editable: false,
          pinned: "right",
          maxWidth: 65,
          cellClassRules: {
            "not-editing-action-cell": (params: CellClassParams) => {
              const editingCells = params.api.getEditingCells();
              return (
                editingCells.length > 0 && params.data.actions !== "update"
              );
            },
          },
        },
      ];
    }

    const handleRowEditingStopped = (event: RowEditingStoppedEvent<any>) => {
      updateData(event);
      event.api.refreshCells({ force: true });
    };

    const handleRowEditingStarted = (event: RowEditingStartedEvent) => {
      const rowId = event.data.pk || event.data.id;
      originalRowDataRef.current.set(rowId, { ...event.data });
      event.api.refreshCells({ force: true });
    };

    const getCellClassRules = () => {
      return {
        "not-editing-cell": (params: CellClassParams) => {
          const editingCells = params.api.getEditingCells();
          return !editingCells.some(
            (cell) =>
              cell.rowIndex === params.node.rowIndex &&
              cell.column.getColId() === params.column.getColId()
          );
        },
        "editing-cell": (params: CellClassParams) => {
          return params.data.actions === "update";
        },
      };
    };

    const getColDefsFromHeaderMeta = (
      headerMeta: Record<string, HeaderMetaProps>
    ) => {
      const headersFromMeta = new Set<string>();

      const colDefs = Object.entries(headerMeta).map(
        ([header, definitions]) => {
          const { type, label, read_only, operations = [] } = definitions;
          headersFromMeta.add(header);

          return {
            field: header,
            headerName: label,
            editable: !read_only,
            filter: getAgFilterType(type, operations),
            filterParams: getFilterParams(operations),
            cellDataType: getCellDataType(type),
            cellEditor: getCellEditor(type),
            cellEditorParams: { dataType: definitions },
            cellClassRules: getCellClassRules(),
            valueFormatter: getValueFormatter(
              type,
              definitions?.display_fields
            ),
            valueParser: (params: ValueParserParams) => params.newValue,
            cellRenderer: getCellRenderer(type, definitions),
            ...colDefinitions?.[header],
          };
        }
      );

      const extraColDefs = Object.entries(colDefinitions || {})
        .filter(([key]) => !headersFromMeta.has(key))
        .map(([key, val]) => ({
          field: key,
          ...val,
        }));

      const actionColDef = getActionCellDef();

      return [...colDefs, ...extraColDefs, ...actionColDef];
    };

    const fetchHeadersFromNetwork = useCallback(async () => {
      try {
        const response = await options({ contentType: table });
        if (!response.status) return [];

        const headerMeta: Record<string, HeaderMetaProps> =
          response.data.actions?.POST;

        headerMetaRef.current = headerMeta;
        return getColDefsFromHeaderMeta(headerMeta);
      } catch (error) {
        console.error("Error fetching column definitions:", error);
        return [];
      }
    }, [options, table]);

    const fetchHeadersFromLocal = useCallback(() => {
      function isHeaderMetaProps(obj: any): obj is HeaderMetaProps {
        return "children" in obj || "child" in obj;
      }
      if (isHeaderMetaProps(headerMeta))
        return getColDefsFromHeaderMeta(
          headerMeta.children || headerMeta.child?.children || {}
        );
      else {
        return getColDefsFromHeaderMeta(headerMeta || {});
      }
    }, [headerMeta]);

    const fetchHeaders = useCallback(async () => {
      if (headerMeta) {
        return fetchHeadersFromLocal();
      } else {
        return fetchHeadersFromNetwork();
      }
    }, [fetchHeadersFromLocal, fetchHeadersFromNetwork, headerMeta]);

    const createDatasource = () => ({ getRows: fetchData });

    const defaultColDef = useMemo<ColDef>(() => {
      return { editable: true, filter: "agTextColumnFilter", flex: 1 };
    }, []);

    const autoSizeStrategy = useMemo<SizeColumnsToContentStrategy>(() => {
      return {
        type: "fitCellContents",
      };
    }, []);

    const datasource = useMemo(() => ({ getRows: fetchData }), [fetchData]);

    const onGridReady = useCallback(
      async (params: GridReadyEvent) => {
        // const headers = await fetchHeaders();
        // setColumnDefs(headers);
        const datasource = createDatasource();
        params.api.setGridOption("serverSideDatasource", datasource);
      },
      [datasource, fetchHeaders]
    );

    const getRowId = useCallback(
      (params: GetRowIdParams) => `${params.data.pk || params.data.id}`,
      []
    );

    useEffect(() => {
      const loadHeaders = async () => {
        const headers = await fetchHeaders();
        setColumnDefs(headers);
      };
      loadHeaders();
    }, [fetchHeaders]);

    return (
      <View className="flex-1 h-full">
        {/* <Pressable onPress={AddData}>
          <Text>Add</Text>
        </Pressable> */}
        <AgGridReact
          ref={gridRef}
          rowModelType="serverSide"
          editType="fullRow"
          columnDefs={columnDefs}
          onGridReady={onGridReady}
          defaultColDef={defaultColDef}
          autoSizeStrategy={autoSizeStrategy}
          getRowId={getRowId}
          suppressClickEdit={true}
          pagination
          paginationPageSize={PAGE_SIZE}
          debug
          onRowEditingStarted={handleRowEditingStarted}
          onRowEditingStopped={handleRowEditingStopped}
          {...props}
        />
      </View>
    );
  }
);

export default Table;
