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
import OutboundItemsViewToggle from "./items/OutboundItemsViewToggle";
import { canEditOutboundOrder } from "@/constants/PipelineStatus";
import OutboundStatusTag from "./OutboundStatusTag";
import { convertToFormDefs } from "@/utils/formDefUtils";
import { useFieldHelpers } from "@/hooks/useFieldHelpers";
import { AttachmentsList } from "@/components/sea-saw-design/attachments";
import type { FormDef } from "@/hooks/useFormDefs";

interface OutboundOrderCardProps {
  def?: FormDef[];
  value?: any[] | null;
  onItemClick?: (index: number) => void;
  orderStatus?: string;
  activeEntity?: string;
  hideEmptyFields?: boolean;
}

export default function OutboundOrderCard({
  def,
  value,
  onItemClick,
  orderStatus,
  activeEntity,
  hideEmptyFields = false,
}: OutboundOrderCardProps) {
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
    return <EmptySlot message={i18n.t("No outbound order records")} />;
  }

  const renderCard = (item: any, index: number) => {
    const statusDef = getFieldDef("status");
    const outboundItemsDef = getFieldDef("outbound_items")?.child?.children;

    const isEditable = canEditOutboundOrder(
      orderStatus || "",
      activeEntity || "",
      item.status || "",
    );

    return (
      <Card key={item.id ?? index}>
        {/* Header: Code + Status */}
        <Card.Header
          code={item.outbound_code}
          statusValue={
            item.status ? (
              <OutboundStatusTag
                def={statusDef}
                value={item.status}
                className="w-fit"
              />
            ) : undefined
          }
        />

        {/* Basic Information Section */}
        {["outbound_date", "loader"].some((f) => shouldShowField(item, f)) && (
          <Card.Section className="bg-slate-50/70">
            <Text className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              {i18n.t("basic information")}
            </Text>
            <FieldGrid>
              {["outbound_date", "loader"].map(
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

        {/* Logistics Information Section */}
        {[
          "container_no",
          "seal_no",
          "destination_port",
          "logistics_provider",
        ].some((f) => shouldShowField(item, f)) && (
          <Card.Section className="bg-white-50/30">
            <Text className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              {i18n.t("logistics information")}
            </Text>
            <FieldGrid>
              {[
                "container_no",
                "seal_no",
                "destination_port",
                "logistics_provider",
              ].map(
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
        {shouldShowField(item, "remark") && (
          <Card.Section>
            <Text className="text-xs text-slate-400 uppercase tracking-wider mb-1.5">
              {getFieldLabel("remark")}
            </Text>
            <Text className="text-sm text-slate-600 leading-relaxed">
              {item.remark || "—"}
            </Text>
          </Card.Section>
        )}

        {/* Outbound Items */}
        {item.outbound_items?.length > 0 && (
          <CardSection>
            <Text className="text-xs text-slate-400 uppercase tracking-wider mb-3">
              {getFieldLabel("outbound_items")} ({item.outbound_items.length})
            </Text>
            <OutboundItemsViewToggle
              def={outboundItemsDef}
              value={item.outbound_items}
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
