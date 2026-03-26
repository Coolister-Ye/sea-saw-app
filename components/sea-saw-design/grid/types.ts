/**
 * Grid types — AG Grid Quartz-style React Native grid backed by TanStack Table.
 *
 * Grid is intentionally generic — it accepts pre-built ComputedColumn[] and an
 * IGridDatasource callback, exactly like AG Grid's columnDefs + serverSideDatasource.
 * Business logic (OPTIONS fetching, ViewSet creation) lives in callers like NativeTable.
 *
 * All core types are defined here. The table/native layer imports from this file,
 * not the other way around.
 */

import type { ReactNode } from "react";
import type { HeaderMetaProps } from "../table/interface";

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
  data: Record<string, any>;
  context?: Record<string, any>;
};

/** Parameters passed to valueFormatter — mirrors ag-grid ValueFormatterParams */
export type ValueFormatterParams = {
  value: any;
  data: Record<string, any>;
  context?: Record<string, any>;
};

/* ═══════════════════════════════════════════════════════════════════════════
   COLUMN DEFINITION  (resolved, ready for rendering)
   ═══════════════════════════════════════════════════════════════════════════ */

/** Resolved column definition used by Grid rendering components */
export type ComputedColumn = {
  field: string;
  headerName: string;
  /** Pixel width — for flex columns this is set after container layout */
  width: number;
  sortable: boolean;
  pinned?: "left" | "right";
  flex?: number;
  minWidth?: number;
  maxWidth?: number;
  /** Whether the column can be resized by the user. Default: true */
  resizable?: boolean;
  /** Suppress the ⋮ column menu button. Default: false */
  suppressMenu?: boolean;
  /** Suppress autosize for this column (e.g. action columns with custom renderers). Default: false */
  suppressAutoSize?: boolean;
  cellRenderer?: (props: CellRendererProps) => ReactNode;
  renderCell?: (value: any, row: Record<string, any>, fieldMeta?: HeaderMetaProps) => ReactNode;
  valueGetter?: (params: ValueGetterParams) => any;
  valueFormatter?: (params: ValueFormatterParams) => string;
  /** Field metadata from backend OPTIONS — used for type-aware value formatting */
  fieldMeta?: HeaderMetaProps;
};

/* ═══════════════════════════════════════════════════════════════════════════
   COLUMN GROUPS  (mirrors ag-grid's column group definition)
   ═══════════════════════════════════════════════════════════════════════════ */

export type GridColumnGroupDef = {
  /** Displayed header text for this group */
  headerName: string;
  /** Field names of columns that belong to this group, in display order */
  children: string[];
};

/* ═══════════════════════════════════════════════════════════════════════════
   SORT
   ═══════════════════════════════════════════════════════════════════════════ */

export type SortItem = { field: string; direction: "asc" | "desc" };
export type SortState = SortItem[];

/* ═══════════════════════════════════════════════════════════════════════════
   COLUMN STATE  (mirrors ag-grid ColumnState)
   ═══════════════════════════════════════════════════════════════════════════ */

export type ColState = {
  colId: string;
  hide?: boolean;
  width?: number;
  flex?: number;
  pinned?: "left" | "right" | null;
  sort?: "asc" | "desc" | null;
  sortIndex?: number;
};

/* ═══════════════════════════════════════════════════════════════════════════
   ROW SELECTION
   ═══════════════════════════════════════════════════════════════════════════ */

export type RowSelectionConfig = {
  mode: "singleRow" | "multiRow";
  /** Show checkbox column (multiRow only). Default: true */
  checkboxes?: boolean;
  /** Show select-all header checkbox (multiRow only). Default: true */
  selectAll?: boolean;
};

/* ═══════════════════════════════════════════════════════════════════════════
   SERVER-SIDE DATASOURCE  (mirrors AG Grid IServerSideDatasource)
   ═══════════════════════════════════════════════════════════════════════════ */

export type GridSortModelItem = {
  colId: string;
  sort: "asc" | "desc";
};

export type GridDatasourceParams = {
  /** 0-based start row index (= pageIndex * pageSize) */
  startRow: number;
  /** Exclusive end row index (= startRow + pageSize) */
  endRow: number;
  sortModel: GridSortModelItem[];
  /**
   * Opaque filter dict passed through from Grid.
   * Grid puts quick-filter text as `{ _quickFilter: string }`.
   * Datasource implementations map keys to actual API params.
   */
  filterModel?: Record<string, any>;
  success(result: { rowData: Record<string, any>[]; rowCount: number }): void;
  fail(): void;
};

export type IGridDatasource = {
  getRows(params: GridDatasourceParams): void;
  /** Optional cleanup when datasource is replaced */
  destroy?(): void;
};

/* ═══════════════════════════════════════════════════════════════════════════
   INTERNAL COLUMN TYPE  (bridges TanStack ColumnDef with ComputedColumn)
   ═══════════════════════════════════════════════════════════════════════════ */

/** TanStack ColumnDef meta — stores our rendering info */
export type GridColumnMeta = {
  computedCol: ComputedColumn;
};

/* ═══════════════════════════════════════════════════════════════════════════
   COLUMN MENU STATE
   ═══════════════════════════════════════════════════════════════════════════ */

export type GridColumnMenuState = {
  visible: boolean;
  field: string;
  headerName: string;
  x: number;
  y: number;
  pinned?: "left" | "right";
  sortable?: boolean;
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
};

/* ═══════════════════════════════════════════════════════════════════════════
   GRID PROPS
   ═══════════════════════════════════════════════════════════════════════════ */

export type GridProps = {
  /**
   * Resolved column definitions — callers (e.g. NativeTable) build these from
   * OPTIONS metadata and pass them in, exactly like AG Grid's `columnDefs` prop.
   */
  columnDefs: ComputedColumn[];

  /**
   * Server-side datasource — mirrors AG Grid's IServerSideDatasource.
   * Called whenever pagination, sorting, or filterModel changes.
   */
  datasource?: IGridDatasource;

  /** Column group header row definitions */
  columnGroups?: GridColumnGroupDef[];
  /** Context passed to every cellRenderer — mirrors AG Grid `context` */
  context?: Record<string, any>;

  /** Show quick-filter search bar above the table */
  enableQuickFilter?: boolean;
  /** Placeholder for the quick-filter input */
  quickFilterPlaceholder?: string;

  /** Row tap handler */
  onRowPress?: (row: Record<string, any>) => void;
  /** AG Grid-compatible click handler */
  onRowClicked?: (event: { data: Record<string, any> }) => void;

  /** Row selection config */
  rowSelection?: RowSelectionConfig;

  /**
   * Block data fetching and show a loading spinner.
   * Callers set this while building columnDefs asynchronously (e.g. OPTIONS fetch).
   */
  loading?: boolean;

  /** Initial page size (default: 50) */
  defaultPageSize?: number;

  /* AG Grid compat props — accepted, silently ignored */
  theme?: any;
  onGridReady?: any;
  suppressUpdate?: boolean;
  suppressDelete?: boolean;
  onDeleteSuccess?: (row: Record<string, any>) => void;
};

/* ═══════════════════════════════════════════════════════════════════════════
   GRID REF  (imperative handle)
   ═══════════════════════════════════════════════════════════════════════════ */

export type GridRef = {
  refresh(): void;
  getColumnState(): ColState[];
  setColumnWidth(field: string, width: number): void;
  setColumnPinned(field: string, pinned: "left" | "right" | null): void;
  hideColumn(field: string): void;
  showColumn(field: string): void;
  getHiddenColumns(): string[];
};
