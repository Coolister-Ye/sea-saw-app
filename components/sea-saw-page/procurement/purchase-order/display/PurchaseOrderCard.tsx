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
import { canEditPurchaseOrder } from "@/constants/PipelineStatus";
import AccountPopover from "@/components/sea-saw-page/crm/account/display/AccountPopover";
import { ContactPopover } from "@/components/sea-saw-page/crm/contact/display";
import PurchaseOrderStatusTag from "./renderers/PurchaseOrderStatusTag";
import PurchaseItemsViewToggle from "./items/PurchaseItemsViewToggle";
import { convertToFormDefs } from "@/utils/formDefUtils";
import { useFieldHelpers } from "@/hooks/useFieldHelpers";
import { AttachmentsList } from "@/components/sea-saw-design/attachments";
import type { FormDef } from "@/hooks/useFormDefs";

interface PurchaseOrderCardProps {
  def?: FormDef[];
  value?: any[] | null;
  onItemClick?: (index: number) => void;
  orderStatus?: string;
  activeEntity?: string;
  hideEmptyFields?: boolean;
}

export default function PurchaseOrderCard({
  def,
  value,
  onItemClick,
  orderStatus,
  activeEntity,
  hideEmptyFields = false,
}: PurchaseOrderCardProps) {
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

  if (items.length === 0) {
    return <EmptySlot message={i18n.t("No purchase order records")} />;
  }

  const renderCard = (item: any, index: number) => {
    const statusDef = getFieldDef("status");
    const supplierDef = getFieldDef("supplier")?.children;
    const contactDef = getFieldDef("contact")?.children;
    const purchaseItemsDef = getFieldDef("purchase_items")?.child?.children;

    const isEditable = canEditPurchaseOrder(
      orderStatus || "",
      activeEntity || "",
      item.status || "",
    );

    return (
      <Card key={item.id ?? index}>
        {/* Header: Code + Status + Supplier/Contact */}
        <Card.Header
          code={item.purchase_code}
          statusValue={
            item.status ? (
              <PurchaseOrderStatusTag
                def={statusDef}
                value={item.status}
                className="w-fit"
              />
            ) : undefined
          }
          rightContent={
            <View className="flex-row items-end gap-3">
              {/* Supplier */}
              <View className="items-end">
                <Text className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                  {getFieldLabel("supplier")}
                </Text>
                <AccountPopover
                  def={supplierDef}
                  value={
                    typeof item.supplier === "object" ? item.supplier : null
                  }
                />
              </View>
              {/* Contact */}
              <View className="items-end">
                <Text className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                  {getFieldLabel("contact")}
                </Text>
                <ContactPopover
                  def={contactDef}
                  value={typeof item.contact === "object" ? item.contact : null}
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
            {["purchase_date", "etd"].map(
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

        {/* Purchase Items */}
        {item.purchase_items?.length > 0 && (
          <CardSection>
            <Text className="text-xs text-slate-400 uppercase tracking-wider mb-3">
              {getFieldLabel("purchase_items")} ({item.purchase_items.length})
            </Text>
            <PurchaseItemsViewToggle
              def={purchaseItemsDef}
              value={item.purchase_items}
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
