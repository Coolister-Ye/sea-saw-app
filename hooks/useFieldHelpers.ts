// 文件路径：@/hooks/useFieldHelpers.ts
import { useMemo } from "react";
import dayjs from "dayjs";
import type { FormDef } from "./useFormDefs";

/**
 * Pure computation hook for field helpers
 * No data fetching or conversion - just helper functions
 *
 * @param formDefs - Already normalized FormDef array
 * @returns Helper functions for rendering fields
 */
export function useFieldHelpers(formDefs: FormDef[]) {
  // Build choice maps for efficient lookup
  const choiceMaps = useMemo(() => {
    const maps: Record<string, Record<string, string>> = {};
    formDefs.forEach((fieldDef) => {
      if (fieldDef.choices?.length) {
        maps[fieldDef.field] = {};
        fieldDef.choices.forEach((choice: { value: string; label: string }) => {
          maps[fieldDef.field][choice.value] = choice.label;
        });
      }
    });
    return maps;
  }, [formDefs]);

  // Helper to get choice label
  const getChoiceLabel = useMemo(
    () => (fieldName: string, val: string) =>
      choiceMaps[fieldName]?.[val] ?? val,
    [choiceMaps],
  );

  // Helper to render field value based on type
  const renderFieldValue = useMemo(
    () => (fieldDef: FormDef, value: any): string => {
      if (value === null || value === undefined || value === "") {
        return "—";
      }

      // Date/datetime formatting
      if (fieldDef.type === "datetime") {
        return dayjs(value).isValid()
          ? dayjs(value).format("YYYY-MM-DD HH:mm:ss")
          : String(value);
      }
      if (fieldDef.type === "date") {
        return dayjs(value).isValid()
          ? dayjs(value).format("YYYY-MM-DD")
          : String(value);
      }

      // Choice fields
      if (fieldDef.choices?.length) {
        return getChoiceLabel(fieldDef.field, value);
      }

      // Boolean fields
      if (fieldDef.type === "boolean") {
        return value ? "Yes" : "No";
      }

      // Number fields with formatting
      if (
        fieldDef.type === "integer" ||
        fieldDef.type === "float" ||
        fieldDef.type === "decimal"
      ) {
        return String(value);
      }

      return String(value);
    },
    [getChoiceLabel],
  );

  // Helper to get field label
  const getFieldLabel = useMemo(
    () => (fieldName: string) =>
      formDefs.find((f) => f.field === fieldName)?.label ?? fieldName,
    [formDefs],
  );

  return {
    formDefs,
    choiceMaps,
    getChoiceLabel,
    renderFieldValue,
    getFieldLabel,
  };
}

/**
 * Helper to filter fields based on configuration
 */
export function filterFieldsByConfig(
  formDefs: FormDef[],
  config: {
    exclude?: string[];
    include?: string[];
    fullWidth?: string[];
  },
) {
  const { exclude = [], include, fullWidth = [] } = config;

  return {
    infoGridFields: formDefs.filter(
      (fieldDef) =>
        !exclude.includes(fieldDef.field) &&
        !fullWidth.includes(fieldDef.field) &&
        (!include || include.includes(fieldDef.field)),
    ),
    fullWidthFields: formDefs.filter((fieldDef) =>
      fullWidth.includes(fieldDef.field),
    ),
  };
}

/**
 * Helper to filter visible fields based on hideEmptyFields flag
 */
export function filterVisibleFields(
  fields: FormDef[],
  item: any,
  hideEmptyFields: boolean,
): FormDef[] {
  if (!hideEmptyFields) return fields;
  return fields.filter((fieldDef) => {
    const value = item[fieldDef.field];
    return value !== null && value !== undefined && value !== "";
  });
}
