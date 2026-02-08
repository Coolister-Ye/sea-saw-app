import { ReactNode } from "react";

/**
 * Metadata definition for a field
 */
export interface FieldMetaDef {
  label?: string;
  [key: string]: any;
}

/**
 * Column definition with custom render function
 */
export interface ColumnDef {
  render?: (value: any, record?: any) => ReactNode;
  icon?: ReactNode;
  [key: string]: any;
}

/**
 * Props for PopoverCard component
 */
export interface PopoverCardProps {
  /** Icon to display in header */
  headerIcon?: ReactNode;
  /** Title text or custom render for header */
  headerTitle: string | ReactNode;
  /** Data object to display */
  value: Record<string, any>;
  /** Field metadata definitions (optional - if not provided, no fields will be shown) */
  metaDef?: Record<string, FieldMetaDef>;
  /** Order of columns to display (if not provided, shows all fields) */
  columnOrder?: string[];
  /** Custom column definitions with render functions */
  colDef?: Record<string, ColumnDef>;
  /** Custom width class (default: w-[240px]) */
  widthClass?: string;
  /** Custom padding class (default: p-3) */
  paddingClass?: string;
  /** Show header divider (default: true) */
  showDivider?: boolean;
  /** Custom icon background color (default: bg-blue-50) */
  iconBgClass?: string;
  /** Custom icon color/size wrapper class */
  iconClass?: string;
  /** Custom label width class (default: min-w-[60px]) */
  labelWidthClass?: string;
}

/**
 * Props for PopoverHeader component
 */
export interface PopoverHeaderProps {
  /** Icon to display in header */
  headerIcon?: ReactNode;
  /** Title text or custom render for header */
  headerTitle: string | ReactNode;
  /** Custom icon background color (default: bg-blue-50) */
  iconBgClass?: string;
  /** Custom icon color/size wrapper class */
  iconClass?: string;
}

/**
 * Props for PopoverInfoRow component
 */
export interface PopoverInfoRowProps {
  /** Field key */
  fieldKey: string;
  /** Field label */
  label: string;
  /** Field value (supports string, number, ReactNode, etc.) */
  fieldValue: ReactNode;
  /** Icon to display before label */
  icon?: ReactNode;
  /** Custom label width class (default: min-w-[60px]) */
  labelWidthClass?: string;
}
