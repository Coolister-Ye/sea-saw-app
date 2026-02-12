import React, { useMemo } from "react";
import i18n from "@/locale/i18n";
import { View } from "react-native";
import { Tag } from "antd";
import { Text } from "@/components/sea-saw-design/text";
import { HeaderMetaProps } from "@/components/sea-saw-design/table/interface";
import { convertToFormDefs } from "@/utils/formDefUtils";
import { useFieldHelpers } from "@/hooks/useFieldHelpers";
import { Card, Field, FieldGrid, EmptySlot } from "@/components/sea-saw-page/base";

// Tag definition for rendering attribute tags
export interface TagConfig {
  field: string;
  color?: string;
  /** Format function for the value */
  format?: (value: any) => string;
  /** Show field label before value */
  showLabel?: boolean;
}

// Section definition for card sections
export interface SectionConfig {
  title?: string;
  fields: string[];
  className?: string;
}

// Field configuration
export interface ItemsCardFieldConfig {
  /** Fields to exclude from auto-rendering (typically shown in header/tags) */
  exclude: string[];
  /** Full-width text fields (comments, notes, etc.) */
  fullWidth?: string[];
  /** Organized field sections */
  sections: SectionConfig[];
}

export interface ItemsCardProps {
  /**
   * Field definitions - supports two formats:
   * 1. FormDef (single field with child?.children) - will auto-extract
   * 2. Record<string, HeaderMetaProps> (already extracted) - used directly
   */
  def?: any;
  value?: any[] | null;
  onItemClick?: (index: number) => void;
  hideEmptyFields?: boolean;
  /** Empty message when no items */
  emptyMessage?: string;
  /** Field configuration for card layout */
  fieldConfig: ItemsCardFieldConfig;
  /** Header field (product_name, etc.) */
  headerField?: string;
  /** Subtitle field (specification, etc.) */
  subtitleField?: string;
  /** Tag configurations */
  tags?: TagConfig[];
  /** Custom header renderer */
  renderHeader?: (
    item: any,
    index: number,
    getFieldLabel: (field: string) => string,
  ) => React.ReactNode;
  /** Custom extra sections renderer */
  renderExtraSections?: (
    item: any,
    index: number,
    getFieldLabel: (field: string) => string,
  ) => React.ReactNode;
}

/**
 * Reusable items card component
 * Can be used for ProductItems, ProductionItems, or any other list data
 */
export default function ItemsCard({
  def,
  value,
  onItemClick,
  hideEmptyFields = false,
  emptyMessage,
  fieldConfig,
  headerField = "product_name",
  subtitleField = "specification",
  tags = [],
  renderHeader,
  renderExtraSections,
}: ItemsCardProps) {
  // Normalize value to array
  const items = useMemo(() => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }, [value]);

  // Normalize def to field dictionary (auto-extract from FormDef if needed)
  const normalizedDef = useMemo<Record<string, HeaderMetaProps>>(() => {
    if (!def) return {};

    // If def has child?.children, extract it (FormDef format)
    if (def.child?.children) {
      return def.child.children as Record<string, HeaderMetaProps>;
    }

    // Otherwise assume it's already a Record<string, HeaderMetaProps>
    return def as Record<string, HeaderMetaProps>;
  }, [def]);

  // Convert normalized def to FormDefs and get field helpers
  const formDefs = useMemo(
    () => convertToFormDefs(normalizedDef),
    [normalizedDef]
  );
  const { getFieldLabel, renderFieldValue } = useFieldHelpers(formDefs);

  // Helper to get field def by name
  const getFieldDef = (fieldName: string) =>
    formDefs.find((d) => d.field === fieldName);

  // Helper to check if field should be shown
  const shouldShowField = (item: any, fieldName: string) => {
    if (!hideEmptyFields) return true;
    const fieldValue = item[fieldName];
    return fieldValue !== null && fieldValue !== undefined && fieldValue !== "";
  };

  // Helper to safely render field value
  const renderField = (fieldName: string, itemValue: any) => {
    const fieldDef = getFieldDef(fieldName);
    if (!fieldDef) return itemValue?.toString() || "—";
    return renderFieldValue(fieldDef, itemValue);
  };

  if (items.length === 0) {
    return <EmptySlot message={emptyMessage ?? i18n.t("No items")} />;
  }

  const renderCard = (item: any, index: number) => {
    const clickable = typeof onItemClick === "function";

    return (
      <Card key={item.id ?? index}>
        {/* Header - Custom or Default */}
        {renderHeader ? (
          renderHeader(item, index, getFieldLabel)
        ) : (
          <Card.Section className="pb-3">
            <Text className="text-base font-semibold text-slate-800 mb-1">
              {item[headerField] || getFieldLabel(headerField)}
            </Text>
            {item[subtitleField] && (
              <Text className="text-sm text-slate-500 mb-2">
                {item[subtitleField]}
              </Text>
            )}

            {/* Attributes Tags */}
            {tags.length > 0 && (
              <View className="flex-row gap-2 flex-wrap">
                {tags.map((tagConfig) => {
                  const tagValue = item[tagConfig.field];
                  if (!tagValue) return null;
                  const displayValue = tagConfig.format
                    ? tagConfig.format(tagValue)
                    : tagValue;
                  return (
                    <Tag key={tagConfig.field} color={tagConfig.color}>
                      {tagConfig.showLabel !== false
                        ? `${getFieldLabel(tagConfig.field)}: ${displayValue}`
                        : displayValue}
                    </Tag>
                  );
                })}
              </View>
            )}
          </Card.Section>
        )}

        {/* Extra Sections (e.g., Production Progress) */}
        {renderExtraSections?.(item, index, getFieldLabel)}

        {/* Dynamic Field Sections */}
        {fieldConfig.sections.map((section, sectionIndex) => {
          const visibleFields = section.fields.filter((fieldName) =>
            shouldShowField(item, fieldName)
          );

          if (visibleFields.length === 0) return null;

          return (
            <Card.Section
              key={sectionIndex}
              className={section.className || "bg-slate-50/70"}
            >
              {section.title && (
                <Text className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  {i18n.t(section.title)}
                </Text>
              )}
              <FieldGrid>
                {visibleFields.map((fieldName) => (
                  <Field
                    key={fieldName}
                    label={getFieldLabel(fieldName)}
                    value={renderField(fieldName, item[fieldName])}
                  />
                ))}
              </FieldGrid>
            </Card.Section>
          );
        })}

        {/* Dynamic Full-Width Text Fields */}
        {fieldConfig.fullWidth
          ?.filter((fieldName) => shouldShowField(item, fieldName))
          .map((fieldName) => (
            <Card.Section key={fieldName}>
              <Text className="text-xs text-slate-400 uppercase tracking-wider mb-1.5">
                {getFieldLabel(fieldName)}
              </Text>
              <Text className="text-sm text-slate-600 leading-relaxed">
                {item[fieldName] || "—"}
              </Text>
            </Card.Section>
          ))}

        {/* Footer - Edit Button */}
        {clickable && (
          <Card.Footer
            metadata={item}
            canEdit={true}
            onEdit={() => onItemClick(index)}
          />
        )}
      </Card>
    );
  };

  return (
    <View className="gap-4 w-full">
      {items.map((item, index) => renderCard(item, index))}
    </View>
  );
}
