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
import { convertToFormDefs } from "@/utils/formDefUtils";
import { useFieldHelpers } from "@/hooks/useFieldHelpers";
import { AttachmentsList } from "@/components/sea-saw-design/attachments";
import { formatNumberTrim } from "@/utils";
import type { FormDef } from "@/hooks/useFormDefs";

interface PaymentCardProps {
  def?: FormDef[];
  value?: any[] | null;
  onItemClick?: (index: number) => void;
  orderStatus?: string;
  hideEmptyFields?: boolean;
}

export default function PaymentCard({
  def,
  value,
  onItemClick,
  orderStatus,
  hideEmptyFields = false,
}: PaymentCardProps) {
  // Normalize value to array
  const items = useMemo(() => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }, [value]);

  // Convert def to FormDefs and get field helpers
  const formDefs = useMemo(() => convertToFormDefs(def), [def]);
  const { getFieldLabel, renderFieldValue, getChoiceLabel } =
    useFieldHelpers(formDefs);

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
      return (
        fieldValue !== null && fieldValue !== undefined && fieldValue !== ""
      );
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

  // Can edit if onItemClick is provided and order is not completed
  const canEdit =
    typeof onItemClick === "function" && orderStatus !== "completed";

  if (items.length === 0) {
    return <EmptySlot message={i18n.t("No payment records")} />;
  }

  const renderCard = (item: any, index: number) => {
    const currencyLabel = getChoiceLabel("currency", item.currency || "USD");

    return (
      <Card key={item.id ?? index}>
        {/* Header: Code + Type Badge + Amount */}
        <Card.Header
          code={item.payment_code}
          statusValue={item.payment_type}
          statusLabel={
            item.payment_type
              ? getChoiceLabel("payment_type", item.payment_type)
              : undefined
          }
          rightContent={
            <View className="flex-row items-baseline gap-1">
              <Text className="text-2xl font-bold text-slate-800 tracking-tight">
                {formatNumberTrim(item.amount, 2)}
              </Text>
              <Text className="text-sm text-slate-500 font-medium">
                {currencyLabel}
              </Text>
            </View>
          }
        />

        {/* Payment Information Section */}
        {[
          "related_order_code",
          "payment_method",
          "payment_date",
          "bank_reference",
        ].some((f) => shouldShowField(item, f)) && (
          <Card.Section className="bg-slate-50/70">
            <Text className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              {i18n.t("payment information")}
            </Text>
            <FieldGrid>
              {[
                "related_order_code",
                "payment_method",
                "payment_date",
                "bank_reference",
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

        {/* Remark */}
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
          canEdit={canEdit}
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
