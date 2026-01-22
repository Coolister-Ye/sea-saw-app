import { useMemo } from "react";
import dayjs from "dayjs";
import { useFormDefs, FormDef } from "./useFormDefs";

interface FieldSection {
  title?: string; // Section title (optional, will use i18n if needed)
  fields: string[]; // Fields to include in this section
  className?: string; // Optional custom className for section
}

interface FieldConfig {
  exclude: string[];
  infoGrid?: string[];
  fullWidth?: string[];
  sections?: FieldSection[]; // New: organized field sections
}

/**
 * Custom hook to provide common helpers for card item components
 * Encapsulates choice maps, field value rendering, and field filtering logic
 *
 * @param def - Form definition object (usually from API OPTIONS)
 * @param fieldConfig - Configuration for field categorization
 * @returns Object with helper functions and filtered field arrays
 */
export function useCardItemHelpers(def: any, fieldConfig?: FieldConfig) {
  // Get form definitions from the def prop
  const formDefs = useFormDefs({ def });

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

  // Filter fields for Info Grid section (if config provided)
  const infoGridFields = useMemo(() => {
    if (!fieldConfig) return [];
    return formDefs.filter(
      (fieldDef) =>
        !fieldConfig.exclude.includes(fieldDef.field) &&
        !(fieldConfig.fullWidth || []).includes(fieldDef.field),
    );
  }, [formDefs, fieldConfig]);

  // Get full-width fields that exist in the def (if config provided)
  const fullWidthFields = useMemo(() => {
    if (!fieldConfig?.fullWidth) return [];
    return formDefs.filter((fieldDef) =>
      fieldConfig.fullWidth!.includes(fieldDef.field),
    );
  }, [formDefs, fieldConfig]);

  // Helper to get field label
  const getFieldLabel = useMemo(
    () => (fieldName: string) =>
      formDefs.find((f) => f.field === fieldName)?.label ?? fieldName,
    [formDefs],
  );

  // Process field sections if configured
  const fieldSections = useMemo(() => {
    if (!fieldConfig?.sections) return [];

    return fieldConfig.sections.map((section) => ({
      title: section.title,
      className: section.className,
      fields: formDefs.filter((fieldDef) =>
        section.fields.includes(fieldDef.field),
      ),
    }));
  }, [formDefs, fieldConfig]);

  return {
    formDefs,
    choiceMaps,
    getChoiceLabel,
    renderFieldValue,
    infoGridFields,
    fullWidthFields,
    getFieldLabel,
    fieldSections, // New: organized field sections
  };
}

/**
 * Helper to filter visible fields based on hideEmptyFields flag
 *
 * @param fields - Array of field definitions
 * @param item - Data item object
 * @param hideEmptyFields - Whether to hide fields with no value
 * @returns Filtered array of field definitions
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
