/**
 * TableBody — renders the row content for one column section.
 *
 * Displays skeleton rows during initial load, an empty state when there
 * is no data, or the actual DataRows.  Mirrors ag-grid's RowRenderer
 * concept: a controller that decides which rows to paint.
 *
 * Used by NativeTable for each of the three column sections
 * (pinned-left, center, pinned-right) with the appropriate column slice.
 * Only the center section should show the EmptyState — pass
 * `showEmptyState={false}` for pinned sections.
 */
import React, { memo } from "react";
import { DataRow } from "./DataRow";
import { EmptyState } from "./EmptyState";
import { SkeletonRows } from "./SkeletonRow";
import { getRowKey } from "../utils";
import type { ComputedColumn } from "../types";

type TableBodyProps = {
  columns: ComputedColumn[];
  rows: Record<string, any>[];
  /** Show animated skeleton placeholder rows (initial load) */
  showSkeleton: boolean;
  /** True while a data fetch is in-flight */
  isDataLoading: boolean;
  /** Key of the currently selected row, or null */
  selectedRowKey: string | null;
  context?: Record<string, any>;
  /**
   * Whether to render <EmptyState> when there are no rows.
   * Set false for pinned sections — the empty state should only appear
   * in the scrollable center body, not in each pinned column pane.
   * Default: true.
   */
  showEmptyState?: boolean;
  /**
   * Stable callback called with (row, rowKey) when a row is tapped.
   * Pass the memoised handleRowPress from the parent orchestrator.
   */
  onRowPress?: (row: Record<string, any>, key: string) => void;
};

export const TableBody = memo(function TableBody({
  columns,
  rows,
  showSkeleton,
  isDataLoading,
  selectedRowKey,
  context,
  showEmptyState = true,
  onRowPress,
}: TableBodyProps) {
  if (showSkeleton) {
    return <SkeletonRows columns={columns} />;
  }
  if (showEmptyState && !isDataLoading && rows.length === 0) {
    return <EmptyState />;
  }
  return (
    <>
      {rows.map((row, idx) => {
        const key = getRowKey(row, idx);
        return (
          <DataRow
            key={key}
            row={row}
            rowKey={key}
            columns={columns}
            isEven={idx % 2 === 0}
            isSelected={selectedRowKey === key}
            context={context}
            onRowPress={onRowPress}
          />
        );
      })}
    </>
  );
});
