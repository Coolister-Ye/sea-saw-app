import type { ReactNode } from "react";
import type { HeaderMetaProps } from "../interface";

/* ═══════════════════════════════════════════════════════════════════════════
   RE-EXPORTS FROM GRID  (core types live in the grid layer)
   ═══════════════════════════════════════════════════════════════════════════ */

export type {
  CellRendererProps,
  ValueGetterParams,
  ValueFormatterParams,
  ComputedColumn,
  RowSelectionConfig,
  ColState,
  SortItem,
  SortState,
} from "@/components/sea-saw-design/grid/types";

/** NativeTable alias for GridColumnGroupDef */
export type {
  GridColumnGroupDef as NativeColumnGroupDef,
} from "@/components/sea-saw-design/grid/types";

/* ═══════════════════════════════════════════════════════════════════════════
   COLUMN DEFINITION  (input format for NativeTable callers)
   ═══════════════════════════════════════════════════════════════════════════ */

import type {
  CellRendererProps,
  ValueGetterParams,
  ValueFormatterParams,
} from "@/components/sea-saw-design/grid/types";

/**
 * Column override keyed by field name — passed to NativeTable's `colDefinitions`
 * prop. NativeTable maps this + OPTIONS metadata → ComputedColumn[] for Grid.
 *
 * Mirrors AgGrid ColDef for API compatibility.
 */
export type NativeColDefinition = {
  /** Remove column from table permanently */
  skip?: boolean;
  /** Hide the column initially */
  hide?: boolean;
  /** Pin column to a fixed side */
  pinned?: "left" | "right";
  /** Override the displayed column header text */
  headerName?: string;
  /** Column width in pixels. Ignored when `flex` is set. */
  width?: number;
  /** Minimum width in pixels (default: 50) */
  minWidth?: number;
  /** Maximum width in pixels */
  maxWidth?: number;
  /**
   * Flex factor for proportional width distribution — mirrors ag-grid `flex`.
   * Takes precedence over `width`.
   */
  flex?: number;
  /**
   * AgGrid-compatible cell renderer — receives `{ value, data, context }`.
   * Takes precedence over `renderCell`, `valueFormatter`, and `valueGetter`.
   */
  cellRenderer?: (props: CellRendererProps) => ReactNode;
  /**
   * Simpler native-only renderer: receives `(value, row)`.
   * Used only when `cellRenderer` is not provided.
   */
  renderCell?: (value: any, row: Record<string, any>, fieldMeta?: HeaderMetaProps) => ReactNode;
  /**
   * Compute a derived cell value from row data — mirrors ag-grid `valueGetter`.
   */
  valueGetter?: (params: ValueGetterParams) => any;
  /**
   * Format the value into a display string — mirrors ag-grid `valueFormatter`.
   */
  valueFormatter?: (params: ValueFormatterParams) => string;
  /** Enable sorting for this column (default: true) */
  sortable?: boolean;
  /** Allow column resize (default: true) */
  resizable?: boolean;
  /** Suppress the ⋮ column menu button (default: false) */
  suppressMenu?: boolean;
  /** Suppress autosize for this column — mirrors ag-grid suppressAutoSize (default: false) */
  suppressAutoSize?: boolean;
};

/* ═══════════════════════════════════════════════════════════════════════════
   COLUMN GROUPS  (NativeTable alias — same shape as GridColumnGroupDef)
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Resolved column group ready for rendering — produced by useColumnModel.
 */
export type ComputedColumnGroup = {
  headerName: string;
  width: number;
  isSpacing: boolean;
  fields: string[];
};

/* ═══════════════════════════════════════════════════════════════════════════
   TABLE PROPS
   ═══════════════════════════════════════════════════════════════════════════ */

import type { GridColumnGroupDef, RowSelectionConfig } from "@/components/sea-saw-design/grid/types";

export type NativeTableProps = {
  /** API endpoint key — maps to Constants.ts */
  table: string;
  /** Custom column overrides keyed by field name */
  colDefinitions?: Record<string, NativeColDefinition>;
  /** Pre-loaded field metadata — skips the OPTIONS call when provided */
  headerMeta?: HeaderMetaProps | Record<string, HeaderMetaProps>;
  /** Hide fields marked write_only in metadata (default: false) */
  hideWriteOnly?: boolean;
  /** Extra query parameters forwarded to the list API on every fetch */
  queryParams?: Record<string, any>;
  /** Explicit column order; unlisted fields follow ordered ones */
  columnOrder?: string[];
  /** Context passed to every `cellRenderer` */
  context?: Record<string, any>;
  /** Show a quick-filter search bar above the table */
  enableQuickFilter?: boolean;
  /**
   * Query parameter name used for quick-filter requests (default: "search").
   * Maps the Grid's internal `_quickFilter` key to this API param name.
   */
  quickFilterParam?: string;
  /** Placeholder text shown in the quick-filter input */
  quickFilterPlaceholder?: string;
  /** Native row tap handler */
  onRowPress?: (row: Record<string, any>) => void;
  /** AgGrid-compatible click handler */
  onRowClicked?: (event: { data: Record<string, any> }) => void;
  /** Row selection configuration */
  rowSelection?: RowSelectionConfig;
  suppressUpdate?: boolean;
  suppressDelete?: boolean;
  onEdit?: (row: Record<string, any>) => void;
  onDeleteSuccess?: (row: Record<string, any>) => void;
  /** Column group definitions */
  columnGroups?: GridColumnGroupDef[];
  theme?: any;
  onGridReady?: any;
};

/* ═══════════════════════════════════════════════════════════════════════════
   IMPERATIVE HANDLE
   ═══════════════════════════════════════════════════════════════════════════ */

import type { ColState } from "@/components/sea-saw-design/grid/types";

/** Imperative handle exposed via forwardRef — mirrors GridRef */
export type NativeTableRef = {
  refresh: () => void;
  getColumnState: () => ColState[];
  setColumnWidth: (field: string, width: number) => void;
  setColumnPinned: (field: string, pinned: "left" | "right" | null) => void;
  hideColumn: (field: string) => void;
  showColumn: (field: string) => void;
  getHiddenColumns: () => string[];
};
