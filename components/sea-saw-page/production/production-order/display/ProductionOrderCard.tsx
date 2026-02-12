import React, { useCallback, useMemo } from "react";
import { View } from "react-native";
import i18n from "@/locale/i18n";
import { Text } from "@/components/sea-saw-design/text";
import {
  Card,
  Field,
  FieldGrid,
  CardSection,
  EmptySlot,
} from "@/components/sea-saw-page/base";
import { canEditProductionOrder } from "@/constants/PipelineStatus";
import { convertToFormDefs } from "@/utils/formDefUtils";
import { useFieldHelpers } from "@/hooks/useFieldHelpers";
import ProductionStatusTag from "./renderers/ProductionStatusTag";
import ProductionItemsViewToggle from "./items/ProductionItemsViewToggle";
import { AttachmentsList } from "@/components/sea-saw-design/attachments";
import type { FormDef } from "@/hooks/useFormDefs";

interface ProductionOrderItemsCardProps {
  def?: FormDef[];
  value?: any[] | null;
  onItemClick?: (index: number) => void;
  orderStatus?: string;
  activeEntity?: string;
  hideEmptyFields?: boolean;
}

export default function ProductionOrderCard({
  def,
  value,
  onItemClick,
  orderStatus,
  activeEntity,
  hideEmptyFields = false,
}: ProductionOrderItemsCardProps) {
  // Normalize value to array
  const items = useMemo(() => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }, [value]);

  // Convert def to FormDefs and get field helpers
  const formDefs = useMemo(() => convertToFormDefs(def), [def]);
  const { getFieldLabel, renderFieldValue } = useFieldHelpers(formDefs);

  // Helper to get field def by name
  const getFieldDef = useCallback(
    (fieldName: string) => formDefs.find((d) => d.field === fieldName),
    [formDefs],
  );

  // Helper to check if field should be shown
  const shouldShowField = useCallback(
    (item: any, fieldName: string) => {
      if (!hideEmptyFields) return true;
      const fieldValue = item[fieldName];
      return fieldValue !== null && fieldValue !== undefined && fieldValue !== "";
    },
    [hideEmptyFields],
  );

  // Helper to safely render field value
  const renderField = useCallback(
    (fieldName: string, itemValue: any) => {
      const fieldDef = getFieldDef(fieldName);
      if (!fieldDef) return itemValue?.toString() || "—";
      return renderFieldValue(fieldDef, itemValue);
    },
    [getFieldDef, renderFieldValue],
  );

  if (items.length === 0) {
    return <EmptySlot message={i18n.t("No production order records")} />;
  }

  const renderCard = (item: any, index: number) => {
    const statusDef = getFieldDef("status");
    const productionItemsDef = getFieldDef("production_items")?.child?.children;

    const isEditable = canEditProductionOrder(
      orderStatus || "",
      activeEntity || "",
      item.status || "",
    );

    return (
      <Card key={item.id ?? index}>
        {/* Header: Code + Status */}
        <Card.Header
          code={item.production_code}
          statusValue={
            item.status ? (
              <ProductionStatusTag
                def={statusDef}
                value={item.status}
                className="w-fit"
              />
            ) : undefined
          }
        />

        {/* Schedule Information Section */}
        {["planned_date", "start_date", "end_date"].some((f) =>
          shouldShowField(item, f),
        ) && (
          <Card.Section className="bg-slate-50/70">
            <Text className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              {i18n.t("schedule information")}
            </Text>
            <FieldGrid>
              {["planned_date", "start_date", "end_date"].map(
                (fieldName) =>
                  shouldShowField(item, fieldName) && (
                    <Field
                      key={fieldName}
                      label={getFieldLabel(fieldName)}
                      value={renderField(fieldName, item[fieldName])}
                    />
                  ),
              )}
            </FieldGrid>
          </Card.Section>
        )}

        {/* Full-width text fields */}
        {["remark", "comment"].map(
          (fieldName) =>
            shouldShowField(item, fieldName) && (
              <Card.Section key={fieldName}>
                <Text className="text-xs text-slate-400 uppercase tracking-wider mb-1.5">
                  {getFieldLabel(fieldName)}
                </Text>
                <Text className="text-sm text-slate-600 leading-relaxed">
                  {item[fieldName] || "—"}
                </Text>
              </Card.Section>
            ),
        )}

        {/* Production Items */}
        {item.production_items?.length > 0 && (
          <CardSection>
            <Text className="text-xs text-slate-400 uppercase tracking-wider mb-3">
              {getFieldLabel("production_items")} (
              {item.production_items.length})
            </Text>
            <ProductionItemsViewToggle
              def={productionItemsDef}
              value={item.production_items}
            />
          </CardSection>
        )}

        {/* Attachments */}
        {item.attachments?.length > 0 && (
          <CardSection>
            <Text className="text-xs text-slate-400 uppercase tracking-wider mb-2">
              {getFieldLabel("attachments")} ({item.attachments.length})
            </Text>
            <AttachmentsList value={item.attachments} />
          </CardSection>
        )}

        {/* Footer: Metadata + Edit Button */}
        <Card.Footer
          metadata={item}
          canEdit={isEditable}
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
