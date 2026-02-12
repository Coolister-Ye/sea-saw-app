// 文件路径：@/utils/formDefUtils.ts
import type { HeaderMetaProps } from "@/components/sea-saw-design/form/interface";
import type { FormDef } from "@/hooks/useFormDefs";
import { normalizeBoolean } from "@/utils";

/**
 * Convert HeaderMeta to FormDef array
 * Centralized conversion logic to avoid duplicate transformations
 *
 * @param meta - Raw meta from backend OPTIONS or nested structure
 * @returns Normalized FormDef array
 */
export function convertToFormDefs(
  meta: Record<string, HeaderMetaProps> | any,
): FormDef[] {
  // Already an array - return as is
  if (Array.isArray(meta)) {
    return meta;
  }

  // Null or undefined
  if (!meta) {
    return [];
  }

  // Extract from nested structure (def.children, def.child.children, etc.)
  const target = meta.children || meta.child?.children || meta;

  // Not an object - return empty
  if (!target || typeof target !== "object") {
    return [];
  }

  // Already an array after extraction
  if (Array.isArray(target)) {
    return target;
  }

  // Convert object to array
  return Object.entries(target).map(([field, definitions]) => ({
    field,
    ...(definitions as HeaderMetaProps),
    required: normalizeBoolean((definitions as any).required),
    read_only: normalizeBoolean((definitions as any).read_only),
  }));
}

/**
 * Sort FormDefs by column order
 *
 * @param defs - FormDef array to sort
 * @param columnOrder - Desired field order
 * @returns Sorted FormDef array
 */
export function sortFormDefs(
  defs: FormDef[],
  columnOrder?: string[],
): FormDef[] {
  if (!columnOrder || columnOrder.length === 0) return defs;

  // Create a map for quick lookup
  const orderMap = new Map(columnOrder.map((field, index) => [field, index]));

  // Sort: fields in columnOrder first (by order), then others
  return [...defs].sort((a, b) => {
    const orderA = orderMap.get(a.field);
    const orderB = orderMap.get(b.field);

    // Both in order: sort by order
    if (orderA !== undefined && orderB !== undefined) {
      return orderA - orderB;
    }

    // Only a in order: a comes first
    if (orderA !== undefined) return -1;

    // Only b in order: b comes first
    if (orderB !== undefined) return 1;

    // Neither in order: keep original order
    return 0;
  });
}

/**
 * Pick specific field definition from FormDef array
 *
 * @param defs - FormDef array
 * @param field - Field name to pick
 * @returns FormDef or undefined
 */
export function pickFormDef(
  defs: FormDef[],
  field: string,
): FormDef | undefined {
  return defs.find((d) => d.field === field);
}

/**
 * Filter FormDefs by exclusion list
 *
 * @param defs - FormDef array
 * @param exclude - Field names to exclude
 * @returns Filtered FormDef array
 */
export function filterFormDefs(defs: FormDef[], exclude: string[]): FormDef[] {
  return defs.filter((d) => !exclude.includes(d.field));
}

/**
 * Get children FormDefs from a field definition
 * Useful for nested objects
 *
 * @param fieldDef - FormDef that may have children
 * @returns Children FormDef array
 */
export function getChildrenFormDefs(fieldDef?: FormDef): FormDef[] {
  if (!fieldDef) return [];
  // Pass the entire fieldDef to convertToFormDefs so it can extract
  // from either fieldDef.children or fieldDef.child.children
  return convertToFormDefs(fieldDef);
}
