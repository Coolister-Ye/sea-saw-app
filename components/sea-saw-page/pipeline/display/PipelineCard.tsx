import React, { useCallback, useMemo } from "react";
import { View } from "react-native";
import i18n from "@/locale/i18n";
import { Text } from "@/components/sea-saw-design/text";
import {
  Card,
  Field,
  FieldGrid,
  EmptySlot,
} from "@/components/sea-saw-page/base";
import { AttachmentsDisplay } from "@/components/sea-saw-design/attachments";
import AccountPopover from "@/components/sea-saw-page/crm/account/display/AccountPopover";
import { ContactPopover } from "@/components/sea-saw-page/crm/contact/display";
import PipelineStatusTag from "@/components/sea-saw-page/pipeline/display/renderers/PipelineStatusTag";
import { convertToFormDefs } from "@/utils/formDefUtils";
import { useFieldHelpers } from "@/hooks/useFieldHelpers";
import type { HeaderMetaProps } from "@/components/sea-saw-design/form/interface";

interface PipelineCardProps {
  def?: HeaderMetaProps;
  value?: any;
  onItemClick?: () => void;
  canEdit?: boolean;
  hideEmptyFields?: boolean;
}

/**
 * Pipeline Card - displays pipeline information in a card layout
 * Uses composable Card API for better readability
 */
export default function PipelineCard({
  def,
  value,
  onItemClick,
  canEdit = false,
  hideEmptyFields = false,
}: PipelineCardProps) {
  // Normalize value to array for consistent handling
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
    return <EmptySlot message={i18n.t("No pipeline data")} />;
  }

  const renderCard = (item: any, index: number) => {
    const statusDef = getFieldDef("status");
    const accountDef = getFieldDef("account")?.children;
    const contactDef = getFieldDef("contact")?.children;
    const attachmentsDef = def?.children?.attachments;

    return (
      <Card key={item.id ?? index}>
        {/* Header: Code + Status + Account/Contact */}
        <Card.Header
          code={item.pipeline_code}
          statusValue={
            item.status ? (
              <PipelineStatusTag
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
                <AccountPopover def={accountDef} value={item.account} />
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
            {[
              "pipeline_type",
              "order_date",
              "confirmed_at",
              "completed_at",
              "cancelled_at",
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

        {/* Full-width text fields */}
        {["remark"].map(
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

        {/* Attachments */}
        {item.attachments?.length > 0 && (
          <Card.Section>
            <Text className="text-xs text-slate-400 uppercase tracking-wider mb-2">
              {getFieldLabel("attachments")} ({item.attachments.length})
            </Text>
            <AttachmentsDisplay def={attachmentsDef} value={item.attachments} />
          </Card.Section>
        )}

        {/* Footer: Metadata + Edit Button */}
        <Card.Footer metadata={item} canEdit={canEdit} onEdit={onItemClick} />
      </Card>
    );
  };

  return (
    <View className="gap-4 w-full">
      {items.map((item, index) => renderCard(item, index))}
    </View>
  );
}
