/**
 * Form data utilities
 * Handles file uploads by detecting File objects and converting them properly
 */

import { devLog, devGroup } from "./logger";

/**
 * Check if value contains any File objects (recursively)
 */
function hasFileInValue(value: any): boolean {
  if (value instanceof File || value instanceof Blob) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.some((item) => hasFileInValue(item));
  }

  if (value && typeof value === "object") {
    return Object.values(value).some((val) => hasFileInValue(val));
  }

  return false;
}

/**
 * Convert nested object to FormData manually to avoid bracket issues
 * Uses standard bracket notation (e.g., attachments[0][file])
 *
 * @param obj - The object to convert
 * @param formData - FormData instance to append to (optional)
 * @param parentKey - Parent key for nested objects (internal use)
 * @returns FormData instance
 *
 * @example
 * ```typescript
 * const data = {
 *   name: 'Test',
 *   attachments: [{
 *     file: fileObject,
 *     description: 'Photo'
 *   }]
 * };
 * const formData = objectToFormData(data);
 * // Results in:
 * // name: Test
 * // attachments[0][file]: [File object]
 * // attachments[0][description]: Photo
 * ```
 */
export function objectToFormData(
  obj: Record<string, any>,
  formData: FormData = new FormData(),
  parentKey: string = ""
): FormData {
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue;

    const value = obj[key];
    const formKey = parentKey ? `${parentKey}[${key}]` : key;

    if (value === null || value === undefined) {
      // Skip null/undefined values
      continue;
    } else if (value instanceof File || value instanceof Blob) {
      // File/Blob - append directly
      formData.append(formKey, value);
    } else if (Array.isArray(value)) {
      // Special handling for attachments array
      if (key === "attachments" || parentKey.includes("attachments")) {
        // Filter out existing attachments (have id but no new file upload)
        const validAttachments = value.filter((item) => {
          if (!item || typeof item !== "object") return true;

          // If attachment has an id (existing attachment)
          if (item.id) {
            // Only keep if file field is a File/Blob object (new upload replacing old)
            // Exclude if file is a URL string or missing (existing file, not being changed)
            return item.file instanceof File || item.file instanceof Blob;
          }

          // Keep new attachments (no id)
          return true;
        });

        validAttachments.forEach((item, index) => {
          if (item === null || item === undefined) return;
          if (item instanceof File || item instanceof Blob) {
            formData.append(`${formKey}[${index}]`, item);
          } else if (typeof item === "object") {
            objectToFormData(item, formData, `${formKey}[${index}]`);
          } else {
            formData.append(`${formKey}[${index}]`, String(item));
          }
        });
      } else {
        // Regular array handling
        value.forEach((item, index) => {
          if (item === null || item === undefined) return;
          if (item instanceof File || item instanceof Blob) {
            formData.append(`${formKey}[${index}]`, item);
          } else if (typeof item === "object") {
            objectToFormData(item, formData, `${formKey}[${index}]`);
          } else {
            formData.append(`${formKey}[${index}]`, String(item));
          }
        });
      }
    } else if (typeof value === "object") {
      // Nested object - recurse
      objectToFormData(value, formData, formKey);
    } else {
      // Primitive value - convert to string
      formData.append(formKey, String(value));
    }
  }

  return formData;
}

/**
 * Prepare request body - converts to FormData if files are present, otherwise returns as-is
 *
 * @param body - Request body object
 * @returns FormData if files are present, otherwise original object
 *
 * @example
 * ```typescript
 * // With files - returns FormData
 * const bodyWithFile = {
 *   name: 'John',
 *   avatar: fileObject
 * };
 * prepareRequestBody(bodyWithFile); // FormData
 *
 * // Without files - returns original object
 * const bodyNoFile = {
 *   name: 'John',
 *   age: 30
 * };
 * prepareRequestBody(bodyNoFile); // { name: 'John', age: 30 }
 * ```
 */
export function prepareRequestBody(
  body: Record<string, any>
): FormData | Record<string, any> {
  if (hasFileInValue(body)) {
    devLog("prepareRequestBody: Files detected, converting to FormData");
    const formData = objectToFormData(body);

    // Debug: log FormData contents in development only
    devGroup("FormData entries", () => {
      for (const [key, value] of formData.entries()) {
        devLog(
          `  ${key}:`,
          value instanceof File ? `[File: ${value.name}]` : value
        );
      }
    });

    return formData;
  }

  devLog("prepareRequestBody: No files detected, returning JSON");
  return body;
}
