/**
 * API-related utility functions
 */

type FieldMeta = {
  label?: string;
  read_only?: boolean;
  type?: string;
};

type GetLabelMapOptions = {
  excludeReadOnly?: boolean;
};

/**
 * Create a mapping of field names to their labels from field metadata
 * @param def - Record of field metadata
 * @param options - Options for filtering fields
 * @returns Object mapping field names to labels
 */
export function getFieldLabelMap(
  def: Record<string, FieldMeta>,
  options: GetLabelMapOptions = {}
): Record<string, string> {
  const { excludeReadOnly = false } = options;

  return Object.fromEntries(
    Object.entries(def)
      .filter(([, meta]) => (excludeReadOnly ? meta.read_only !== true : true))
      .map(([field, meta]) => [field, meta.label ?? field])
  );
}

/**
 * Recursively strips specified fields from nested objects and arrays
 * @param value - The value to process (object, array, or primitive)
 * @param strip - Array of field names to remove from objects (default: ["id", "pk"])
 * @returns A new value with specified fields removed
 */
export function stripDeep(value: any, strip: string[] = ["id", "pk"]): any {
  if (Array.isArray(value)) {
    return value.map((item) => stripDeep(item, strip));
  }
  if (value && typeof value === "object") {
    const result: any = {};
    Object.entries(value).forEach(([key, val]) => {
      if (strip.includes(key)) return;
      result[key] = stripDeep(val, strip);
    });
    return result;
  }
  return value;
}

/**
 * Recursively strips "id" and "pk" fields from nested objects and arrays
 * This is a convenience wrapper around stripDeep with default parameters
 * @param value - The value to process
 * @returns A new value with id and pk fields removed
 */
export function stripIdsDeep(value: any): any {
  return stripDeep(value);
}
