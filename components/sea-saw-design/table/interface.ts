import { ColDef, FilterModel } from "ag-grid-community";
import {
  AgGridReactProps,
  CustomCellEditorProps,
  CustomCellRendererProps,
} from "ag-grid-react";
import { JSX } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   FILTER TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

/** Django REST Framework filter operations */
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

/** AG Grid filter operation types */
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

/** Single AG Grid filter item */
type AgGridFilterItem = {
  filter: string;
  type: AgFilterType;
};

/** AG Grid filter model (all applied filters) */
type AgGridFilterModel = Record<string, FilterModel>;

/* ═══════════════════════════════════════════════════════════════════════════
   FIELD TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

/** Supported field types from Django REST Framework */
type FieldType =
  | "string"
  | "integer"
  | "float"
  | "double"
  | "decimal"
  | "boolean"
  | "date"
  | "datetime"
  | "choice"
  | "nested object"
  | "field"
  | "file upload";

/* ═══════════════════════════════════════════════════════════════════════════
   METADATA TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

/** Field metadata from Django REST Framework OPTIONS response */
type HeaderMetaProps = {
  type: FieldType;
  required: boolean;
  read_only: boolean | string;
  write_only?: boolean;
  label: string;
  help_text?: string;
  display_fields?: string[];
  max_length?: number;
  min_value?: number;
  max_value?: number;
  max_digits?: number;
  decimal_places?: number;
  operations?: FilterType[];
  choices?: { value: string; label: string }[];
  children?: Record<string, HeaderMetaProps>;
  child?: HeaderMetaProps;
};

/* ═══════════════════════════════════════════════════════════════════════════
   COMPONENT PROPS
   ═══════════════════════════════════════════════════════════════════════════ */

/** Extended column definition with skip option */
type ColDefinition = ColDef & { skip?: boolean };

/** Main Table component props */
type TableProps = {
  /** API endpoint key (maps to Constants.ts) */
  table: string;
  /** Custom column definitions override */
  colDefinitions?: Record<string, ColDefinition>;
  /** Pre-loaded header metadata (skips OPTIONS call if provided) */
  headerMeta?: HeaderMetaProps | Record<string, HeaderMetaProps>;
  /** Hide edit button in action column */
  suppressUpdate?: boolean;
  /** Hide delete button in action column */
  suppressDelete?: boolean;
  /** Automatically hide columns marked as write_only in metadata (default: false) */
  hideWriteOnly?: boolean;
  /** Additional query parameters to pass to the API */
  queryParams?: Record<string, any>;
  /** Column order: array of field names specifying display order. Unlisted fields appear last. */
  columnOrder?: string[];
} & AgGridReactProps;

/** InputForm component props */
type InputFormProps = {
  table: string;
  headerMeta?: Record<string, HeaderMetaProps>;
};

/** ForeignKeyCell component props */
type ForeignKeyCellProps = {
  dataType: HeaderMetaProps;
  data: Record<string, any> | Record<string, any>[] | null | undefined;
  displayContent?: (data: Record<string, any>) => JSX.Element;
  usePopover?: boolean;
};

/** ForeignKeyEditor component props */
type ForeignKeyEditorProps = CustomCellEditorProps & {
  dataType: HeaderMetaProps;
};

/** @deprecated Use ForeignKeyEditorProps instead */
type ForeignKeyEitorProps = ForeignKeyEditorProps;

/** ForeignKeyInput component props */
type ForeignKeyInputProps = {
  dataType: HeaderMetaProps;
  field: string;
  id?: string;
  value?: any;
  onChange: (value: any) => void;
};

/** ActionCell component props */
type ActionCellProps = CustomCellRendererProps & {
  suppressUpdate?: boolean;
  suppressDelete?: boolean;
  table: string;
};

/* ═══════════════════════════════════════════════════════════════════════════
   EXPORTS
   ═══════════════════════════════════════════════════════════════════════════ */

export type {
  FilterType,
  AgFilterType,
  AgGridFilterItem,
  AgGridFilterModel,
  FieldType,
  ColDefinition,
  TableProps,
  InputFormProps,
  HeaderMetaProps,
  ForeignKeyCellProps,
  ForeignKeyEditorProps,
  ForeignKeyEitorProps,
  ForeignKeyInputProps,
  ActionCellProps,
};
