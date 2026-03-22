import dayjs from "dayjs";
import type { HeaderMetaProps, FieldType } from "../interface";
import type { ComputedColumn, NativeColDefinition } from "./types";

const DEFAULT_COL_WIDTH = 120;
const DEFAULT_FLEX_MIN_WIDTH = 50;

export function isHeaderMetaProps(
  meta: HeaderMetaProps | Record<string, HeaderMetaProps>,
): meta is HeaderMetaProps {
  return "type" in meta && typeof meta.type === "string";
}

export function normalizeHeaderMeta(
  meta: HeaderMetaProps | Record<string, HeaderMetaProps> | undefined,
): Record<string, HeaderMetaProps> {
  if (!meta) return {};
  if (isHeaderMetaProps(meta)) {
    if (meta.children) return meta.children;
    if (meta.child?.children) return meta.child.children;
    return {};
  }
  return meta;
}

export function formatValue(value: any, fieldMeta?: HeaderMetaProps): string {
  if (value === null || value === undefined) return "";
  if (!fieldMeta) return String(value);

  const type = fieldMeta.type as FieldType;

  switch (type) {
    case "date": {
      const d = dayjs(value);
      return d.isValid() ? d.format("YYYY-MM-DD") : String(value);
    }
    case "datetime": {
      const d = dayjs(value);
      return d.isValid() ? d.format("YYYY-MM-DD HH:mm") : String(value);
    }
    case "choice": {
      const match = fieldMeta.choices?.find((c) => c.value === String(value));
      return match ? match.label : String(value);
    }
    case "nested object":
    case "field": {
      if (typeof value === "object" && value !== null) {
        if (Array.isArray(value)) return `(${value.length})`;
        const keys = fieldMeta.display_fields ?? ["id"];
        return keys
          .map((k) => value[k])
          .filter((v) => v != null)
          .join(", ");
      }
      return String(value);
    }
    case "boolean":
      return value ? "✓" : "✗";
    default:
      return String(value);
  }
}

export function buildColumns(
  meta: Record<string, HeaderMetaProps>,
  colDefinitions: Record<string, NativeColDefinition> | undefined,
  hideWriteOnly: boolean,
  columnOrder: string[] | undefined,
): ComputedColumn[] {
  const processed = new Set<string>();

  const metaCols: ComputedColumn[] = Object.entries(meta)
    .filter(([key, fieldMeta]) => {
      if (colDefinitions?.[key]?.skip) return false;
      if (colDefinitions?.[key]?.hide) return false;
      if (hideWriteOnly && fieldMeta.write_only) return false;
      return true;
    })
    .map(([field, fieldMeta]) => {
      processed.add(field);
      const custom = colDefinitions?.[field] ?? {};
      return {
        field,
        headerName: custom.headerName ?? fieldMeta.label,
        width: custom.width ?? custom.minWidth ?? DEFAULT_COL_WIDTH,
        sortable: custom.sortable !== false,
        pinned: custom.pinned,
        flex: custom.flex,
        minWidth: custom.minWidth,
        maxWidth: custom.maxWidth,
        cellRenderer: custom.cellRenderer,
        renderCell: custom.renderCell,
        valueGetter: custom.valueGetter,
        valueFormatter: custom.valueFormatter,
        fieldMeta,
      };
    });

  const extraCols: ComputedColumn[] = Object.entries(colDefinitions ?? {})
    .filter(([key, def]) => !processed.has(key) && !def?.skip && !def?.hide)
    .map(([field, def]) => ({
      field,
      headerName: def.headerName ?? field,
      width: def.width ?? def.minWidth ?? DEFAULT_COL_WIDTH,
      sortable: def.sortable !== false,
      pinned: def.pinned,
      flex: def.flex,
      minWidth: def.minWidth,
      maxWidth: def.maxWidth,
      cellRenderer: def.cellRenderer,
      renderCell: def.renderCell,
      valueGetter: def.valueGetter,
      valueFormatter: def.valueFormatter,
    }));

  let all = [...metaCols, ...extraCols];

  // Apply columnOrder before pinning reorder
  if (columnOrder && columnOrder.length > 0) {
    const ordered: ComputedColumn[] = [];
    const map = new Map(all.map((c) => [c.field, c]));
    columnOrder.forEach((f) => {
      const col = map.get(f);
      if (col) { ordered.push(col); map.delete(f); }
    });
    map.forEach((col) => ordered.push(col));
    all = ordered;
  }

  // Reorder to mirror AgGrid layout: pinned-left → center → pinned-right
  const pinnedLeft = all.filter((c) => c.pinned === "left");
  const center = all.filter((c) => !c.pinned);
  const pinnedRight = all.filter((c) => c.pinned === "right");
  return [...pinnedLeft, ...center, ...pinnedRight];
}

/* ═══════════════════════════════════════════════════════════════════════════
   FLEX SIZING  (mirrors ag-grid ColumnFlexService)
   ═══════════════════════════════════════════════════════════════════════════

   Algorithm (matches ag-grid's multi-pass violation handling):
   1. Separate flex columns from fixed columns.
   2. Fixed total = sum of fixed column widths.
   3. Remaining = availableWidth − fixedTotal.
   4. Distribute remaining among flex columns proportionally.
   5. Clamp each to [minWidth, maxWidth].  Violations are "frozen" at their
      clamped size and the remaining space is redistributed among the rest
      (up to 3 redistribution passes — same as ag-grid).
   6. Rounding correction: add any leftover pixel(s) to the last active flex
      column so columns fill the container exactly.
   ═══════════════════════════════════════════════════════════════════════════ */

type FlexItem = {
  col: ComputedColumn;
  targetWidth: number;
  /** Frozen = clamped to min/max; excluded from further redistribution */
  frozen: boolean;
};

/**
 * Returns a new column array with pixel widths computed for flex columns.
 * Fixed-width columns are returned unchanged.
 *
 * @param columns   Center columns (no pinned columns — they are always fixed).
 * @param availableWidth  Pixel width available for the center section.
 */
export function applyFlexWidths(
  columns: ComputedColumn[],
  availableWidth: number,
): ComputedColumn[] {
  const flexCols = columns.filter((c) => (c.flex ?? 0) > 0);
  if (flexCols.length === 0 || availableWidth <= 0) return columns;

  const fixedWidth = columns
    .filter((c) => !c.flex)
    .reduce((sum, c) => sum + c.width, 0);

  const remaining = Math.max(0, availableWidth - fixedWidth);
  const totalFlex = flexCols.reduce((sum, c) => sum + c.flex!, 0);
  if (totalFlex === 0) return columns;

  // Initial distribution
  let items: FlexItem[] = flexCols.map((col) => ({
    col,
    targetWidth: Math.round((col.flex! / totalFlex) * remaining),
    frozen: false,
  }));

  // Up to 3 redistribution passes for min/max violations (mirrors ag-grid)
  for (let pass = 0; pass < 3; pass++) {
    let frozenWidth = 0;
    let activeFlex = 0;

    for (const item of items) {
      if (item.frozen) {
        frozenWidth += item.targetWidth;
      } else {
        activeFlex += item.col.flex!;
      }
    }

    const activeRemaining = remaining - frozenWidth;
    if (activeFlex === 0) break;

    let hasViolation = false;
    items = items.map((item) => {
      if (item.frozen) return item;
      const target = Math.round((item.col.flex! / activeFlex) * activeRemaining);
      const minW = item.col.minWidth ?? DEFAULT_FLEX_MIN_WIDTH;
      const maxW = item.col.maxWidth;

      if (target < minW) {
        hasViolation = true;
        return { ...item, targetWidth: minW, frozen: true };
      }
      if (maxW != null && target > maxW) {
        hasViolation = true;
        return { ...item, targetWidth: maxW, frozen: true };
      }
      return { ...item, targetWidth: target };
    });

    if (!hasViolation) break;
  }

  // Rounding correction — prevent sub-pixel gaps at the right edge
  const activeItems = items.filter((i) => !i.frozen);
  if (activeItems.length > 0) {
    const distributed = items.reduce((s, i) => s + i.targetWidth, 0);
    const diff = remaining - distributed;
    const last = activeItems[activeItems.length - 1];
    const corrected = last.targetWidth + diff;
    const minW = last.col.minWidth ?? DEFAULT_FLEX_MIN_WIDTH;
    last.targetWidth = Math.max(minW, corrected);
  }

  // Build result map for O(1) lookup
  const widthMap = new Map<string, number>(
    items.map((i) => [i.col.field, i.targetWidth]),
  );

  return columns.map((col) => {
    const newWidth = widthMap.get(col.field);
    return newWidth != null ? { ...col, width: newWidth } : col;
  });
}

export function getRowKey(row: Record<string, any>, fallback: number): string {
  const id = row.pk ?? row.id;
  return id != null ? String(id) : `__row_${fallback}`;
}

/**
 * Resolves the raw cell value — mirrors ag-grid ValueService.resolveValue.
 *
 * Pipeline:
 *   valueGetter(params)  → raw value   (when defined)
 *   row[col.field]       → raw value   (fallback)
 */
export function resolveValue(
  col: ComputedColumn,
  row: Record<string, any>,
  context?: Record<string, any>,
): any {
  if (col.valueGetter) {
    return col.valueGetter({ data: row, context });
  }
  return row[col.field];
}

/**
 * Formats a resolved value to a display string —
 * mirrors ag-grid ValueService.formatValue.
 *
 * Pipeline:
 *   valueFormatter(params)  → display string  (when defined)
 *   formatValue(value, meta) → display string  (fallback)
 */
export function formatCellValue(
  col: ComputedColumn,
  value: any,
  row: Record<string, any>,
  context?: Record<string, any>,
): string {
  if (col.valueFormatter) {
    return col.valueFormatter({ value, data: row, context });
  }
  return formatValue(value, col.fieldMeta);
}
