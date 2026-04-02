import React, { ReactNode, useCallback, useMemo } from "react";
import { View } from "react-native";
import { FormDef, useFormDefs } from "@/hooks/useFormDefs";
import { convertToFormDefs } from "@/utils/formDefUtils";
import { useFieldHelpers } from "@/hooks/useFieldHelpers";
import {
  Card,
  Field,
  FieldGrid,
  CardSection,
  EmptySlot,
} from "@/components/sea-saw-page/base";
import { Text } from "@/components/sea-saw-design/text";
import FileDisplay from "@/components/sea-saw-design/form/FileDisplay";

// ========================
// Types
// ========================

export interface DisplayCardSectionConfig {
  /** Section title rendered above fields */
  title?: string;
  /** Field names to render in this section */
  fields: string[];
  /** Background / style override for Card.Section */
  className?: string;
  /** Hide section entirely — supports static bool or per-item function */
  hidden?: boolean | ((item: any) => boolean);
}

export interface DisplayCardHeaderConfig {
  /** Field name whose value is used as the monospaced code identifier */
  codeField?: string;
  /** Field name whose value is rendered as status */
  statusField?: string;
  /**
   * Custom status renderer. Receives the field's FormDef, raw value, and full item.
   * Use this to render StatusTag components, badges, name blocks, etc.
   */
  statusRender?: (fieldDef: FormDef | undefined, value: any, item: any) => ReactNode;
  /**
   * Custom right-side content for the header.
   * Receives the item and field helpers so you can build Popover/Account widgets.
   */
  rightContent?: (
    item: any,
    ctx: { getFieldLabel: (field: string) => string; formDefs: FormDef[] }
  ) => ReactNode;
}

export interface DisplayCardFieldOverride {
  /**
   * Fully custom renderer for this field.
   * Return undefined / null to fall back to auto-rendering.
   */
  render?: (
    value: any,
    item: any,
    fieldDef: FormDef | undefined
  ) => ReactNode | undefined | null;
  /** Skip this field entirely */
  skip?: boolean;
  /** Override the label from backend metadata. Accepts a static string or a function for dynamic labels (e.g. including a count). */
  label?: string | ((value: any, item: any) => string);
  /** Use monospace font for the value */
  mono?: boolean;
  /** Render field full-width below the FieldGrid (e.g. for comment / notes) */
  fullWidth?: boolean;
  /**
   * Controls how this field behaves when its value is empty/null/undefined:
   * - Not set: respects the global `hideEmptyFields` prop
   * - `false`: always hide this field when empty (overrides global)
   * - `string` (e.g. `"—"`): always show this placeholder when empty (overrides global)
   */
  emptyDisplay?: string | false;
}

export interface DisplayCardExtraSlot {
  /**
   * Where to insert this slot:
   * - "after-header" — immediately after Card.Header, before sections
   * - "before-footer" — after all sections, before Card.Footer
   */
  position: "before-footer" | "after-header";
  render: (item: any) => ReactNode;
}

export interface DisplayCardProps {
  // ── Data source (choose one) ──────────────────────────────────────────────
  /** Local field definitions (FormDef[] or raw backend OPTIONS format) */
  def?: FormDef[] | Record<string, any>;
  /** Table name to fetch field definitions from the backend OPTIONS endpoint */
  table?: string;

  // ── Data ──────────────────────────────────────────────────────────────────
  /** Single item or array of items to render */
  value?: any | any[] | null;

  // ── Layout ────────────────────────────────────────────────────────────────
  sections: DisplayCardSectionConfig[];
  header?: DisplayCardHeaderConfig;

  // ── Field customization ───────────────────────────────────────────────────
  /** Per-field render overrides, skip flags, label overrides, etc. */
  fieldConfig?: Record<string, DisplayCardFieldOverride>;

  // ── Extra content ─────────────────────────────────────────────────────────
  /** Non-standard content slots (items lists, attachments, etc.) */
  extraSlots?: DisplayCardExtraSlot[];

  // ── Behaviour ─────────────────────────────────────────────────────────────
  /** Static bool or per-item function (e.g. when editability depends on item.status) */
  canEdit?: boolean | ((item: any) => boolean);
  onItemClick?: (index: number) => void;
  /** Hide fields (and collapse empty sections) when value is null/undefined/"" */
  hideEmptyFields?: boolean;
  /**
   * Default placeholder shown for all fields when their value is empty.
   * Can be overridden per-field via `fieldConfig[field].emptyDisplay`.
   * When set, empty fields are always shown with this placeholder instead of being hidden.
   * Example: `"—"`
   */
  defaultEmptyDisplay?: string;
  emptyMessage?: string;
}

// ========================
// DisplayCard
// ========================

/**
 * Generic entity display card.
 *
 * Combines the visual structure of the Card system (Header / Section / FieldGrid / Field / Footer)
 * with DisplayForm-style intelligence: auto-formatting from backend OPTIONS metadata,
 * per-field custom renderers, and section-based layout configuration.
 *
 * @example
 * <DisplayCard
 *   def={def}
 *   value={item}
 *   header={{
 *     codeField: "purchase_code",
 *     statusField: "status",
 *     statusRender: (fieldDef, val) => <StatusTag def={fieldDef} value={val} />,
 *   }}
 *   sections={[
 *     { title: "Basic Info", fields: ["purchase_date", "etd"], className: "bg-slate-50/70" },
 *     { title: "Financial", fields: ["currency", "total_amount"] },
 *   ]}
 *   fieldConfig={{
 *     bank_account: { render: (val, item) => <BankAccountPopover value={val} /> },
 *     comment: { fullWidth: true },
 *   }}
 *   canEdit
 *   onItemClick={handleEdit}
 * />
 */
export default function DisplayCard({
  def,
  table,
  value,
  sections,
  header,
  fieldConfig,
  extraSlots,
  canEdit,
  onItemClick,
  hideEmptyFields = false,
  defaultEmptyDisplay,
  emptyMessage,
}: DisplayCardProps) {
  // ── Resolve field definitions ────────────────────────────────────────────
  const shouldFetchFromNetwork = !def && !!table;
  const networkFormDefs = useFormDefs({
    table: shouldFetchFromNetwork ? table! : "",
  });
  const localFormDefs = useMemo(() => {
    if (!def) return [];
    return convertToFormDefs(def);
  }, [def]);

  const formDefs: FormDef[] = def ? localFormDefs : networkFormDefs;

  const { getFieldLabel, renderFieldValue } = useFieldHelpers(formDefs);

  // ── Normalize items ──────────────────────────────────────────────────────
  const items = useMemo(() => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }, [value]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const getFieldDef = useCallback(
    (fieldName: string) => formDefs.find((d) => d.field === fieldName),
    [formDefs]
  );

  const fieldHasValue = useCallback(
    (item: any, fieldName: string) => {
      const override = fieldConfig?.[fieldName];

      // Resolve effective emptyDisplay: field-level takes priority over global default
      const effectiveEmptyDisplay =
        override?.emptyDisplay !== undefined ? override.emptyDisplay : defaultEmptyDisplay;

      if (effectiveEmptyDisplay !== undefined) {
        if (effectiveEmptyDisplay === false) return false;
        // It's a string placeholder — field always counts as "present"
        return true;
      }

      // Custom render — delegate to what render returns
      if (override?.render) {
        const fieldDef = formDefs.find((d) => d.field === fieldName);
        const rendered = override.render(item[fieldName], item, fieldDef);
        return rendered !== undefined && rendered !== null;
      }

      const v = item[fieldName];
      if (v === null || v === undefined || v === "") return false;
      if (Array.isArray(v)) return v.length > 0;
      return true;
    },
    [fieldConfig, formDefs, defaultEmptyDisplay]
  );

  /**
   * Render the value for a single field.
   * Priority: custom render → file upload → renderFieldValue (date/choice/boolean/string)
   */
  const renderValue = useCallback(
    (fieldName: string, item: any): ReactNode => {
      const override = fieldConfig?.[fieldName];
      const fieldDef = getFieldDef(fieldName);
      const rawValue = item[fieldName];

      // 1. Custom render override (highest priority)
      if (override?.render) {
        const custom = override.render(rawValue, item, fieldDef);
        if (custom !== undefined && custom !== null) return custom;
      }

      // 2. File upload — needs ReactNode, handle before renderFieldValue
      if (fieldDef?.type === "file upload" && rawValue) {
        return <FileDisplay value={rawValue} />;
      }

      // 3. Standard auto-formatting (date, choice, boolean, string, etc.)
      if (fieldDef) {
        return renderFieldValue(fieldDef, rawValue);
      }

      // 4. Fallback
      const effectivePlaceholder =
        typeof override?.emptyDisplay === "string"
          ? override.emptyDisplay
          : defaultEmptyDisplay ?? "—";
      if (rawValue === null || rawValue === undefined || rawValue === "") return effectivePlaceholder;
      // Objects without a custom renderer aren't meaningful as raw text
      if (typeof rawValue === "object") return effectivePlaceholder;
      return String(rawValue);
    },
    [fieldConfig, getFieldDef, renderFieldValue]
  );

  // ── Empty state ──────────────────────────────────────────────────────────
  if (items.length === 0) {
    return <EmptySlot message={emptyMessage} />;
  }

  // ── Card renderer ────────────────────────────────────────────────────────
  const renderCard = (item: any, index: number) => {
    // Header values
    const statusFieldDef = header?.statusField
      ? getFieldDef(header.statusField)
      : undefined;
    const statusRawValue = header?.statusField
      ? item[header.statusField]
      : undefined;
    const statusValue =
      header?.statusField && header?.statusRender
        ? header.statusRender(statusFieldDef, statusRawValue, item)
        : statusRawValue;

    const rightContent = header?.rightContent
      ? header.rightContent(item, { getFieldLabel, formDefs })
      : undefined;

    const afterHeaderSlots = extraSlots?.filter(
      (s) => s.position === "after-header"
    );
    const beforeFooterSlots = extraSlots?.filter(
      (s) => s.position === "before-footer"
    );

    return (
      <Card key={item.id ?? index}>
        {/* ── Header ── */}
        <Card.Header
          code={header?.codeField ? item[header.codeField] : undefined}
          statusValue={statusValue}
          rightContent={rightContent}
        />

        {/* ── After-header extra slots ── */}
        {afterHeaderSlots?.map((slot, i) => (
          <React.Fragment key={`after-header-${i}`}>
            {slot.render(item)}
          </React.Fragment>
        ))}

        {/* ── Sections ── */}
        {sections.map((section, sectionIndex) => {
          // Section-level visibility
          const isHidden =
            typeof section.hidden === "function"
              ? section.hidden(item)
              : section.hidden;
          if (isHidden) return null;

          // Split fields into grid vs full-width
          const activeFields = section.fields.filter(
            (f) => !fieldConfig?.[f]?.skip
          );
          const gridFields = activeFields.filter(
            (f) => !fieldConfig?.[f]?.fullWidth
          );
          const fullWidthFields = activeFields.filter(
            (f) => !!fieldConfig?.[f]?.fullWidth
          );

          const visibleGrid = hideEmptyFields
            ? gridFields.filter((f) => fieldHasValue(item, f))
            : gridFields;
          const visibleFullWidth = hideEmptyFields
            ? fullWidthFields.filter((f) => fieldHasValue(item, f))
            : fullWidthFields;

          if (
            hideEmptyFields &&
            visibleGrid.length === 0 &&
            visibleFullWidth.length === 0
          ) {
            return null;
          }

          return (
            <Card.Section key={sectionIndex} className={section.className}>
              {section.title && (
                <Text className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  {section.title}
                </Text>
              )}

              {/* Grid fields */}
              {visibleGrid.length > 0 && (
                <FieldGrid>
                  {visibleGrid.map((fieldName) => {
                    const override = fieldConfig?.[fieldName];
                    const rawLabel = override?.label;
                    const label =
                      typeof rawLabel === "function"
                        ? rawLabel(item[fieldName], item)
                        : rawLabel ?? getFieldLabel(fieldName);
                    return (
                      <Field
                        key={fieldName}
                        label={label}
                        value={renderValue(fieldName, item)}
                        mono={override?.mono}
                      />
                    );
                  })}
                </FieldGrid>
              )}

              {/* Full-width fields */}
              {visibleFullWidth.map((fieldName, idx) => {
                const override = fieldConfig?.[fieldName];
                const rawLabel = override?.label;
                const label =
                  typeof rawLabel === "function"
                    ? rawLabel(item[fieldName], item)
                    : rawLabel ?? getFieldLabel(fieldName);
                return (
                  <View
                    key={fieldName}
                    className={idx > 0 || visibleGrid.length > 0 ? "mt-3" : ""}
                  >
                    <Field
                      label={label}
                      value={renderValue(fieldName, item)}
                      mono={override?.mono}
                    />
                  </View>
                );
              })}
            </Card.Section>
          );
        })}

        {/* ── Before-footer extra slots ── */}
        {beforeFooterSlots?.map((slot, i) => (
          <React.Fragment key={`before-footer-${i}`}>
            {slot.render(item)}
          </React.Fragment>
        ))}

        {/* ── Footer ── */}
        <Card.Footer
          metadata={item}
          canEdit={typeof canEdit === "function" ? canEdit(item) : canEdit}
          onEdit={() => onItemClick?.(index)}
        />
      </Card>
    );
  };

  return (
    <View className="gap-4 w-full">
      {items.map((item, index) => renderCard(item, index))}
    </View>
  );
}
