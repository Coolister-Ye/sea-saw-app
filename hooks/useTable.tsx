import { useCallback, useEffect, useRef, useReducer } from "react";
import useDataService from "./useDataService";
import { debounce, isEqual } from "lodash";
import { router } from "expo-router";
import {
  deleteLevel,
  flattenData,
  flattenHeaderMeta,
  mergeData,
  unFlattenData,
} from "@/utlis/serializer";
import EllipsisTooltip from "@/components/table/EllipsisTooltip";
import { useLocale } from "@/context/Locale";
import {
  changeToPlural,
  formatCurrency,
  formatPercentage,
} from "@/utlis/commonUtils";
import { ActionCell } from "@/components/table/ActionCell";
import { useToast } from "@/context/Toast";
import { View } from "react-native";

type TableConfigType = {
  table: string;
  tableRef: any;
  defaultColWidth?: number;
  fixedCols?: Partial<Record<"left" | "right", string[]>>;
  colConfig?: Record<string, any>;
  actionConfig?: Record<string, any>;
  ordering?: string;
};

type PaginationProps = {
  page: number;
  page_size: number;
};

type State = {
  paginationModel: PaginationProps;
  columns: any[];
  data: any[];
  flatData: any[];
  dataCount: number;
  editingKey: string;
};

type Action =
  | { type: "SET_PAGINATION_MODEL"; payload: PaginationProps }
  | { type: "SET_COLUMNS"; payload: any[] }
  | { type: "SET_DATA"; payload: any[] }
  | { type: "SET_FLAT_DATA"; payload: any[] }
  | { type: "SET_DATA_COUNT"; payload: number }
  | { type: "SET_EDITING_KEY"; payload: string };

const initialState: State = {
  paginationModel: { page: 1, page_size: 50 },
  columns: [],
  data: [],
  flatData: [],
  dataCount: 0,
  editingKey: "",
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_PAGINATION_MODEL":
      return { ...state, paginationModel: action.payload };
    case "SET_COLUMNS":
      return { ...state, columns: action.payload };
    case "SET_DATA":
      return { ...state, data: action.payload };
    case "SET_FLAT_DATA":
      return { ...state, flatData: action.payload };
    case "SET_DATA_COUNT":
      return { ...state, dataCount: action.payload };
    case "SET_EDITING_KEY":
      return { ...state, editingKey: action.payload };
    default:
      return state;
  }
}

export function useTable({
  table,
  tableRef,
  defaultColWidth = 120,
  fixedCols,
  colConfig = {},
  actionConfig,
  ordering,
}: TableConfigType) {
  const {
    list,
    create,
    update,
    deleteItem,
    options,
    loading,
    error,
    success,
    clearError,
    clearSuccess,
    request,
  } = useDataService();

  const [state, dispatch] = useReducer(reducer, initialState);
  const { locale, i18n } = useLocale();
  const { showToast } = useToast();

  const { paginationModel, columns, data, flatData, dataCount, editingKey } =
    state;

  const NEWKEY = "-1";

  // References for stable access
  const columnsRef = useRef<any>(columns);
  const flatColumnsRef = useRef<any>(null);
  const dataRef = useRef<any>(data);
  const flatDataRef = useRef<any>(flatData);
  const editingKeyRef = useRef<string>(editingKey);
  const filtersRef = useRef<any>(null);

  console.log("columnsRef", columnsRef);
  console.log("dataRef", dataRef);
  console.log("flattenData", flatData);
  console.log("columns", columns);

  /**
   * Assigns a unique key to each item in the data array.
   * The key is generated based on specific properties of the item
   * and then encoded using Base64 or another encryption method.
   *
   * @param data - An array of objects to assign keys to.
   * @returns A new array with keys added to each object.
   */
  const assignKey = (data: any[]) =>
    data.map((item) => {
      // Generate the raw key
      const rawKey = Object.entries(item)
        .filter(([value]) => value.endsWith("pk"))
        .map(([value, key]) => `${value}-${key}`)
        .join(":");

      // Encrypt the key (Base64 encoding used as an example)
      const encryptedKey = btoa(rawKey);

      return {
        ...item,
        key: encryptedKey,
      };
    });

  /**
   * Process columns metadata to create table headers and additional configurations.
   *
   * @param columnsMeta - The metadata for table columns.
   * @returns An array of processed column configurations.
   */
  /**
   * Process columns metadata to create table headers and additional configurations.
   *
   * @param columnsMeta - The metadata for table columns.
   * @returns An array of processed column configurations.
   */
  const processColumns = (
    columnsMeta: any,
    columnPref: Array<{ dataIndex: string; hidden?: boolean }>
  ) => {
    const { headers, splits } = flattenHeaderMeta(columnsMeta);

    const getVariant = (col: any) => {
      return (
        colConfig?.[col.dataIndex]?.variant ||
        col.field_type ||
        (col.type === "choice" && "picklist") ||
        (["datetime", "date"].includes(col.type) ? "datepicker" : undefined)
      );
    };

    const getFormater = (variant: any): any => {
      const formatters: { [key: string]: Function } = {
        currency: formatCurrency,
        percentage: formatPercentage,
      };

      return formatters[variant] || ((val: any) => val);
    };

    const isIdExist = (dataIndex: string) => {
      const prefix = dataIndex.split(".").slice(0, -1).join(".");
      return headers.some(({ dataIndex }) =>
        [`${prefix}.pk`, `${prefix}.id`].includes(dataIndex)
      );
    };

    /**
     * Creates props for cell configuration.
     *
     * @param record - The data record for the row.
     * @param col - Column metadata.
     * @param isEditable - Whether the cell is editable.
     * @param extraProps - Additional properties for customization.
     * @returns Cell configuration object.
     */
    const createOnCell = (record: any, col: any, isEditable: boolean) => ({
      record,
      editable: isEditable,
      dataIndex: col.dataIndex,
      title: col.title,
      required: isIdExist(col.dataIndex) ? col.required : false, // Set required to false, if its id dosen't exist
      // required: col.required,
      rowSpan: record[`${col.dataIndex}.rowSpan`] ?? 1,
      handleSave: isEditable ? handleSave : undefined,
      isRowEditing: editingKeyRef.current === record.key,
      editingKey: editingKeyRef.current,
      options: col.choices,
      variant: col.variant,
      dataType: col.type,
      getOptions: col.getOptions,
    });

    // Sort headers according to columnPref
    const sortedHeaders = columnPref
      .filter((pref) =>
        headers.some((header) => header.dataIndex === pref.dataIndex)
      )
      .map((pref) => {
        const header = headers.find(
          (header) => header.dataIndex === pref.dataIndex
        );
        return header;
      });

    // Filter out columns that are not in columnPref and keep their original order
    const remainingHeaders = headers.filter(
      (header) =>
        !columnPref.some((pref) => pref.dataIndex === header.dataIndex)
    );

    // Concatenate sorted headers and remaining headers (non-preference columns)
    const finalSortedHeaders = [...sortedHeaders, ...remainingHeaders];

    // Process headers with enhanced properties
    const processedHeaders = finalSortedHeaders.map(
      (_col: any, index: number) => {
        const variant = getVariant(_col);
        const formater = getFormater(variant);
        const userConf = columnPref.find(
          (pref) => pref.dataIndex === _col.dataIndex
        );
        const initialConf = colConfig?.[_col.dataIndex] || {};
        // The priority of user setting is higher than that of initial setting
        const extraConf = { ...initialConf, ...userConf };
        const col = { ..._col, ...extraConf, ...{ variant, formater } };
        const fixed = fixedCols?.right?.includes(_col.dataIndex)
          ? "right"
          : fixedCols?.left?.includes(_col.dataIndex)
          ? "left"
          : undefined;

        return {
          ...col,
          id: index,
          label: col.title,
          hidden: false,
          width: defaultColWidth || 100, // Fallback to default width
          fixed: fixed,
          options: col.choices,
          render: (text: string) => (
            <EllipsisTooltip title={text}>
              {text ? formater(text) : ""}
            </EllipsisTooltip>
          ),
          onCell: (record: any) => createOnCell(record, col, !col.read_only),
          ...extraConf,
        };
      }
    );

    // Add action column
    const actionColumn = createActionColumn(splits);

    if (actionColumn === null) {
      return processedHeaders;
    }

    return [...processedHeaders, actionColumn];
  };

  // Action column for edit/delete operations
  const createActionColumn = (splits: any) => {
    const { allowAdd, allowDelete, allowEdit } = actionConfig || {};

    if (allowAdd === false && allowDelete === false && allowEdit === false)
      return null;

    const renderActions = (_: any, record: any) => (
      <ActionCell
        isRowEditing={editingKeyRef.current === record.key}
        record={record}
        addOptions={
          allowAdd === false ? undefined : generateActionOptions(record, splits)
        }
        editingKey={editingKeyRef.current}
        handleSave={handleSave}
        handleCancel={handleCancel}
        handleEdit={() => handleEdit(record)}
        handleDelete={
          allowDelete === false ? undefined : () => handleDelete(record)
        }
      />
    );

    return {
      title: "operation",
      dataIndex: "operation",
      fixed: "right",
      width: defaultColWidth,
      render: renderActions,
    };
  };

  // Generate action options for splitting records
  const generateActionOptions = (record: any, splits: any) => {
    return splits
      .map((value: string) => {
        const path = value.split(".");
        const child = path[path.length - 1];

        const parentId = `${value}.pk`;

        const isParentExist =
          record[parentId] !== null && record[parentId] !== undefined;

        if (!isParentExist) return null;

        return {
          key: value,
          label: i18n.t(child),
          onAction: () => splitRecord(record, value),
        };
      })
      .filter(Boolean);
  };
  // Split a record
  const splitRecord = (record: any, value: string) => {
    const filteredRecord = Object.fromEntries(
      Object.entries(record).filter(([k]) => !k.startsWith(value))
    );

    const newRecord = unFlattenData(
      {
        ...filteredRecord,
        [`${value}.pk`]: NEWKEY,
      },
      columnsRef.current
    );

    const updatedData = dataRef.current.map((item: { pk: any }) =>
      item.pk === newRecord.pk
        ? mergeData(newRecord, item, columnsRef.current)
        : item
    );

    const updatedFlatData = assignKey(
      flattenData(
        updatedData,
        flatColumnsRef.current.map((col: { dataIndex: any }) => col.dataIndex),
        []
      )
    );

    const newKey = updatedFlatData.find(
      (item: any) => item[`${value}.pk`] === NEWKEY
    )?.key;

    editingKeyRef.current = newKey;
    dispatch({ type: "SET_FLAT_DATA", payload: updatedFlatData });
  };

  // Handle CRUD operations
  const handleAdd = () => {
    // 不允许同时编辑多条记录
    if (editingKeyRef.current !== "") {
      showToast(i18n.t("Exit row editing mode first"), "error");
      return;
    }

    editingKeyRef.current = NEWKEY;
    dispatch({
      type: "SET_FLAT_DATA",
      payload: [{ key: NEWKEY }, ...flatData],
    });
    dispatch({ type: "SET_EDITING_KEY", payload: NEWKEY });
    // 滚动到新建Row的位置
    setTimeout(() => {
      tableRef.current.scrollTo({ key: NEWKEY });
    }, 0);
  };

  const handleEdit = (record: any) => {
    editingKeyRef.current = record.key;
    dispatch({ type: "SET_EDITING_KEY", payload: record.key });
  };

  const handleCancel = () => {
    dispatch({ type: "SET_EDITING_KEY", payload: "" });
    editingKeyRef.current = "";
    dispatch({ type: "SET_FLAT_DATA", payload: flatDataRef.current });
  };

  const handleDelete = async (record: any) => {
    const deleteItems: [string, any][] = deleteLevel(
      record,
      columnsRef.current
    );
    await Promise.all(
      deleteItems.map(([item, pk]: [string, any]) => {
        const contentType = item.split(".");
        return deleteItem(
          pk,
          item === "pk" ? table : contentType[contentType.length - 2]
        );
      })
    );
    loadTableData(paginationModel);
  };

  const handleSave = async (prevRecord: any, newRecord: any) => {
    if (isEqual(prevRecord, newRecord)) return handleCancel();
    const unflattenedData = unFlattenData(newRecord, columnsRef.current);

    const response = newRecord.pk
      ? await update(newRecord.pk, table, unflattenedData)
      : await create(table, unflattenedData);

    if (response?.status) {
      loadTableData(paginationModel);
      editingKeyRef.current = "";
    } else if (response?.error?.status === "auth-error") {
      router.navigate("/login");
    } else {
      console.error("Save Error:", response);
    }
  };

  const loadUserPreference = () => {
    // Make the API call to save user column preferences
    const response = request({
      uri: "getUserColPreference",
      method: "GET",
      suffix: `${table}/`,
    });
    return response;
  };

  // Load data and columns
  const loadTableData = async (
    pagination: PaginationProps,
    params?: { [key: string]: any }
  ) => {
    try {
      const [{ data: columnsMeta }, { data: rows }, { data: userPref }] =
        await Promise.all([
          options(table),
          list(table, { ordering: ordering, ...pagination, ...params }),
          loadUserPreference(),
        ]);

      const { column_pref: columnPref } = userPref;
      const processedColumns = processColumns(
        columnsMeta.actions.POST || columnsMeta.actions.OPTIONS,
        columnPref || []
      );
      const processedData = assignKey(
        flattenData(
          rows.results,
          processedColumns.map((col) => col.dataIndex),
          []
        )
      );

      columnsRef.current = columnsMeta.actions.POST;
      dataRef.current = rows.results;
      flatDataRef.current = processedData;
      flatColumnsRef.current = processedColumns;
      filtersRef.current = params;

      dispatch({ type: "SET_COLUMNS", payload: processedColumns });
      dispatch({ type: "SET_FLAT_DATA", payload: processedData });
      dispatch({ type: "SET_DATA", payload: rows.results });
      dispatch({ type: "SET_DATA_COUNT", payload: rows.count });
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const debouncedLoadData = useCallback(debounce(loadTableData, 300), [
    list,
    options,
    table,
  ]);

  // Handle column reordering
  const handleColsRerange = (columns: any) => {
    const processedData = assignKey(
      flattenData(
        dataRef.current,
        flatColumnsRef.current.map((col: { dataIndex: any }) => col.dataIndex),
        []
      )
    );

    flatDataRef.current = processedData;
    // flatColumnsRef.current = columns;

    dispatch({ type: "SET_COLUMNS", payload: columns });
    dispatch({ type: "SET_FLAT_DATA", payload: processedData });
  };

  const handleDownload = async () => {
    const body = {
      model: changeToPlural(table),
      filters: filtersRef.current,
    };
    const downloadTask = await request({
      uri: "crmDownload",
      method: "POST",
      data: body,
    });
    showToast(downloadTask.data.message, "success");
  };

  useEffect(() => {
    debouncedLoadData(paginationModel);
  }, [paginationModel, locale]);

  return {
    flatData,
    data,
    columns,
    dataCount,
    paginationModel,
    setPaginationModel: (pagination: PaginationProps) =>
      dispatch({ type: "SET_PAGINATION_MODEL", payload: pagination }),
    loading,
    error,
    success,
    clearError,
    clearSuccess,
    handleAdd,
    loadTableData,
    handleColsRerange,
    setColumns: (columns: any[]) =>
      dispatch({ type: "SET_COLUMNS", payload: columns }),
    handleDownload,
  };
}
