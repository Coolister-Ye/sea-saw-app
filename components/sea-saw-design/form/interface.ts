import { FormProps } from "antd";

// Import for local use
import type { HeaderMetaProps } from "../table/interface";
import { JSX } from "react";

// Re-export shared types from table interface to avoid duplication
export type {
  FilterType,
  AgFilterType,
  AgGridFilterItem,
  AgGridFilterModel,
  FieldType,
  HeaderMetaProps,
  ForeignKeyCellProps,
  ForeignKeyEditorProps,
  ForeignKeyEitorProps,
  ForeignKeyInputProps as BaseForeignKeyInputProps,
  ActionCellProps,
} from "../table/interface";

/* ═══════════════════════════════════════════════════════════════════════════
   FORM-SPECIFIC TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

/** InputForm component props (Ant Design form wrapper) */
type InputFormProps = FormProps & {
  table?: string;
  def?: Record<string, HeaderMetaProps>;
  config?: Record<string, any>;
  form: any;
  /** Hide read_only fields automatically (default: false) */
  hideReadOnly?: boolean;
  /** Show help_text as input placeholder (default: true) */
  showHelpTextAsPlaceholder?: boolean;
  /** Column order for form fields */
  columnOrder?: string[];
};

/** Extended ForeignKeyInput props with render option */
type ForeignKeyInputProps = {
  dataType: HeaderMetaProps;
  field: string;
  id?: string;
  value?: any;
  onChange: (value: any) => void;
  render?: (value: any) => JSX.Element;
};

/** Form definition with field name (read_only normalized to boolean) */
type FormDef = Omit<HeaderMetaProps, "read_only"> & {
  field: string;
  read_only: boolean;
};

/** Display form field configuration */
type DisplayFormConfig = {
  render?: (value: any, record: any) => React.ReactNode;
  skip?: boolean;
  span?: number;
};

export type {
  InputFormProps,
  ForeignKeyInputProps,
  FormDef,
  DisplayFormConfig,
};
