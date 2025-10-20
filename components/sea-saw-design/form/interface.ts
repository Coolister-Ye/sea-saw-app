import { ColDef, FilterModel } from "ag-grid-community";
import {
  AgGridReactProps,
  CustomCellEditorProps,
  CustomCellRendererProps,
} from "ag-grid-react";
import { FormProps } from "antd";

// Filter type used in Django query
type FilterType =
  | "iexact"
  | "iexact_ex"
  | "icontains"
  | "icontains_ex"
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

// Props for the Table component
type TableProps = {
  table: string;
  colDefinitions?: Record<string, ColDef>;
  headerMeta?: HeaderMetaProps | Record<string, HeaderMetaProps>;
  suppressUpdate?: boolean;
  suppressDelete?: boolean;
} & AgGridReactProps;

type InputFormProps = {
  table?: string;
  def?: Record<string, HeaderMetaProps>;
  config?: Record<string, any>;
} & FormProps;

// Props for the HeaderMeta component
type HeaderMetaProps = {
  type:
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
    | "field";
  required: boolean;
  display_fields?: string[];
  read_only: boolean;
  label: string;
  help_text?: string;
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

// Props for the ForeignKeyCell component
type ForeignKeyCellProps = {
  dataType: HeaderMetaProps;
  data: Record<string, any> | Array<Record<string, any>> | null | undefined;
  displayContent?: (data: Record<string, any>) => JSX.Element;
  usePopover?: boolean;
};

// Props for the ForeignKeyEitor component
type ForeignKeyEitorProps = CustomCellEditorProps & {
  dataType: HeaderMetaProps;
};

type ForeignKeyInputProps = {
  dataType: HeaderMetaProps;
  field: string;
  id?: string;
  value?: any;
  onChange: (value: any) => void;
  render?: (value: any) => JSX.Element;
};

type ActionCellProps = CustomCellRendererProps & {
  suppressUpdate?: boolean;
  suppressDelete?: boolean;
  table: string;
};

export {
  FilterType,
  AgFilterType,
  AgGridFilterItem,
  AgGridFilterModel,
  TableProps,
  InputFormProps,
  ForeignKeyInputProps,
  HeaderMetaProps,
  ForeignKeyCellProps,
  ForeignKeyEitorProps,
  ActionCellProps,
};
