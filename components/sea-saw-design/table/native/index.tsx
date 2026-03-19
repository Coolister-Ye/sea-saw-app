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
 * Column pinning:
 *   Set `pinned: 'left'` in colDefinitions to keep a column visible
 *   while the user scrolls right.  Matches AgGrid's column pinning API.
 *   The pinned section is rendered as a separate fixed-width flex column;
 *   its vertical scroll is driven programmatically (scrollEnabled: false)
 *   and kept in sync with the main body's vertical scroll.
 *
 * Multi-sort:
 *   Tap a column header to add/toggle it in the sort list.
 *   Multiple columns can be sorted simultaneously (alwaysMultiSort).
 *   Priority numbers appear on each sorted column when >1 are active.
 *
 * Quick filter:
 *   Enable with `enableQuickFilter`. Adds a debounced TextInput that
 *   sends its value to the API as `?{quickFilterParam}=value`.
 *   Default param name: "search".
 *
 * Pull-to-refresh:
 *   Standard RefreshControl on the vertical scroll area.
 *
 * Skeleton loading:
 *   Animated shimmer rows shown during the initial data fetch,
 *   matching AG Grid's loading skeleton overlay behaviour.
 */

import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  forwardRef,
} from "react";
import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import useDataService from "@/hooks/useDataService";

import { useTableMeta } from "./hooks/useTableMeta";
import { useTableData } from "./hooks/useTableData";
import { HeaderRow, HEADER_HEIGHT } from "./components/HeaderRow";
import { DataRow } from "./components/DataRow";
import { PaginationBar } from "./components/PaginationBar";
import { EmptyState, ErrorState } from "./components/EmptyState";
import { SkeletonRows } from "./components/SkeletonRow";
import { QuickFilterBar } from "./components/QuickFilterBar";
import { getRowKey } from "./utils";

import type { ComputedColumn, NativeTableProps, NativeTableRef } from "./types";

/* ─── Debounce delay for the quick-filter input ─────────────────────────── */
const QUICK_FILTER_DEBOUNCE_MS = 400;

/* ═══════════════════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

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

    /* ── Metadata → columns ── */
    const {
      columns,
      isLoading: isMetaLoading,
      error: metaError,
    } = useTableMeta({
      viewSet,
      initialHeaderMeta,
      colDefinitions,
      hideWriteOnly,
      columnOrder,
    });

    /* ── Quick filter state with debounce ── */
    const [quickFilterInput, setQuickFilterInput] = useState("");
    const [debouncedFilter, setDebouncedFilter] = useState("");
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
      undefined,
    );

    const handleQuickFilterChange = useCallback((text: string) => {
      setQuickFilterInput(text);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        setDebouncedFilter(text.trim());
      }, QUICK_FILTER_DEBOUNCE_MS);
    }, []);

    useEffect(
      () => () => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
      },
      [],
    );

    /* ── Merge quick-filter value into queryParams ── */
    const mergedQueryParams = useMemo(() => {
      if (!enableQuickFilter || !debouncedFilter) return queryParams;
      return { ...queryParams, [quickFilterParam]: debouncedFilter };
    }, [queryParams, enableQuickFilter, debouncedFilter, quickFilterParam]);

    /* ── Data fetching ── */
    const {
      rows,
      total,
      page,
      pageSize,
      sortState,
      isLoading: isDataLoading,
      setPage,
      setPageSize,
      handleSort,
      refresh,
    } = useTableData({
      viewSet,
      queryParams: mergedQueryParams,
      isMetaLoading,
      metaError,
    });

    /* ── Row selection ── */
    const [selectedRowKey, setSelectedRowKey] = useState<string | null>(null);
    const isSelectable = !!rowSelection;

    /* ── Split columns: pinned-left | center | pinned-right ── */
    const pinnedLeftCols = useMemo(
      () => columns.filter((c) => c.pinned === "left"),
      [columns],
    );
    const centerCols = useMemo(
      () => columns.filter((c) => !c.pinned),
      [columns],
    );
    const pinnedRightCols = useMemo(
      () => columns.filter((c) => c.pinned === "right"),
      [columns],
    );
    const hasPinnedLeft = pinnedLeftCols.length > 0;
    const hasPinnedRight = pinnedRightCols.length > 0;

    const pinnedLeftWidth = useMemo(
      () => pinnedLeftCols.reduce((s, c) => s + c.width, 0),
      [pinnedLeftCols],
    );
    const pinnedRightWidth = useMemo(
      () => pinnedRightCols.reduce((s, c) => s + c.width, 0),
      [pinnedRightCols],
    );
    const scrollableWidth = useMemo(
      () =>
        Math.max(
          centerCols.reduce((s, c) => s + c.width, 0),
          300,
        ),
      [centerCols],
    );

    /* ── Scroll sync refs ── */
    // Header scrollable section mirrors body horizontal position
    const headerScrollRef = useRef<ScrollView>(null);
    // Pinned-left body mirrors body vertical position
    const pinnedLeftBodyRef = useRef<ScrollView>(null);
    // Pinned-right body mirrors body vertical position
    const pinnedRightBodyRef = useRef<ScrollView>(null);
    // Main body refs
    const verticalScrollRef = useRef<ScrollView>(null);
    const horizontalScrollRef = useRef<ScrollView>(null);

    const onVerticalScroll = useCallback(
      (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const y = e.nativeEvent.contentOffset.y;
        pinnedLeftBodyRef.current?.scrollTo({ y, animated: false });
        pinnedRightBodyRef.current?.scrollTo({ y, animated: false });
      },
      [],
    );

    const onHorizontalScroll = useCallback(
      (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        headerScrollRef.current?.scrollTo({
          x: e.nativeEvent.contentOffset.x,
          animated: false,
        });
      },
      [],
    );

    /* ── Imperative handle ── */
    useImperativeHandle(ref, () => ({ refresh }), [refresh]);

    /* ── Row interaction ── */
    const handleRowPress = useCallback(
      (row: Record<string, any>, key: string) => {
        if (isSelectable) {
          setSelectedRowKey((prev) => (prev === key ? null : key));
        }
        onRowPress?.(row);
        onRowClicked?.({ data: row });
      },
      [isSelectable, onRowPress, onRowClicked],
    );

    /* ── Pagination handlers ── */
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const handleFirst = useCallback(() => setPage(1), [setPage]);
    const handlePrev = useCallback(
      () => setPage(Math.max(1, page - 1)),
      [setPage, page],
    );
    const handleNext = useCallback(() => setPage(page + 1), [setPage, page]);
    const handleLast = useCallback(
      () => setPage(totalPages),
      [setPage, totalPages],
    );
    const handleGoToPage = useCallback(
      (p: number) => setPage(Math.min(Math.max(1, p), totalPages)),
      [setPage, totalPages],
    );
    const handlePageSizeChange = useCallback(
      (size: number) => {
        setPageSize(size);
        setPage(1);
      },
      [setPage, setPageSize],
    );

    /* ── Whether we are in the initial skeleton-loading state ── */
    // Show skeleton on the very first fetch (rows empty + loading)
    const showSkeleton = isDataLoading && rows.length === 0;

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
       HELPERS
       ══════════════════════════════════════════════════════════════════════ */

    /** Render body content (skeleton | empty | rows) for a given column set */
    function renderBodyContent(cols: ComputedColumn[]) {
      if (showSkeleton) {
        return <SkeletonRows columns={cols} />;
      }
      if (!isDataLoading && rows.length === 0) {
        return <EmptyState />;
      }
      return rows.map((row, idx) => {
        const key = getRowKey(row, idx);
        const pressHandler =
          isSelectable || onRowPress || onRowClicked
            ? () => handleRowPress(row, key)
            : undefined;
        return (
          <DataRow
            key={key}
            row={row}
            columns={cols}
            isEven={idx % 2 === 0}
            isSelected={selectedRowKey === key}
            context={context}
            onPress={pressHandler}
          />
        );
      });
    }

    /* ══════════════════════════════════════════════════════════════════════
       RENDER
       ══════════════════════════════════════════════════════════════════════ */

    return (
      <View style={styles.container}>
        {/* Quick filter bar */}
        {enableQuickFilter && (
          <QuickFilterBar
            value={quickFilterInput}
            onChangeText={handleQuickFilterChange}
            placeholder={quickFilterPlaceholder}
          />
        )}

        {/* ── Header row ─────────────────────────────────────────────────── */}
        <View style={styles.headerContainer}>
          {/* Pinned-left header */}
          {hasPinnedLeft && (
            <View style={[styles.pinnedLeftHeader, { width: pinnedLeftWidth }]}>
              <HeaderRow
                columns={pinnedLeftCols}
                sortState={sortState}
                onSort={handleSort}
              />
            </View>
          )}

          {/* Scrollable header — driven by body horizontal scroll */}
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

          {/* Pinned-right header */}
          {hasPinnedRight && (
            <View
              style={[styles.pinnedRightHeader, { width: pinnedRightWidth }]}
            >
              <HeaderRow
                columns={pinnedRightCols}
                sortState={sortState}
                onSort={handleSort}
              />
            </View>
          )}
        </View>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <View style={styles.bodyContainer}>
          {/* Pinned-left body — vertical scroll driven by main body */}
          {hasPinnedLeft && (
            <View style={[styles.pinnedLeftBody, { width: pinnedLeftWidth }]}>
              <ScrollView
                ref={pinnedLeftBodyRef}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              >
                {renderBodyContent(pinnedLeftCols)}
              </ScrollView>
            </View>
          )}

          {/* Main scrollable body: vertical outer, horizontal inner */}
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
                {renderBodyContent(centerCols)}
              </View>
            </ScrollView>
          </ScrollView>

          {/* Pinned-right body — vertical scroll driven by main body */}
          {hasPinnedRight && (
            <View style={[styles.pinnedRightBody, { width: pinnedRightWidth }]}>
              <ScrollView
                ref={pinnedRightBodyRef}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              >
                {renderBodyContent(pinnedRightCols)}
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

/* ═══════════════════════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════════════════════ */

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
    // Shadow separating pinned from scrollable
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
    // Drop shadow on the right edge to visually separate from scrollable
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

/* ═══════════════════════════════════════════════════════════════════════════
   EXPORTS
   ═══════════════════════════════════════════════════════════════════════════ */

export default NativeTable;
export { NativeTable };
export type { NativeTableProps, NativeTableRef };
export type { NativeColDefinition, CellRendererProps } from "./types";
