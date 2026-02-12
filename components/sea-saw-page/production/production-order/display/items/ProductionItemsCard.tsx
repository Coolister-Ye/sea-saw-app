import React, { useMemo } from "react";
import { View } from "react-native";
import i18n from "@/locale/i18n";
import { Tag } from "antd";
import { Text } from "@/components/sea-saw-design/text";
import { HeaderMetaProps } from "@/components/sea-saw-design/table/interface";
import {
  Card,
  Field,
  FieldGrid,
  EmptySlot,
} from "@/components/sea-saw-page/base";
import { convertToFormDefs } from "@/utils/formDefUtils";
import { useFieldHelpers } from "@/hooks/useFieldHelpers";

interface ProductionItemsCardProps {
  /** Field definitions (already extracted as child?.children from parent) */
  def?: Record<string, HeaderMetaProps>;
  value?: any[] | null;
  onItemClick?: (index: number) => void;
  hideEmptyFields?: boolean;
}

export default function ProductionItemsCard({
  def,
  value,
  onItemClick,
  hideEmptyFields = false,
}: ProductionItemsCardProps) {
  // Normalize value to array
  const items = useMemo(() => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }, [value]);

  // Convert def to FormDefs and get field helpers
  // Note: def is already extracted as child?.children from parent
  const formDefs = useMemo(
    () => convertToFormDefs(def),
    [def]
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

  // Calculate progress percent for an item
  const getProgressPercent = (item: any) => {
    const plannedQty = Number(item.planned_qty || 0);
    const producedQty = Number(item.produced_qty || 0);
    return plannedQty > 0
      ? ((producedQty / plannedQty) * 100).toFixed(1)
      : null;
  };

  if (items.length === 0) {
    return <EmptySlot message={i18n.t("No production items")} />;
  }

  const renderCard = (item: any, index: number) => {
    const clickable = typeof onItemClick === "function";
    const progressPercent = getProgressPercent(item);

    return (
      <Card key={item.id ?? index}>
        {/* Header: Product Name + Specification + Tags + Progress */}
        <Card.Section className="pb-3">
          <View className="flex-row justify-between items-start mb-1">
            <Text className="text-base font-semibold text-slate-800 flex-1">
              {item.product_name || getFieldLabel("product_name")}
            </Text>
            {progressPercent != null && (
              <Tag color={Number(progressPercent) >= 100 ? "green" : "blue"}>
                {progressPercent}%
              </Tag>
            )}
          </View>
          {item.specification && (
            <Text className="text-sm text-slate-500 mb-2">
              {item.specification}
            </Text>
          )}

          {/* Attribute Tags: Size, Unit, Glazing */}
          <View className="flex-row gap-2 flex-wrap">
            {item.size && (
              <Tag color="blue">
                {getFieldLabel("size")}: {item.size}
              </Tag>
            )}
            {item.unit && (
              <Tag color="cyan">
                {getFieldLabel("unit")}: {item.unit}
              </Tag>
            )}
            {item.glazing && (
              <Tag color="purple">
                {getFieldLabel("glazing")}: {(Number(item.glazing) * 100).toFixed(0)}%
              </Tag>
            )}
          </View>
        </Card.Section>

        {/* Production Progress Section */}
        {["order_qty", "planned_qty", "produced_qty"].some((f) =>
          shouldShowField(item, f)
        ) && (
          <Card.Section className="bg-green-50/30">
            <Text className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              {i18n.t("Production Progress")}
            </Text>
            <FieldGrid>
              {["order_qty", "planned_qty", "produced_qty"].map(
                (fieldName) =>
                  shouldShowField(item, fieldName) && (
                    <Field
                      key={fieldName}
                      label={getFieldLabel(fieldName)}
                      value={renderField(fieldName, item[fieldName])}
                    />
                  )
              )}
            </FieldGrid>
          </Card.Section>
        )}

        {/* Packaging Information Section */}
        {["inner_packaging", "outter_packaging"].some((f) =>
          shouldShowField(item, f)
        ) && (
          <Card.Section className="bg-white">
            <Text className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              {i18n.t("packaging information")}
            </Text>
            <FieldGrid>
              {["inner_packaging", "outter_packaging"].map(
                (fieldName) =>
                  shouldShowField(item, fieldName) && (
                    <Field
                      key={fieldName}
                      label={getFieldLabel(fieldName)}
                      value={renderField(fieldName, item[fieldName])}
                    />
                  )
              )}
            </FieldGrid>
          </Card.Section>
        )}

        {/* Weight Information Section */}
        {[
          "gross_weight",
          "net_weight",
          "total_gross_weight",
          "total_net_weight",
        ].some((f) => shouldShowField(item, f)) && (
          <Card.Section className="bg-slate-50/70">
            <Text className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              {i18n.t("weight information")}
            </Text>
            <FieldGrid>
              {[
                "gross_weight",
                "net_weight",
                "total_gross_weight",
                "total_net_weight",
              ].map(
                (fieldName) =>
                  shouldShowField(item, fieldName) && (
                    <Field
                      key={fieldName}
                      label={getFieldLabel(fieldName)}
                      value={renderField(fieldName, item[fieldName])}
                    />
                  )
              )}
            </FieldGrid>
          </Card.Section>
        )}

        {/* Footer: Metadata + Edit Button */}
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
