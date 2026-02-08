import {
  FilterModel,
  AdvancedFilterModel,
  ValueFormatterParams,
  SortModelItem,
  ColDef,
  ColGroupDef,
  GridApi,
  RowPinnedType,
} from "ag-grid-community";
import dayjs from "dayjs";
import type {
  FilterType,
  AgFilterType,
  AgGridFilterModel,
  FieldType,
} from "./interface";

/* ═══════════════════════════════════════════════════════════════════════════
   TYPE MAPPERS
   ═══════════════════════════════════════════════════════════════════════════ */

/** Maps field types to AG Grid filter components */
const AG_FILTER_MAP: Record<string, string | false> = {
  integer: "agNumberColumnFilter",
  float: "agNumberColumnFilter",
  double: "agNumberColumnFilter",
  decimal: "agNumberColumnFilter",
  date: "agDateColumnFilter",
  datetime: "agDateColumnFilter",
  string: "agTextColumnFilter",
  choice: "agSetColumnFilter",
  boolean: "agSetColumnFilter",
};

/** Maps Django filter operations to AG Grid filter types */
const DJANGO_TO_AG_FILTER: Record<FilterType, AgFilterType> = {
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

/** Reverse mapping: AG Grid filter types to Django operations */
const AG_TO_DJANGO_FILTER = Object.entries(DJANGO_TO_AG_FILTER).reduce(
  (acc, [django, ag]) => {
    acc[ag as AgFilterType] = django as FilterType;
    return acc;
  },
  {} as Record<AgFilterType, FilterType>
);

/** Maps field types to AG Grid cell data types */
const CELL_DATA_TYPE_MAP: Record<string, string> = {
  integer: "number",
  float: "number",
  double: "number",
  decimal: "number",
  date: "date",
  datetime: "date",
  string: "text",
  choice: "object",
  "nested object": "object",
  field: "object",
};

/** Maps field types to AG Grid cell editors */
const CELL_EDITOR_MAP: Record<string, string> = {
  string: "agTextCellEditor",
  text: "agTextCellEditor",
  integer: "agNumberCellEditor",
  float: "agNumberCellEditor",
  double: "agNumberCellEditor",
  decimal: "agNumberCellEditor",
  date: "agDateCellEditor",
  datetime: "agDateCellEditor",
  choice: "agSelectCellEditor",
};

/* ═══════════════════════════════════════════════════════════════════════════
   COLUMN UTILITIES
   ═══════════════════════════════════════════════════════════════════════════ */

/** Get AG Grid filter component for a field type */
function getAgFilterType(
  type: string,
  operations: FilterType[]
): string | false {
  if (operations.length === 0 && type !== "nested object" && type !== "field") {
    return false;
  }
  return AG_FILTER_MAP[type] ?? false;
}

/** Build filter params from supported operations */
function getFilterParams(operations: FilterType[]) {
  return {
    filterOptions: operations.map((op) => DJANGO_TO_AG_FILTER[op]),
    caseSensitive: false,
    debounceMs: 800,
    trimInput: true,
    maxNumConditions: 1,
    buttons: ["apply", "reset"] as const,
    closeOnApply: true,
  };
}

/** Get AG Grid cell data type for a field */
function getCellDataType(type: string): string | true {
  return CELL_DATA_TYPE_MAP[type] ?? true;
}

/** Get AG Grid cell editor for a field */
function getCellEditor(type: string): string {
  return CELL_EDITOR_MAP[type] ?? "agTextCellEditor";
}

/** Build value formatter for displaying field data */
function getValueFormatter(
  type: string,
  displayFields: string[] = ["id"],
  choices?: { value: string; label: string }[]
): (params: ValueFormatterParams) => string {
  const objectTypes = ["nested object", "field"];

  // Handle choice type: map value to label
  if (type === "choice" && choices && choices.length > 0) {
    return ({ value }: ValueFormatterParams) => {
      if (value === undefined || value === null) return "";
      const choice = choices.find((c) => c.value === value);
      return choice ? choice.label : String(value);
    };
  }

  if (objectTypes.includes(type)) {
    return ({ value }: ValueFormatterParams) => {
      if (!value || typeof value !== "object") return "";
      return displayFields
        .map((key) => value[key])
        .filter((v) => v !== undefined && v !== null)
        .join(", ");
    };
  }

  return ({ value }: ValueFormatterParams) => {
    return value !== undefined && value !== null ? String(value) : "";
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   FILTER CONVERSION
   ═══════════════════════════════════════════════════════════════════════════ */

/** Extract filter value from AG Grid filter model */
function extractFilterValue(item: FilterModel): string | boolean | null {
  const cleanJoin = (values: (string | number | null | undefined)[]) =>
    values.filter((v) => v != null).join(",");

  if (item.type === "blank" || item.type === "notBlank") {
    return true;
  }

  switch (item.filterType) {
    case "text":
    case "number":
      if (item.type === "inRange") {
        return cleanJoin([item.filter, item.filterTo]);
      }
      return item.filter != null ? String(item.filter) : null;

    case "date": {
      const parseDate = (d: string | undefined | null) =>
        d ? dayjs(d).format("YYYY-MM-DD") : null;

      if (item.type === "inRange") {
        return cleanJoin([parseDate(item.dateFrom), parseDate(item.dateTo)]);
      }
      return parseDate(item.dateFrom ?? item.filter ?? null);
    }

    case "set":
    case "object":
      if ("values" in item && Array.isArray(item.values)) {
        return cleanJoin(item.values);
      }
      return null;

    default:
      return null;
  }
}

/** Convert single AG Grid filter to Django query param */
function convertSingleFilter(
  key: string,
  item: FilterModel
): Record<string, string | boolean> | null {
  const agType = item.type as AgFilterType;
  const djangoType = AG_TO_DJANGO_FILTER[agType];

  if (!djangoType) {
    return null;
  }

  const value = extractFilterValue(item);
  if (value == null) {
    return null;
  }

  const filterKey = djangoType === "iexact" ? key : `${key}__${djangoType}`;
  return { [filterKey]: value };
}

/** Convert simple AG Grid filter model to Django params */
function convertSimpleFilters(
  filterModel: AgGridFilterModel
): Record<string, string> {
  return Object.entries(filterModel).reduce(
    (params, [field, item]) => {
      const mapped = convertSingleFilter(field, item);
      if (mapped) {
        Object.assign(params, mapped);
      }
      return params;
    },
    {} as Record<string, string>
  );
}

/** Parse advanced filter model recursively */
function parseAdvancedFilter(
  model: AdvancedFilterModel
): Record<string, string> {
  const result: Record<string, string> = {};

  if (model.filterType === "join") {
    for (const sub of model.conditions) {
      Object.assign(result, parseAdvancedFilter(sub));
    }
  } else if ("columnId" in model) {
    const field = model.columnId;
    const agType = model.type as AgFilterType;

    if (agType === "blank" || agType === "notBlank") {
      const djangoType = AG_TO_DJANGO_FILTER[agType];
      result[`${field}__${djangoType}`] = "true";
    } else if ("filter" in model) {
      const djangoType = AG_TO_DJANGO_FILTER[agType];
      if (djangoType) {
        const key =
          djangoType === "iexact" ? field : `${field}__${djangoType}`;
        result[key] = String(model.filter);
      }
    }
  }

  return result;
}

/** Type guard for simple filter model */
function isSimpleFilterModel(
  model: FilterModel | AdvancedFilterModel
): model is AgGridFilterModel {
  return model && typeof model === "object" && !("filterType" in model);
}

/** Type guard for advanced filter model */
function isAdvancedFilterModel(
  model: FilterModel | AdvancedFilterModel
): model is AdvancedFilterModel {
  return model && typeof model === "object" && "filterType" in model;
}

/** Convert any AG Grid filter model to Django query params */
function convertAgGridFilterToDjangoParams(
  model: FilterModel | AdvancedFilterModel | null
): Record<string, string> {
  if (!model) {
    return {};
  }
  if (isSimpleFilterModel(model)) {
    return convertSimpleFilters(model);
  }
  if (isAdvancedFilterModel(model)) {
    return parseAdvancedFilter(model);
  }
  return {};
}

/** Convert AG Grid sort model to Django ordering param */
function convertAgGridSorterToDjangoParams(
  sortModel: SortModelItem[]
): Record<string, string> {
  const ordering = sortModel
    .map(({ colId, sort }) => (sort === "asc" ? colId : `-${colId}`))
    .join(",");

  return ordering ? { ordering } : {};
}

/* ═══════════════════════════════════════════════════════════════════════════
   GRID UTILITIES
   ═══════════════════════════════════════════════════════════════════════════ */

/** Type guard for ColDef */
function isColDef(
  col: ColDef<any, any> | ColGroupDef<any>
): col is ColDef<any, any> {
  return !("children" in col);
}

/** Focus and start editing the first editable cell in a row */
function focusFirstEditableCol(
  api: GridApi,
  rowIndex: number,
  rowPinned?: RowPinnedType
) {
  const columnDefs = api.getColumnDefs() ?? [];
  const editableCol = columnDefs.find(
    (col) => isColDef(col) && col.editable !== false && !!col.field
  );

  if (editableCol && isColDef(editableCol) && editableCol.field) {
    api.setFocusedCell(rowIndex, editableCol.field, rowPinned);
    api.startEditingCell({
      rowIndex,
      colKey: editableCol.field,
      rowPinned,
    });
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   EXPORTS
   ═══════════════════════════════════════════════════════════════════════════ */

export {
  // Type mappers (for advanced use cases)
  AG_FILTER_MAP,
  DJANGO_TO_AG_FILTER,
  AG_TO_DJANGO_FILTER,
  CELL_DATA_TYPE_MAP,
  CELL_EDITOR_MAP,
  // Column utilities
  getAgFilterType,
  getFilterParams,
  getCellDataType,
  getCellEditor,
  getValueFormatter,
  // Filter conversion
  convertAgGridFilterToDjangoParams,
  convertAgGridSorterToDjangoParams,
  // Grid utilities
  isColDef,
  focusFirstEditableCol,
};
