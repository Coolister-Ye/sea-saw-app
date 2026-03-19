import dayjs from "dayjs";
import type { HeaderMetaProps, FieldType } from "../interface";
import type { ComputedColumn, NativeColDefinition } from "./types";

const DEFAULT_COL_WIDTH = 120;

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
        cellRenderer: custom.cellRenderer,
        renderCell: custom.renderCell,
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
      cellRenderer: def.cellRenderer,
      renderCell: def.renderCell,
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

export function getRowKey(row: Record<string, any>, fallback: number): string {
  const id = row.pk ?? row.id;
  return id != null ? String(id) : `__row_${fallback}`;
}
