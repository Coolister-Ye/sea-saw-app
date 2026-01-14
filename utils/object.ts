/**
 * Object and data structure manipulation utilities
 */

/**
 * Determines if a given value is a plain JSON object.
 * A plain JSON object is an object that is not null and not an array.
 * @param obj - The value to check
 * @returns `true` if the value is a plain object, otherwise `false`
 */
export function isJsonObject(obj: any): obj is { [key: string]: any } {
  return typeof obj === "object" && obj !== null && !Array.isArray(obj);
}

/**
 * Returns the length of a JSON-like structure.
 * - For arrays, it returns the number of elements.
 * - For objects, it returns the number of keys.
 * - For other types, it returns 0.
 * @param json - The input data
 * @returns The length of the array or the number of keys in the object, or 0
 */
export function getLength(json: any): number {
  if (!json || typeof json !== "object") return 0;
  return Array.isArray(json) ? json.length : Object.keys(json).length;
}

/**
 * Check if all values in a JSON object are `null`
 * @param json - The JSON object to check
 * @returns `true` if all values are null
 */
export function isObjectEmpty(json: Record<string, any>): boolean {
  for (const [k, v] of Object.entries(json)) {
    if (v !== null) return false;
  }
  return true;
}

/**
 * Checks if all values in a JSON object are either `null` or empty strings.
 * Excludes "pk" and "id" keys from the check.
 * @param json - The JSON object to check
 * @returns `true` if all values are empty; otherwise, `false`
 */
export function isJsonEmpty(json: Record<string, any>): boolean {
  return Object.entries(json)
    .filter(([key]) => key !== "pk" && key !== "id")
    .every(
      ([, value]) =>
        value === null || (typeof value === "string" && value.trim() === "")
    );
}

/**
 * Convert a JSON object to a string representation.
 * @param json - The JSON object to convert
 * @returns A string representing the JSON object
 */
export function json2Str(json: any): string {
  if (Array.isArray(json)) {
    return json.toString();
  }

  return Object.entries(json)
    .map(([key, value]) => {
      if (isJsonObject(value)) {
        value = json2Str(value);
      } else if (typeof value === "string") {
        value = `"${value}"`;
      }
      return `${key}: ${value}`;
    })
    .join(", ");
}

/**
 * Normalize a value to boolean
 * @param val - Value to normalize
 * @returns Boolean value
 */
export function normalizeBoolean(val: any): boolean {
  if (typeof val === "boolean") return val;
  if (typeof val === "string") {
    return val.toLowerCase() === "true";
  }
  return false;
}

/**
 * Reorder object properties based on a specified order
 * @param def - Object to reorder
 * @param order - Array of keys in desired order
 * @returns Reordered object
 */
export function reorderDefs(def: any, order: string[]): any {
  if (!def) return def;

  const ordered: any = {};

  // Add fields in specified order
  order.forEach((key) => {
    if (def[key]) {
      ordered[key] = def[key];
    }
  });

  // Append remaining fields
  Object.keys(def).forEach((key) => {
    if (!ordered[key]) {
      ordered[key] = def[key];
    }
  });

  return ordered;
}
