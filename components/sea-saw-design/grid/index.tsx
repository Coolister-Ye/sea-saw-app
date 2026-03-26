/**
 * Grid — TanStack Table-backed React Native data grid.
 *
 * Architecture:
 *   TanStack Table  → headless state: sorting, pagination, column visibility,
 *                     column pinning, column ordering
 *   useTableMeta    → OPTIONS metadata → ComputedColumn[] (reused from NativeTable)
 *   useGridData     → server-side data: ViewSet or custom IGridDatasource
 *   useColumnWidths → flex width distribution (mirrors ColumnFlexService)
 *   useScrollSync   → scroll synchronisation across pinned/scrollable panes
 *   useRowSelection → Set-based row selection by pk/id (reused from NativeTable)
 *
 * Visual layout (AG Grid Quartz theme):
 *   ┌──────────────────────────────────────────────────┐
 *   │  QuickFilterBar (optional)                       │
 *   ├─────────────┬────────────────────────────────────┤
 *   │ Pinned-left │  Scrollable header (synced ←→)     │
 *   │ header      │                                    │
 *   ├─────────────┼────────────────────────────────────┤
 *   │ Pinned-left │  Scrollable body (vertical scroll) │
 *   │ body (↕ sync)│    └─ horizontal scroll ←→       │
 *   ├─────────────┴────────────────────────────────────┤
 *   │  GridPagination                                  │
 *   └──────────────────────────────────────────────────┘
 */

import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import {
  RefreshControl,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import {
  type PaginationState,
} from "@tanstack/react-table";
import Ionicons from "@expo/vector-icons/Ionicons";
import i18n from "@/locale/i18n";

import { useScrollSync } from "./hooks/useScrollSync";
import { useRowSelection } from "./hooks/useRowSelection";
import { getRowKey } from "./utils";

import { useGridData } from "./hooks/useGridData";
import { useColumnWidths } from "./hooks/useColumnWidths";
import { useGridColumnState } from "./hooks/useGridColumnState";
import { useGridSorting } from "./hooks/useGridSorting";
import { useGridAutosize } from "./hooks/useGridAutosize";
import { GridHeaderCell } from "./components/GridHeaderCell";
import { GridGroupHeaderCell } from "./components/GridGroupHeaderCell";
import { GRID_HEADER_HEIGHT, GRID_GROUP_HEADER_HEIGHT } from "./constants";
import { GridRow } from "./components/GridRow";
import { GridPagination } from "./components/GridPagination";
import { GridColumnMenu } from "./components/GridColumnMenu";
import {
  GridSkeleton,
  GridEmptyState,
  GridErrorState,
  GridCenteredSpinner,
} from "./components/GridEmpty";

import type { GridProps, GridRef, ComputedColumn, GridColumnGroupDef } from "./types";
import { styles } from "./styles";

/* ─────────────────────────────────────────────────────────────────────────
   Constants
   ───────────────────────────────────────────────────────────────────────── */

const DEFAULT_PAGE_SIZE = 50;

/* ═══════════════════════════════════════════════════════════════════════════
   Grid
   ═══════════════════════════════════════════════════════════════════════════ */

export const Grid = forwardRef<GridRef, GridProps>(function Grid(
  {
    columnDefs,
    datasource,
    columnGroups: columnGroupsProp,
    context,
    enableQuickFilter = false,
    quickFilterPlaceholder,
    onRowPress,
    onRowClicked,
    rowSelection: rowSelectionConfig,
    loading = false,
    defaultPageSize = DEFAULT_PAGE_SIZE,
    /* compat props — ignored */
    theme: _theme,
    onGridReady: _onGridReady,
    suppressUpdate: _suppressUpdate,
    suppressDelete: _suppressDelete,
    onDeleteSuccess: _onDeleteSuccess,
  },
  ref,
) {
  /* ── Selection config ───────────────────────────────────────────────── */
  const showCheckboxColumn =
    rowSelectionConfig?.mode === "multiRow" &&
    rowSelectionConfig?.checkboxes !== false;
  const enableSelectAll =
    rowSelectionConfig?.mode === "multiRow" &&
    rowSelectionConfig?.selectAll !== false;

  /* ── Pagination state ───────────────────────────────────────────────── */
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });

  /* ── Sorting ────────────────────────────────────────────────────────── */
  const { sorting, handleSort, setColumnSort } = useGridSorting({ setPagination });

  /* ── Column state ───────────────────────────────────────────────────── */
  const {
    orderedColumns,
    leftCols,
    centerCols,
    rightCols,
    setColumnPinned,
    hideColumn,
    showColumn,
    getHiddenColumns,
    moveColumn,
    menuState,
    openMenu,
    closeMenu,
  } = useGridColumnState({ metaColumns: columnDefs, showCheckboxColumn });

  /* ── Quick filter ───────────────────────────────────────────────────── */
  const [quickFilterInput, setQuickFilterInput] = useState("");
  const [quickFilterDebounced, setQuickFilterDebounced] = useState("");
  const quickFilterTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const onQuickFilterChange = useCallback((text: string) => {
    setQuickFilterInput(text);
    clearTimeout(quickFilterTimer.current);
    quickFilterTimer.current = setTimeout(() => {
      setQuickFilterDebounced(text);
      setPagination((p) => ({ ...p, pageIndex: 0 }));
    }, 400);
  }, []);

  /* ── Column widths (flex distribution) ─────────────────────────────── */
  const {
    getWidth,
    setWidth,
    onContainerLayout,
    scrollableWidth,
    leftSectionWidth,
    rightSectionWidth,
  } = useColumnWidths(leftCols, centerCols, rightCols);

  /* ── Column groups (computed after widths are available) ─────────────── */
  const columnGroupsDef = columnGroupsProp ?? [];
  const hasColumnGroups = columnGroupsDef.length > 0;
  const leftGroups = useMemo(
    () => (hasColumnGroups ? computeColumnGroups(leftCols, columnGroupsDef, getWidth) : []),
    [hasColumnGroups, leftCols, columnGroupsDef, getWidth],
  );
  const centerGroups = useMemo(
    () => (hasColumnGroups ? computeColumnGroups(centerCols, columnGroupsDef, getWidth) : []),
    [hasColumnGroups, centerCols, columnGroupsDef, getWidth],
  );
  const rightGroups = useMemo(
    () => (hasColumnGroups ? computeColumnGroups(rightCols, columnGroupsDef, getWidth) : []),
    [hasColumnGroups, rightCols, columnGroupsDef, getWidth],
  );

  const totalHeaderHeight =
    GRID_HEADER_HEIGHT + (hasColumnGroups ? GRID_GROUP_HEADER_HEIGHT : 0);

  /* ── Data fetching ──────────────────────────────────────────────────── */
  const filterModel = quickFilterDebounced ? { _quickFilter: quickFilterDebounced } : undefined;
  const { rows, total, isLoading, error: dataError, refresh } = useGridData({
    datasource,
    pagination,
    sorting,
    filterModel,
    loading,
  });

  /* ── Row selection ──────────────────────────────────────────────────── */
  const {
    isRowSelected,
    selectedCount,
    isSelectable,
    toggleRow,
    toggleAll,
  } = useRowSelection(rowSelectionConfig);

  /* ── Scroll sync ────────────────────────────────────────────────────── */
  const {
    headerScrollRef,
    pinnedLeftBodyRef,
    pinnedRightBodyRef,
    verticalScrollRef,
    horizontalScrollRef,
    onVerticalScroll,
    onHorizontalScroll,
  } = useScrollSync();

  /* ── Row interaction ────────────────────────────────────────────────── */
  const handleRowPress = useCallback(
    (row: Record<string, any>, key: string) => {
      if (isSelectable) toggleRow(key);
      onRowPress?.(row);
      onRowClicked?.({ data: row });
    },
    [isSelectable, toggleRow, onRowPress, onRowClicked],
  );
  const rowPressHandler =
    isSelectable || onRowPress || onRowClicked ? handleRowPress : undefined;

  /* ── Checkbox header state ──────────────────────────────────────────── */
  const checkboxHeaderState = useMemo<"none" | "some" | "all">(() => {
    if (!showCheckboxColumn || rows.length === 0) return "none";
    const allKeys = rows.map((r, i) => getRowKey(r, i));
    if (selectedCount === 0) return "none";
    if (selectedCount >= allKeys.length) return "all";
    return "some";
  }, [showCheckboxColumn, rows, selectedCount]);

  const handleCheckboxHeaderPress = useCallback(() => {
    if (!enableSelectAll) return;
    const allKeys = rows.map((r, i) => getRowKey(r, i));
    toggleAll(allKeys);
  }, [enableSelectAll, rows, toggleAll]);

  /* ── Effective context (injects __rowSelection) ─────────────────────── */
  const effectiveContext = useMemo(
    () => ({
      ...context,
      ...(showCheckboxColumn
        ? {
            __rowSelection: {
              isRowSelected,
              toggleRow,
              toggleAll,
              allKeys: rows.map((r, i) => getRowKey(r, i)),
            },
          }
        : {}),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [context, showCheckboxColumn, isRowSelected, toggleRow, toggleAll, rows],
  );

  /* ── Imperative handle ──────────────────────────────────────────────── */
  useImperativeHandle(
    ref,
    () => ({
      refresh,
      getColumnState: () =>
        orderedColumns.map((col) => {
          const sortIdx = sorting.findIndex((s) => s.id === col.field);
          const isSorted = sortIdx !== -1;
          return {
            colId: col.field,
            width: getWidth(col.field),
            flex: col.flex,
            pinned: col.pinned ?? null,
            sort: isSorted ? (sorting[sortIdx].desc ? "desc" : "asc") : null,
            sortIndex: isSorted ? sortIdx : undefined,
          };
        }),
      setColumnWidth: setWidth,
      setColumnPinned: setColumnPinned,
      hideColumn,
      showColumn,
      getHiddenColumns,
    }),
    [
      refresh,
      orderedColumns,
      sorting,
      getWidth,
      setWidth,
      setColumnPinned,
      hideColumn,
      showColumn,
      getHiddenColumns,
    ],
  );

  /* ── Menu action handlers ───────────────────────────────────────────── */
  const handleMenuSortAsc = useCallback((f: string) => setColumnSort(f, "asc"), [setColumnSort]);
  const handleMenuSortDesc = useCallback((f: string) => setColumnSort(f, "desc"), [setColumnSort]);
  const handleMenuSortClear = useCallback((f: string) => setColumnSort(f, null), [setColumnSort]);
  const handleMenuPinLeft = useCallback((f: string) => setColumnPinned(f, "left"), [setColumnPinned]);
  const handleMenuPinRight = useCallback((f: string) => setColumnPinned(f, "right"), [setColumnPinned]);
  const handleMenuUnpin = useCallback((f: string) => setColumnPinned(f, null), [setColumnPinned]);
  const handleMenuHide = useCallback((f: string) => hideColumn(f), [hideColumn]);
  const handleMenuMoveLeft = useCallback((f: string) => moveColumn(f, -1), [moveColumn]);
  const handleMenuMoveRight = useCallback((f: string) => moveColumn(f, 1), [moveColumn]);

  /* ── Autosize ────────────────────────────────────────────────────────── */
  const { autosizeColumn, autosizeAllColumns } = useGridAutosize({
    columns: orderedColumns,
    rows,
    setWidth,
  });

  const showSkeleton = isLoading && rows.length === 0;
  const hasPinnedLeft = leftCols.length > 0;
  const hasPinnedRight = rightCols.length > 0;

  /* ════════════════════════════════════════════════════════════════════════
     EARLY RETURNS
     ════════════════════════════════════════════════════════════════════════ */

  if (loading) {
    return <GridCenteredSpinner />;
  }

  /* ════════════════════════════════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════════════════════════════════ */

  return (
    <View style={styles.container} onLayout={onContainerLayout}>
      {/* ── Quick filter ─────────────────────────────────────────────── */}
      {enableQuickFilter && (
        <View style={styles.quickFilterBar}>
          <Ionicons name="search-outline" size={14} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.quickFilterInput}
            value={quickFilterInput}
            onChangeText={onQuickFilterChange}
            placeholder={quickFilterPlaceholder ?? i18n.t("Search...")}
            placeholderTextColor="#9ca3af"
            clearButtonMode="while-editing"
          />
        </View>
      )}

      {/* ── Header ───────────────────────────────────────────────────── */}
      <View style={[styles.headerContainer, { height: totalHeaderHeight }]}>
        {hasPinnedLeft && (
          <View style={[styles.pinnedLeftHeader, { width: leftSectionWidth }]}>
            {hasColumnGroups && (
              <View style={styles.groupHeaderRow}>
                {leftGroups.map((g, i) => (
                  <GridGroupHeaderCell
                    key={i}
                    headerName={g.headerName}
                    width={g.width}
                    isSpacing={g.isSpacing}
                  />
                ))}
              </View>
            )}
            <View style={styles.colHeaderRow}>
              {leftCols.map((col) => (
                <GridHeaderCell
                  key={col.field}
                  col={col}
                  width={getWidth(col.field)}
                  sorting={sorting}
                  onSort={handleSort}
                  onResize={setWidth}
                  onOpenMenu={openMenu}
                  checkboxHeaderState={checkboxHeaderState}
                  onCheckboxHeaderPress={handleCheckboxHeaderPress}
                />
              ))}
            </View>
          </View>
        )}

        <View style={styles.scrollableHeaderOuter}>
          <ScrollView
            ref={headerScrollRef}
            horizontal
            scrollEnabled={false}
            bounces={false}
            showsHorizontalScrollIndicator={false}
          >
            <View style={{ width: scrollableWidth }}>
              {hasColumnGroups && (
                <View style={styles.groupHeaderRow}>
                  {centerGroups.map((g, i) => (
                    <GridGroupHeaderCell
                      key={i}
                      headerName={g.headerName}
                      width={g.width}
                      isSpacing={g.isSpacing}
                    />
                  ))}
                </View>
              )}
              <View style={styles.colHeaderRow}>
                {centerCols.map((col) => (
                  <GridHeaderCell
                    key={col.field}
                    col={col}
                    width={getWidth(col.field)}
                    sorting={sorting}
                    onSort={handleSort}
                    onResize={setWidth}
                    onOpenMenu={openMenu}
                  />
                ))}
              </View>
            </View>
          </ScrollView>
        </View>

        {hasPinnedRight && (
          <View style={[styles.pinnedRightHeader, { width: rightSectionWidth }]}>
            {hasColumnGroups && (
              <View style={styles.groupHeaderRow}>
                {rightGroups.map((g, i) => (
                  <GridGroupHeaderCell
                    key={i}
                    headerName={g.headerName}
                    width={g.width}
                    isSpacing={g.isSpacing}
                  />
                ))}
              </View>
            )}
            <View style={styles.colHeaderRow}>
              {rightCols.map((col) => (
                <GridHeaderCell
                  key={col.field}
                  col={col}
                  width={getWidth(col.field)}
                  sorting={sorting}
                  onSort={handleSort}
                  onResize={setWidth}
                  onOpenMenu={openMenu}
                />
              ))}
            </View>
          </View>
        )}
      </View>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <View style={styles.bodyContainer}>
        {hasPinnedLeft && (
          <View style={[styles.pinnedLeftBody, { width: leftSectionWidth }]}>
            <ScrollView
              ref={pinnedLeftBodyRef}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            >
              {showSkeleton ? (
                <GridSkeleton />
              ) : rows.length === 0 ? null : (
                rows.map((row, idx) => {
                  const rowKey = getRowKey(row, idx);
                  return (
                    <GridRow
                      key={rowKey}
                      row={row}
                      rowKey={rowKey}
                      columns={leftCols}
                      getWidth={getWidth}
                      isEven={idx % 2 === 1}
                      isSelected={isRowSelected(rowKey)}
                      context={effectiveContext}
                      onRowPress={rowPressHandler}
                    />
                  );
                })
              )}
            </ScrollView>
          </View>
        )}

        <ScrollView
          ref={verticalScrollRef}
          style={styles.bodyOuter}
          contentContainerStyle={styles.bodyOuterContent}
          onScroll={onVerticalScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator
          refreshControl={
            <RefreshControl
              refreshing={isLoading && rows.length > 0}
              onRefresh={refresh}
              tintColor="#3b82f6"
            />
          }
        >
          <ScrollView
            ref={horizontalScrollRef}
            horizontal
            style={{ flex: 1 }}
            onScroll={onHorizontalScroll}
            scrollEventThrottle={16}
            showsHorizontalScrollIndicator
            bounces={false}
          >
            <View style={{ width: scrollableWidth }}>
              {showSkeleton ? (
                <GridSkeleton />
              ) : dataError ? (
                <GridErrorState message={dataError} />
              ) : rows.length === 0 ? (
                <GridEmptyState />
              ) : (
                rows.map((row, idx) => {
                  const rowKey = getRowKey(row, idx);
                  return (
                    <GridRow
                      key={rowKey}
                      row={row}
                      rowKey={rowKey}
                      columns={centerCols}
                      getWidth={getWidth}
                      isEven={idx % 2 === 1}
                      isSelected={isRowSelected(rowKey)}
                      context={effectiveContext}
                      onRowPress={rowPressHandler}
                    />
                  );
                })
              )}
            </View>
          </ScrollView>
        </ScrollView>

        {hasPinnedRight && (
          <View style={[styles.pinnedRightBody, { width: rightSectionWidth }]}>
            <ScrollView
              ref={pinnedRightBodyRef}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            >
              {showSkeleton ? (
                <GridSkeleton />
              ) : (
                rows.map((row, idx) => {
                  const rowKey = getRowKey(row, idx);
                  return (
                    <GridRow
                      key={rowKey}
                      row={row}
                      rowKey={rowKey}
                      columns={rightCols}
                      getWidth={getWidth}
                      isEven={idx % 2 === 1}
                      isSelected={isRowSelected(rowKey)}
                      context={effectiveContext}
                      onRowPress={rowPressHandler}
                    />
                  );
                })
              )}
            </ScrollView>
          </View>
        )}
      </View>

      {/* ── Pagination ───────────────────────────────────────────────── */}
      <GridPagination
        pagination={pagination}
        total={total}
        loading={isLoading}
        onPaginationChange={setPagination}
      />

      {/* ── Column menu (modal — rendered last) ─────────────────────── */}
      <GridColumnMenu
        state={menuState}
        sorting={sorting}
        onClose={closeMenu}
        onSortAsc={handleMenuSortAsc}
        onSortDesc={handleMenuSortDesc}
        onSortClear={handleMenuSortClear}
        onPinLeft={handleMenuPinLeft}
        onPinRight={handleMenuPinRight}
        onUnpin={handleMenuUnpin}
        onHide={handleMenuHide}
        onMoveLeft={handleMenuMoveLeft}
        onMoveRight={handleMenuMoveRight}
        onAutosizeColumn={autosizeColumn}
        onAutosizeAllColumns={autosizeAllColumns}
      />
    </View>
  );
});

/* ─────────────────────────────────────────────────────────────────────────
   computeColumnGroups — builds group header spans for a column section.
   Mirrors AG Grid's GroupWidthFeature + padding-group logic.
   ───────────────────────────────────────────────────────────────────────── */

function computeColumnGroups(
  cols: ComputedColumn[],
  groupDefs: { headerName: string; children: string[] }[],
  getWidth: (field: string) => number,
) {
  type GroupEntry = { headerName: string; width: number; isSpacing: boolean; fields: string[] };
  const groups: GroupEntry[] = [];

  for (const col of cols) {
    const def = groupDefs.find((g) => g.children.includes(col.field));
    const w = getWidth(col.field);

    if (!def) {
      // spacing group
      const last = groups[groups.length - 1];
      if (last?.isSpacing) {
        last.width += w;
        last.fields.push(col.field);
      } else {
        groups.push({ headerName: "", width: w, isSpacing: true, fields: [col.field] });
      }
    } else {
      const last = groups[groups.length - 1];
      if (last && last.headerName === def.headerName && !last.isSpacing) {
        last.width += w;
        last.fields.push(col.field);
      } else {
        groups.push({ headerName: def.headerName, width: w, isSpacing: false, fields: [col.field] });
      }
    }
  }

  return groups;
}

/* ─────────────────────────────────────────────────────────────────────────
   Public exports
   ───────────────────────────────────────────────────────────────────────── */

export default Grid;
export type {
  GridProps,
  GridRef,
  IGridDatasource,
  ComputedColumn,
  GridColumnGroupDef,
  RowSelectionConfig,
  ColState,
  SortItem,
  SortState,
  CellRendererProps,
  ValueGetterParams,
  ValueFormatterParams,
} from "./types";
