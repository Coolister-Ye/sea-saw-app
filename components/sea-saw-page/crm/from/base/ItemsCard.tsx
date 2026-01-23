import React from "react";
import i18n from '@/locale/i18n';
import { View } from "react-native";
import { Tag, Button } from "antd";
import { Text } from "@/components/ui/text";
import { PencilSquareIcon } from "react-native-heroicons/outline";
import {
  useCardItemHelpers,
  filterVisibleFields,
} from "@/hooks/useCardItemHelpers";
import EmptySlot from "./EmptySlot";
import CardField from "./CardField";
import CardSection from "./CardSection";

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
  /** Border accent color (left border) */
  accentColor?: string;
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
  accentColor = "indigo",
  renderHeader,
  renderExtraSections,
}: ItemsCardProps) {
  // Use the shared hook for common card item helpers
  const { renderFieldValue, fullWidthFields, getFieldLabel, fieldSections } =
    useCardItemHelpers(def?.child?.children, fieldConfig);

  const clickable = typeof onItemClick === "function";

  if (!value?.length) {
    return <EmptySlot message={emptyMessage ?? i18n.t("No items")} />;
  }

  const accentColorClass = `border-l-${accentColor}-500`;

  return (
    <View className="gap-4 w-full">
      {value.map((item, index) => {
        // Filter out fields with no value if hideEmptyFields is true
        const visibleFullWidthFields = filterVisibleFields(
          fullWidthFields,
          item,
          hideEmptyFields,
        );

        return (
          <View
            key={item.id ?? index}
            className={`bg-white rounded-xl overflow-hidden border border-slate-200/80 shadow-sm border-l-4 ${accentColorClass}`}
          >
            {/* Header - Custom or Default */}
            {renderHeader ? (
              renderHeader(item, index, getFieldLabel)
            ) : (
              <View className="p-4 pb-3">
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
              </View>
            )}

            {/* Extra Sections (e.g., Production Progress) */}
            {renderExtraSections?.(item, index, getFieldLabel)}

            {/* Dynamic Field Sections */}
            {fieldSections.map((section, sectionIndex) => {
              const visibleFields = filterVisibleFields(
                section.fields,
                item,
                hideEmptyFields,
              );

              if (visibleFields.length === 0) return null;

              return (
                <CardSection
                  key={sectionIndex}
                  className={section.className || "bg-slate-50/70"}
                >
                  {section.title && (
                    <Text className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                      {i18n.t(section.title)}
                    </Text>
                  )}
                  <View className="flex-row flex-wrap gap-x-6 gap-y-3">
                    {visibleFields.map((fieldDef) => (
                      <CardField
                        key={fieldDef.field}
                        label={fieldDef.label}
                        value={renderFieldValue(fieldDef, item[fieldDef.field])}
                        mono={
                          fieldDef.type === "string" &&
                          fieldDef.field.includes("number")
                        }
                      />
                    ))}
                  </View>
                </CardSection>
              );
            })}

            {/* Dynamic Full-Width Text Fields */}
            {visibleFullWidthFields.map((fieldDef) => (
              <CardSection key={fieldDef.field}>
                <Text className="text-xs text-slate-400 uppercase tracking-wider mb-1.5">
                  {fieldDef.label}
                </Text>
                <Text className="text-sm text-slate-600 leading-relaxed">
                  {item[fieldDef.field]}
                </Text>
              </CardSection>
            ))}

            {/* Footer - Edit Button */}
            {clickable && (
              <CardSection className="py-2.5 bg-slate-50/50">
                <View className="flex-row justify-end">
                  <Button
                    type="text"
                    size="small"
                    className="p-0 h-auto"
                    onClick={() => onItemClick(index)}
                  >
                    <View className="flex-row items-center gap-1">
                      <PencilSquareIcon size={14} color="#64748b" />
                      <Text className="text-xs text-slate-500 font-medium">
                        {i18n.t("Edit")}
                      </Text>
                    </View>
                  </Button>
                </View>
              </CardSection>
            )}
          </View>
        );
      })}
    </View>
  );
}
