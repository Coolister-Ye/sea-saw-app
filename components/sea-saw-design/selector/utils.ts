import type { ColDef } from "ag-grid-community";
import type { HeaderMetaProps } from "@/components/sea-saw-design/table/interface";
import type { EntityItem } from "./types";

export const DEFAULT_COL_WIDTH = 120;

export const DEFAULT_COL_DEF: ColDef = {
  sortable: true,
  resizable: true,
  flex: 1,
  minWidth: DEFAULT_COL_WIDTH,
};

/** Type guard to check if meta is HeaderMetaProps (has 'type' field) */
export function isHeaderMetaProps(
  meta: HeaderMetaProps | Record<string, HeaderMetaProps>,
): meta is HeaderMetaProps {
  return "type" in meta && typeof meta.type === "string";
}

/** Normalize header metadata from various response formats */
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

/** Normalize value to array */
export const normalizeValue = <T extends EntityItem>(
  value?: T | T[] | null,
): T[] => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};
