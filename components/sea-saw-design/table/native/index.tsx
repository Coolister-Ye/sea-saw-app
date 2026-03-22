/**
 * NativeTable — drop-in React Native replacement for the AgGrid Table.
 *
 * Accepts the same core props as the web Table so that wrapper components
 * (OrderTable, PipelineTable, etc.) require minimal changes.
 *
 * ┌─────────────────────────────────────────────────────────┐
 * │  [QuickFilterBar]  (optional, above table)              │
 * ├────────────────┬────────────────────────────────────────┤
 * │  Pinned-left   │  Scrollable header (synced ←→)        │
 * │  header        │                                        │
 * ├────────────────┼────────────────────────────────────────┤
 * │  Pinned-left   │  Scrollable body  (vertical scroll     │
 * │  body (synced  │  with pull-to-refresh)                 │
 * │  vertically ↕) │    └─ horizontal scroll ←→            │
 * │                │         └─ DataRow × n                 │
 * ├────────────────┴────────────────────────────────────────┤
 * │  PaginationBar                                          │
 * └─────────────────────────────────────────────────────────┘
 *
 * Architecture (mirrors ag-grid service separation):
 *   useColumnModel  — column pipeline: meta → sections → flex widths
 *   useScrollSync   — scroll synchronisation across fixed/scrollable panes
 *   useTableData    — data fetching, pagination, multi-sort
 *   TableBody       — row renderer: skeleton | empty | data rows
 */

import React, {
  useCallback,
  useImperativeHandle,
  useMemo,
  forwardRef,
} from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import useDataService from "@/hooks/useDataService";

import { useColumnModel } from "./hooks/useColumnModel";
import { useScrollSync } from "./hooks/useScrollSync";
import { useTableData } from "./hooks/useTableData";
import { useRowSelection } from "./hooks/useRowSelection";
import { HeaderRow, HEADER_HEIGHT } from "./components/HeaderRow";
import { TableBody } from "./components/TableBody";
import { PaginationBar } from "./components/PaginationBar";
import { ErrorState } from "./components/EmptyState";
import { QuickFilterBar } from "./components/QuickFilterBar";

import type { NativeTableProps, NativeTableRef } from "./types";


const NativeTable = forwardRef<NativeTableRef, NativeTableProps>(
  function NativeTable(
    {
      table,
      colDefinitions,
      headerMeta: initialHeaderMeta,
      hideWriteOnly = false,
      queryParams,
      columnOrder,
      context,
      enableQuickFilter = false,
      quickFilterParam = "search",
      quickFilterPlaceholder,
      onRowPress,
      onRowClicked,
      rowSelection,
      /* AgGrid compat props — accepted, silently ignored */
      theme: _theme,
      onGridReady: _onGridReady,
      suppressUpdate: _suppressUpdate,
      suppressDelete: _suppressDelete,
      onDeleteSuccess: _onDeleteSuccess,
    },
    ref,
  ) {
    /* ── ViewSet ── */
    const { getViewSet } = useDataService();
    const viewSet = useMemo(() => getViewSet(table), [getViewSet, table]);

    /* ── Column pipeline (meta → sections → flex) ── */
    const {
      leftCols,
      centerCols,
      rightCols,
      allCols,
      leftWidth,
      rightWidth,
      scrollableWidth,
      hasPinnedLeft,
      hasPinnedRight,
      onContainerLayout,
      isLoading: isMetaLoading,
      error: metaError,
    } = useColumnModel({
      viewSet,
      initialHeaderMeta,
      colDefinitions,
      hideWriteOnly: hideWriteOnly,
      columnOrder,
    });

    /* ── Data pipeline (fetch, pagination, multi-sort) ── */
    const {
      rows,
      total,
      page,
      pageSize,
      sortState,
      isLoading: isDataLoading,
      handleSort,
      refresh,
      handleFirst,
      handlePrev,
      handleNext,
      handleLast,
      handleGoToPage,
      handlePageSizeChange,
      quickFilterInput,
      onQuickFilterChange,
    } = useTableData({
      viewSet,
      queryParams,
      isMetaLoading,
      metaError,
      enableQuickFilter,
      quickFilterParam,
    });

    /* ── Row selection ── */
    const { selectedRowKey, isSelectable, toggleRow } = useRowSelection(rowSelection);

    /* ── Scroll synchronisation ── */
    const {
      headerScrollRef,
      pinnedLeftBodyRef,
      pinnedRightBodyRef,
      verticalScrollRef,
      horizontalScrollRef,
      onVerticalScroll,
      onHorizontalScroll,
    } = useScrollSync();

    /* ── Imperative handle ── */
    useImperativeHandle(
      ref,
      () => ({
        refresh,
        getColumnState: () =>
          allCols.map((col) => {
            const sortIdx = sortState.findIndex((s) => s.field === col.field);
            const isSorted = sortIdx !== -1;
            return {
              colId: col.field,
              width: col.width,
              flex: col.flex,
              pinned: col.pinned ?? null,
              sort: isSorted ? sortState[sortIdx].direction : null,
              sortIndex: isSorted ? sortIdx : undefined,
            };
          }),
      }),
      [refresh, allCols, sortState],
    );

    /* ── Row interaction ── */
    const handleRowPress = useCallback(
      (row: Record<string, any>, key: string) => {
        if (isSelectable) toggleRow(key);
        onRowPress?.(row);
        onRowClicked?.({ data: row });
      },
      [isSelectable, toggleRow, onRowPress, onRowClicked],
    );

    const showSkeleton = isDataLoading && rows.length === 0;

    /* ── Shared TableBody props — avoids repeating the same 6 values three times ── */
    const rowPressHandler =
      isSelectable || onRowPress || onRowClicked ? handleRowPress : undefined;
    const sharedBodyProps = useMemo(
      () => ({
        rows,
        showSkeleton,
        isDataLoading,
        selectedRowKey,
        context,
        onRowPress: rowPressHandler,
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [rows, showSkeleton, isDataLoading, selectedRowKey, context, rowPressHandler],
    );

    /* ══════════════════════════════════════════════════════════════════════
       EARLY RETURNS
       ══════════════════════════════════════════════════════════════════════ */

    if (isMetaLoading) {
      return (
        <View style={styles.centred}>
          <ActivityIndicator size="large" color="#1677ff" />
        </View>
      );
    }

    if (metaError) {
      return <ErrorState message={metaError} />;
    }

    /* ══════════════════════════════════════════════════════════════════════
       RENDER
       ══════════════════════════════════════════════════════════════════════ */

    return (
      <View style={styles.container} onLayout={onContainerLayout}>
        {/* Quick filter bar */}
        {enableQuickFilter && (
          <QuickFilterBar
            value={quickFilterInput}
            onChangeText={onQuickFilterChange}
            placeholder={quickFilterPlaceholder}
          />
        )}

        {/* ── Header row ─────────────────────────────────────────────────── */}
        <View style={styles.headerContainer}>
          {hasPinnedLeft && (
            <View style={[styles.pinnedLeftHeader, { width: leftWidth }]}>
              <HeaderRow
                columns={leftCols}
                sortState={sortState}
                onSort={handleSort}
              />
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
                <HeaderRow
                  columns={centerCols}
                  sortState={sortState}
                  onSort={handleSort}
                />
              </View>
            </ScrollView>
          </View>

          {hasPinnedRight && (
            <View style={[styles.pinnedRightHeader, { width: rightWidth }]}>
              <HeaderRow
                columns={rightCols}
                sortState={sortState}
                onSort={handleSort}
              />
            </View>
          )}
        </View>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <View style={styles.bodyContainer}>
          {hasPinnedLeft && (
            <View style={[styles.pinnedLeftBody, { width: leftWidth }]}>
              <ScrollView
                ref={pinnedLeftBodyRef}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              >
                <TableBody columns={leftCols} showEmptyState={false} {...sharedBodyProps} />
              </ScrollView>
            </View>
          )}

          <ScrollView
            ref={verticalScrollRef}
            style={styles.bodyOuter}
            onScroll={onVerticalScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator
            refreshControl={
              <RefreshControl
                refreshing={isDataLoading && rows.length > 0}
                onRefresh={refresh}
                tintColor="#1677ff"
              />
            }
          >
            <ScrollView
              ref={horizontalScrollRef}
              horizontal
              onScroll={onHorizontalScroll}
              scrollEventThrottle={16}
              showsHorizontalScrollIndicator
              bounces={false}
            >
              <View style={{ width: scrollableWidth }}>
                <TableBody columns={centerCols} {...sharedBodyProps} />
              </View>
            </ScrollView>
          </ScrollView>

          {hasPinnedRight && (
            <View style={[styles.pinnedRightBody, { width: rightWidth }]}>
              <ScrollView
                ref={pinnedRightBodyRef}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              >
                <TableBody columns={rightCols} showEmptyState={false} {...sharedBodyProps} />
              </ScrollView>
            </View>
          )}
        </View>

        {/* ── Pagination ─────────────────────────────────────────────────── */}
        <PaginationBar
          page={page}
          pageSize={pageSize}
          total={total}
          loading={isDataLoading}
          onFirst={handleFirst}
          onPrev={handlePrev}
          onNext={handleNext}
          onLast={handleLast}
          onGoToPage={handleGoToPage}
          onPageSizeChange={handlePageSizeChange}
        />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centred: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  /* ── Header ── */
  headerContainer: {
    flexDirection: "row",
    height: HEADER_HEIGHT,
  },
  pinnedLeftHeader: {
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 2,
    backgroundColor: "#fafafa",
  },
  scrollableHeaderOuter: {
    flex: 1,
    overflow: "hidden",
  },
  pinnedRightHeader: {
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 2,
    backgroundColor: "#fafafa",
  },

  /* ── Body ── */
  bodyContainer: {
    flex: 1,
    flexDirection: "row",
  },
  pinnedLeftBody: {
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1,
    backgroundColor: "#fff",
  },
  pinnedRightBody: {
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1,
    backgroundColor: "#fff",
  },
  bodyOuter: {
    flex: 1,
  },
});

export default NativeTable;
export { NativeTable };
export type { NativeTableProps, NativeTableRef };
export type { NativeColDefinition, CellRendererProps } from "./types";
