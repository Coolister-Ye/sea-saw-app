import type { ReactNode } from "react";
import type { HeaderMetaProps } from "../interface";

/* ═══════════════════════════════════════════════════════════════════════════
   CELL RENDERER
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Mirrors AgGrid CustomCellRendererProps so web cell renderers
 * can be reused on native without changes.
 */
export type CellRendererProps = {
  value: any;
  data: Record<string, any>;
  context?: Record<string, any>;
};

/* ═══════════════════════════════════════════════════════════════════════════
   COLUMN DEFINITION
   ═══════════════════════════════════════════════════════════════════════════ */

export type NativeColDefinition = {
  /** Remove column from table permanently (same semantics as AgGrid skip) */
  skip?: boolean;
  /**
   * Hide the column — matches AgGrid `hide: true`.
   * Column is excluded from rendering but still tracked.
   */
  hide?: boolean;
  /**
   * Pin column to a fixed side — matches AgGrid `pinned: 'left' | 'right'`.
   * Pinned-left columns stay visible while the user scrolls right.
   * Pinned-right columns stay visible while the user scrolls left.
   */
  pinned?: "left" | "right";
  /** Override the displayed column header text */
  headerName?: string;
  /** Column width in pixels (default: 120) */
  width?: number;
  /** Minimum width — used when `width` is not set */
  minWidth?: number;
  /**
   * AgGrid-compatible cell renderer.
   * Receives `{ value, data, context }` — same signature as AgGrid
   * CustomCellRendererProps so web renderers work without modification.
   * Takes precedence over `renderCell`.
   */
  cellRenderer?: (props: CellRendererProps) => ReactNode;
  /**
   * Simpler native-only renderer: receives `(value, row)`.
   * Used only when `cellRenderer` is not provided.
   */
  renderCell?: (value: any, row: Record<string, any>) => ReactNode;
  /** Enable sorting for this column (default: true) */
  sortable?: boolean;
};

/* ═══════════════════════════════════════════════════════════════════════════
   SORT
   ═══════════════════════════════════════════════════════════════════════════ */

/** A single column's sort state */
export type SortItem = { field: string; direction: "asc" | "desc" };

/**
 * Multi-column sort state — an ordered array of SortItems.
 * Index 0 = primary sort, index 1 = secondary, etc.
 * Empty array means no sort applied.
 *
 * Matches AgGrid's `alwaysMultiSort` behaviour:
 *   tap once → asc, tap again → desc, tap third time → remove from sort.
 */
export type SortState = SortItem[];

/* ═══════════════════════════════════════════════════════════════════════════
   TABLE PROPS
   ═══════════════════════════════════════════════════════════════════════════ */

export type RowSelectionConfig = {
  mode: "singleRow" | "multiRow";
};

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
  /**
   * Context passed to every `cellRenderer` — mirrors AgGrid `context`.
   * Typically `{ meta: headerMeta }`.
   */
  context?: Record<string, any>;
  /**
   * Show a quick-filter search bar above the table.
   * The search value is sent to the API as `?{quickFilterParam}=value`.
   * Default: false.
   */
  enableQuickFilter?: boolean;
  /**
   * Query parameter name used for quick-filter requests.
   * Default: "search"
   */
  quickFilterParam?: string;
  /** Placeholder text shown in the quick-filter input */
  quickFilterPlaceholder?: string;
  /** Native row tap handler — receives the full row data object */
  onRowPress?: (row: Record<string, any>) => void;
  /**
   * AgGrid-compatible click handler — receives `{ data: row }`.
   * Both `onRowPress` and `onRowClicked` are called when set.
   */
  onRowClicked?: (event: { data: Record<string, any> }) => void;
  /** Row selection configuration */
  rowSelection?: RowSelectionConfig;
  suppressUpdate?: boolean;
  suppressDelete?: boolean;
  onEdit?: (row: Record<string, any>) => void;
  onDeleteSuccess?: (row: Record<string, any>) => void;
  /** Accepted for API compatibility with web Table; ignored in native */
  theme?: any;
  /** Accepted for API compatibility with web Table; ignored in native */
  onGridReady?: any;
};

/* ═══════════════════════════════════════════════════════════════════════════
   INTERNAL TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

/** Resolved column definition used by rendering components */
export type ComputedColumn = {
  field: string;
  headerName: string;
  width: number;
  sortable: boolean;
  /** 'left' | 'right' | undefined */
  pinned?: "left" | "right";
  cellRenderer?: (props: CellRendererProps) => ReactNode;
  renderCell?: (value: any, row: Record<string, any>) => ReactNode;
  fieldMeta?: HeaderMetaProps;
};

/** Imperative handle exposed via forwardRef */
export type NativeTableRef = {
  refresh: () => void;
};
