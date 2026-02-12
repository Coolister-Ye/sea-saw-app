import { useMemo } from "react";
import { convertToFormDefs } from "@/utils/formDefUtils";
import { useFieldHelpers } from "./useFieldHelpers";

export { filterVisibleFields } from "./useFieldHelpers";

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
 * Wrapper around useFieldHelpers with backward compatibility
 *
 * @param def - Form definition (FormDef[] or raw meta object)
 * @param fieldConfig - Configuration for field categorization
 * @returns Object with helper functions and filtered field arrays
 *
 * @deprecated Use useFieldHelpers directly with convertToFormDefs when possible
 */
export function useCardItemHelpers(def: any, fieldConfig?: FieldConfig) {
  // Normalize def to FormDef array (handles backward compatibility)
  const formDefs = useMemo(() => convertToFormDefs(def), [def]);

  // Get field helpers (pure computation)
  const { getChoiceLabel, renderFieldValue, getFieldLabel, choiceMaps } =
    useFieldHelpers(formDefs);

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
    fieldSections,
  };
}
