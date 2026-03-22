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
   VALUE GETTER / FORMATTER  (mirrors ag-grid ColDef pattern)
   ═══════════════════════════════════════════════════════════════════════════ */

/** Parameters passed to valueGetter — mirrors ag-grid ValueGetterParams */
export type ValueGetterParams = {
  /** The full row data object */
  data: Record<string, any>;
  /** Context passed to the table via the `context` prop */
  context?: Record<string, any>;
};

/** Parameters passed to valueFormatter — mirrors ag-grid ValueFormatterParams */
export type ValueFormatterParams = {
  /** The raw (or valueGetter-resolved) cell value */
  value: any;
  /** The full row data object */
  data: Record<string, any>;
  /** Context passed to the table via the `context` prop */
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
  /** Column width in pixels. Ignored when `flex` is set. */
  width?: number;
  /** Minimum width in pixels — enforced during flex distribution (default: 50) */
  minWidth?: number;
  /**
   * Maximum width in pixels — enforced during flex distribution.
   * No limit when omitted.
   */
  maxWidth?: number;
  /**
   * Flex factor for proportional width distribution — mirrors ag-grid `flex`.
   *
   * When one or more columns in the center section have `flex` set, the
   * available container width (minus pinned columns) is distributed among
   * them proportionally to their flex values, respecting `minWidth`/`maxWidth`.
   *
   * Columns without `flex` keep their explicit `width`.
   * `flex` takes precedence over `width`.
   *
   * @example
   *   // Two columns share space equally
   *   { flex: 1 }  { flex: 1 }
   *   // First column gets 2× the space of the second
   *   { flex: 2 }  { flex: 1 }
   */
  flex?: number;
  /**
   * AgGrid-compatible cell renderer.
   * Receives `{ value, data, context }` — same signature as AgGrid
   * CustomCellRendererProps so web renderers work without modification.
   * Takes precedence over `renderCell`, `valueFormatter`, and `valueGetter`.
   */
  cellRenderer?: (props: CellRendererProps) => ReactNode;
  /**
   * Simpler native-only renderer: receives `(value, row)`.
   * Used only when `cellRenderer` is not provided.
   * Takes precedence over `valueFormatter` and `valueGetter`.
   */
  renderCell?: (value: any, row: Record<string, any>) => ReactNode;
  /**
   * Compute a derived cell value from row data — mirrors ag-grid `valueGetter`.
   * The returned value is passed to `valueFormatter` (or the default formatter).
   * Evaluated after `cellRenderer`/`renderCell` are checked (those bypass it).
   */
  valueGetter?: (params: ValueGetterParams) => any;
  /**
   * Format the (possibly valueGetter-resolved) value into a display string —
   * mirrors ag-grid `valueFormatter`.
   * Used only when neither `cellRenderer` nor `renderCell` are set.
   */
  valueFormatter?: (params: ValueFormatterParams) => string;
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
   COLUMN STATE  (mirrors ag-grid ColumnState)
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Serialisable snapshot of a single column's current state.
 * Mirrors the subset of ag-grid's `ColumnState` that applies to native.
 *
 * Obtain via `tableRef.current.getColumnState()`.
 */
export type ColState = {
  /** Column field name (maps to `field` / `colId`) */
  colId: string;
  /** Whether the column is hidden */
  hide?: boolean;
  /** Current pixel width (after flex computation) */
  width?: number;
  /** Flex factor, if set */
  flex?: number;
  /** Pinned side, or null if not pinned */
  pinned?: "left" | "right" | null;
  /** Current sort direction, or null if unsorted */
  sort?: "asc" | "desc" | null;
  /**
   * 0-based sort priority index — used to restore multi-sort order.
   * Absent when the column is not sorted.
   */
  sortIndex?: number;
};

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
  /** Pixel width — for flex columns this is set after container layout */
  width: number;
  sortable: boolean;
  /** 'left' | 'right' | undefined */
  pinned?: "left" | "right";
  /** Flex factor — undefined means fixed-width column */
  flex?: number;
  /** Minimum pixel width enforced during flex distribution */
  minWidth?: number;
  /** Maximum pixel width enforced during flex distribution */
  maxWidth?: number;
  cellRenderer?: (props: CellRendererProps) => ReactNode;
  renderCell?: (value: any, row: Record<string, any>) => ReactNode;
  valueGetter?: (params: ValueGetterParams) => any;
  valueFormatter?: (params: ValueFormatterParams) => string;
  fieldMeta?: HeaderMetaProps;
};

/* ═══════════════════════════════════════════════════════════════════════════
   IMPERATIVE HANDLE
   ═══════════════════════════════════════════════════════════════════════════ */

/** Imperative handle exposed via forwardRef */
export type NativeTableRef = {
  /** Force a re-fetch of the current page without resetting pagination/sort */
  refresh: () => void;
  /**
   * Returns a serialisable snapshot of every column's current state —
   * mirrors ag-grid's `api.getColumnState()`.
   *
   * The snapshot captures: colId, hide, width (post-flex), flex, pinned,
   * sort direction, and sort priority index.
   */
  getColumnState: () => ColState[];
};
