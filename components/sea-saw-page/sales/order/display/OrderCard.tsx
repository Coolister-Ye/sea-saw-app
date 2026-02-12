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
import { canEditOrder } from "@/constants/PipelineStatus";
import AccountPopover from "@/components/sea-saw-page/crm/account/display/AccountPopover";
import { ContactPopover } from "@/components/sea-saw-page/crm/contact/display";
import OrderStatusTag from "./OrderStatusTag";
import OrderItemsViewToggle from "./items/OrderItemsViewToggle";
import { convertToFormDefs, getChildrenFormDefs } from "@/utils/formDefUtils";
import { useFieldHelpers } from "@/hooks/useFieldHelpers";
import { AttachmentsList } from "@/components/sea-saw-design/attachments";
import type { FormDef } from "@/hooks/useFormDefs";

interface OrderCardProps {
  def?: FormDef[];
  value?: any[] | null;
  onItemClick?: (index: number) => void;
  pipelineStatus?: string;
  hideEmptyFields?: boolean;
}

export default function OrderCard({
  def,
  value,
  onItemClick,
  pipelineStatus,
  hideEmptyFields = false,
}: OrderCardProps) {
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
    return <EmptySlot message={i18n.t("No orders yet")} />;
  }

  const renderCard = (item: any, index: number) => {
    const statusDef = getFieldDef("status");
    const accountDef = getFieldDef("account")?.children;
    const contactDef = getFieldDef("contact")?.children;
    const orderItemsDef = getFieldDef("order_items")?.child?.children;

    const isEditable = canEditOrder(pipelineStatus || "", item.status || "");

    return (
      <Card key={item.id ?? index}>
        {/* Header: Code + Status + Account/Contact */}
        <Card.Header
          code={item.order_code}
          statusValue={
            item.status ? (
              <OrderStatusTag
                def={statusDef}
                value={item.status}
                className="w-fit"
              />
            ) : undefined
          }
          rightContent={
            <View className="flex-row items-end gap-3">
              {/* Account */}
              <View className="items-end">
                <Text className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                  {getFieldLabel("account")}
                </Text>
                <AccountPopover
                  def={accountDef}
                  value={typeof item.account === "object" ? item.account : null}
                />
              </View>
              {/* Contact */}
              <View className="items-end">
                <Text className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                  {getFieldLabel("contact")}
                </Text>
                <ContactPopover
                  def={contactDef}
                  value={
                    typeof item.contact === "object"
                      ? item.contact
                      : item.contact_display_name
                        ? { name: item.contact_display_name }
                        : null
                  }
                />
              </View>
            </View>
          }
        />

        {/* Basic Information Section */}
        <Card.Section className="bg-slate-50/70">
          <Text className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            {i18n.t("basic information")}
          </Text>
          <FieldGrid>
            {["order_date", "etd"].map(
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

        {/* Financial Information Section */}
        {["inco_terms", "currency", "deposit", "balance", "total_amount"].some(
          (f) => shouldShowField(item, f),
        ) && (
          <Card.Section className="bg-white-50/30">
            <Text className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              {i18n.t("financial information")}
            </Text>
            <FieldGrid>
              {[
                "inco_terms",
                "currency",
                "deposit",
                "balance",
                "total_amount",
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

        {/* Logistics Information Section */}
        {["loading_port", "destination_port", "shipment_term"].some((f) =>
          shouldShowField(item, f),
        ) && (
          <Card.Section>
            <Text className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              {i18n.t("logistics information")}
            </Text>
            <FieldGrid>
              {["loading_port", "destination_port", "shipment_term"].map(
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
        {["comment"].map(
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

        {/* Order Items */}
        {item.order_items?.length > 0 && (
          <CardSection>
            <Text className="text-xs text-slate-400 uppercase tracking-wider mb-3">
              {getFieldLabel("order_items")} ({item.order_items.length})
            </Text>
            <OrderItemsViewToggle
              def={orderItemsDef}
              value={item.order_items}
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
