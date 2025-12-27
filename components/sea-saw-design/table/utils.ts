import {
  FilterModel,
  AdvancedFilterModel,
  JoinAdvancedFilterModel,
  ValueFormatterParams,
  SortModelItem,
  GetRowIdParams,
  ColDef,
  ColGroupDef,
  GridApi,
  RowPinnedType,
} from "ag-grid-community";
// import { ForeignKeyFilter } from "./ForeignKeyFilter";
import dayjs from "dayjs";
// import ForeignKeyEditor from "./ForeignKeyEditor";

// Filter type used in Django query
type FilterType =
  | "exact"
  | "iexact"
  | "iexact_ex"
  | "icontains"
  | "icontains_ex"
  | "startswith"
  | "istartswith"
  | "iendswith"
  | "isnull"
  | "isnull_ex"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "range"
  | "in";

// Filter types used by ag-Grid
type AgFilterType =
  | "equals"
  | "notEqual"
  | "contains"
  | "notContains"
  | "startsWith"
  | "endsWith"
  | "blank"
  | "notBlank"
  | "greaterThan"
  | "greaterThanOrEqual"
  | "lessThan"
  | "lessThanOrEqual"
  | "inRange"
  | "within";

// Represents a single ag-Grid filter item
type AgGridFilterItem = {
  filter: string;
  type: AgFilterType;
};

// Represents all filters applied by ag-Grid (simple model)
type AgGridFilterModel = Record<string, FilterModel>;

// Mapping from field types to ag-Grid filter components
const agFilterMap: Record<string, any> = {
  integer: "agNumberColumnFilter",
  float: "agNumberColumnFilter",
  double: "agNumberColumnFilter",
  decimal: "agNumberColumnFilter",
  date: "agDateColumnFilter",
  datetime: "agDateColumnFilter",
  string: "agTextColumnFilter",
  choice: "agSetColumnFilter",
  // ["nested object"]: ForeignKeyFilter,
  // field: ForeignKeyFilter,
};

// Django-to-ag-Grid filter operator mapping
const filterOptionMapper: Record<FilterType, AgFilterType | "within"> = {
  exact: "equals",
  iexact: "equals",
  iexact_ex: "notEqual",
  icontains: "contains",
  icontains_ex: "notContains",
  startswith: "startsWith",
  istartswith: "startsWith",
  iendswith: "endsWith",
  isnull: "blank",
  isnull_ex: "notBlank",
  gt: "greaterThan",
  gte: "greaterThanOrEqual",
  lt: "lessThan",
  lte: "lessThanOrEqual",
  range: "inRange",
  in: "within",
};

const cellDataTypeMapper: Record<string, string> = {
  integer: "number",
  float: "number",
  double: "number",
  decimal: "number",
  date: "date",
  datetime: "date",
  string: "text",
  choice: "object",
  ["nested object"]: "object",
  field: "object",
};

const cellEditorMapper: Record<string, any> = {
  // field: ForeignKeyEditor,
  // ["nested object"]: ForeignKeyEditor,
  text: "agTextCellEditor",
  integer: "agNumberCellEditor",
  float: "agNumberCellEditor",
  double: "agNumberCellEditor",
  decimal: "agNumberCellEditor",
  date: "agDateCellEditor",
  datetime: "agDateCellEditor",
  choice: "agSelectCellEditor",
};

const formEditorMapper: Record<string, any> = {
  // field: ForeignKeyEditor,
  // ["nested object"]: ForeignKeyEditor,
  text: "agTextCellEditor",
  integer: "agNumberCellEditor",
  float: "agNumberCellEditor",
  double: "agNumberCellEditor",
  decimal: "agNumberCellEditor",
  date: "agDateCellEditor",
  datetime: "agDateCellEditor",
  choice: "agSelectCellEditor",
};

// ag-Grid-to-Django filter operator mapping
const filter2paramsMapper: Record<AgFilterType, FilterType> = Object.entries(
  filterOptionMapper
).reduce((acc, [key, value]) => {
  acc[value as AgFilterType] = key as FilterType;
  return acc;
}, {} as Record<AgFilterType, FilterType>);

// Returns the ag-Grid filter component type for a given field type and allowed operations
const getAgFilterType = (
  type: string,
  operations: FilterType[]
): string | false => {
  if (operations.length === 0 && type !== "nested object" && type !== "field")
    return false;
  return agFilterMap[type] || false;
};

// Returns ag-Grid filterParams from a list of supported operations
const getFilterParams = (operations: FilterType[]) => {
  return {
    filterOptions: operations.map((op) => filterOptionMapper[op]),
    caseSensitive: false,
    debounceMs: 1000,
    trimInput: true,
    maxNumConditions: 1,
    buttons: ["apply", "reset"],
    closeOnApply: true,
  };
};

const getCellDataType = (type: string) => {
  return cellDataTypeMapper[type] || true;
};

const getCellEditor = (type: string) => {
  return cellEditorMapper[type] || "agTextCellEditor";
};

const filterValueMapper = (item: FilterModel): string | boolean | null => {
  const cleanJoin = (values: (string | number | null | undefined)[]) =>
    values.filter((v) => v !== null && v !== undefined).join(",");

  if (item.type === "blank" || item.type === "notBlank") return true;

  switch (item.filterType) {
    case "text":
    case "number":
      if (item.type === "inRange") {
        return cleanJoin([item.filter, item.filterTo]);
      }
      return item.filter != null ? String(item.filter) : null;

    case "date":
      const parseDate = (d: string | undefined | null) =>
        d ? dayjs(d).format("YYYY-MM-DD") : null;

      if (item.type === "inRange") {
        return cleanJoin([parseDate(item.dateFrom), parseDate(item.dateTo)]);
      }
      return parseDate(item.dateFrom ?? item.filter ?? null);

    case "set":
      if ("values" in item && Array.isArray(item.values)) {
        return cleanJoin(item.values);
      }
      return null;

    case "object":
      if ("values" in item && Array.isArray(item.values)) {
        return cleanJoin(item.values);
      }
      return null;

    default:
      console.warn("Unsupported filter type in filterValueMapper:", item);
      return null;
  }
};

// Converts a single ag-Grid filter item to a Django query param
const filterMapper = (
  key: string,
  item: FilterModel
): Record<string, string | boolean> | null => {
  const agType = item.type as AgFilterType;
  const filterType = filter2paramsMapper[agType];

  if (!filterType) {
    console.warn("Unknown ag-Grid filter type:", item.type);
    return null;
  }

  const value = filterValueMapper(item);
  if (value == null) {
    console.warn("Empty or unsupported filter value for:", item);
    return null;
  }

  const filterKey = filterType === "iexact" ? key : `${key}__${filterType}`;
  return { [filterKey]: value };
};

// Converts a simple ag-Grid filter model to Django query parameters
const agGridFiltersToDjangoParams = (
  filterModel: AgGridFilterModel
): Record<string, string> => {
  return Object.entries(filterModel).reduce((params, [field, item]) => {
    const mapped = filterMapper(field, item);
    if (mapped) {
      Object.assign(params, mapped);
    }
    return params;
  }, {} as Record<string, string>);
};

// Type guard for simple filter model
const isSimpleFilterModel = (
  model: FilterModel | AdvancedFilterModel
): model is AgGridFilterModel => {
  return model && typeof model === "object" && !("filterType" in model);
};

// Type guard for advanced filter model
const isAdvancedFilterModel = (
  model: FilterModel | AdvancedFilterModel
): model is AdvancedFilterModel => {
  return model && typeof model === "object" && "filterType" in model;
};

const parseAdvancedFilter = (
  model: AdvancedFilterModel
): Record<string, string> => {
  const result: Record<string, string> = {};

  if (model.filterType === "join") {
    for (const sub of model.conditions) {
      const subParams = parseAdvancedFilter(sub);
      Object.assign(result, subParams);
    }
  } else if ("columnId" in model) {
    const field = model.columnId;
    const agType = model.type as AgFilterType;

    // Handle null/blank filters (like "isnull", "notBlank", etc.)
    if (agType === "blank" || agType === "notBlank") {
      const djangoType = filter2paramsMapper[agType];
      const key = `${field}__${djangoType}`;
      result[key] = "true"; // convention for isnull=True in Django
    }

    // Handle filters with values (most common)
    else if ("filter" in model) {
      // Ensure `model.filter` is of type `string` (if it's not, we handle it here)
      const value = model.filter as string; // Add `as string` here to resolve the issue
      const djangoType = filter2paramsMapper[agType];
      if (djangoType) {
        const key = djangoType === "iexact" ? field : `${field}__${djangoType}`;
        result[key as string] = value;
      }
    }

    // You can also add more "range" / "inRange" support here
    else {
      console.warn("Unsupported filter item:", model);
    }
  }

  return result;
};

// Unified converter that handles both simple and advanced filter models
const convertAgGridFilterToDjangoParams = (
  model: FilterModel | AdvancedFilterModel | null
): Record<string, string> => {
  if (!model) {
    return {};
  } else if (isSimpleFilterModel(model)) {
    return agGridFiltersToDjangoParams(model);
  } else if (isAdvancedFilterModel(model)) {
    return parseAdvancedFilter(model);
  }
  return {};
};

const convertAgGridSorterToDjangoParams = (
  sortModel: SortModelItem[]
): Record<string, string> => {
  const ordering = sortModel
    .map(({ colId, sort }) => (sort === "asc" ? colId : `-${colId}`))
    .join(",");

  return ordering ? { ordering } : {};
};

const getValueFormatter = (type: string, displayFields: string[] = ["id"]) => {
  const objectFormatter = ({ value }: ValueFormatterParams) => {
    if (!value || typeof value !== "object") return "";
    return displayFields
      .map((key) => value[key])
      .filter((v) => v !== undefined && v !== null) // 保留 0 等 falsy 有意义的值
      .join(", ");
  };

  const defaultFormatter = (params: ValueFormatterParams) => {
    const value = params.value;
    return value !== undefined && value !== null ? value.toString() : "";
  };

  const objectTypes = ["nested object", "field"];

  return objectTypes.includes(type) ? objectFormatter : defaultFormatter;
};

function isColDef(
  col: ColDef<any, any> | ColGroupDef<any>
): col is ColDef<any, any> {
  return !("children" in col);
}

function focusFirstEditableCol(
  api: GridApi,
  rowIndex: number,
  rowPinned?: RowPinnedType
) {
  const columnDefs = api.getColumnDefs() ?? [];
  const firstEditableCol = columnDefs.find(
    (col) => isColDef(col) && col.editable !== false && !!col.field
  );
  if (firstEditableCol && isColDef(firstEditableCol)) {
    api.setFocusedCell(rowIndex, firstEditableCol.field!, rowPinned);
    api.startEditingCell({
      rowIndex,
      colKey: firstEditableCol.field!,
      rowPinned,
    });
  }
}

export {
  FilterType,
  AgFilterType,
  AgGridFilterItem,
  AgGridFilterModel,
  getAgFilterType,
  getFilterParams,
  getCellDataType,
  getCellEditor,
  getValueFormatter,
  agGridFiltersToDjangoParams,
  convertAgGridFilterToDjangoParams,
  convertAgGridSorterToDjangoParams,
  filterMapper,
  filterOptionMapper,
  filter2paramsMapper,
  focusFirstEditableCol,
  formEditorMapper,
};
