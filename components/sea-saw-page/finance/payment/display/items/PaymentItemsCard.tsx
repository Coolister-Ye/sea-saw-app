import React from "react";
import i18n from "@/locale/i18n";
import { View } from "react-native";
import { Text } from "@/components/sea-saw-design/text";
import { formatNumberTrim } from "@/utils";
import {
  useCardItemHelpers,
  filterVisibleFields,
} from "@/hooks/useCardItemHelpers";
import {
  EmptySlot,
  CardField,
  CardMetadata,
  CardSection,
  CardHeader,
  CardEditButton,
} from "@/components/sea-saw-page/base";
import { AttachmentsList } from "@/components/sea-saw-design/attachments";

interface PaymentItemsCardProps {
  def?: any;
  value?: any[] | null;
  onItemClick?: (index: number) => void;
  orderStatus?: string;
  hideEmptyFields?: boolean; // Control whether to hide fields with no value, default: false
}

// Payment type visual styles
const PAYMENT_TYPE_STYLES: Record<
  string,
  { badge: string; badgeText: string; accent: string }
> = {
  order_payment: {
    badge: "bg-emerald-50 border-emerald-200",
    badgeText: "text-emerald-700",
    accent: "border-l-emerald-500",
  },
  purchase_payment: {
    badge: "bg-amber-50 border-amber-200",
    badgeText: "text-amber-700",
    accent: "border-l-amber-500",
  },
  production_payment: {
    badge: "bg-sky-50 border-sky-200",
    badgeText: "text-sky-700",
    accent: "border-l-sky-500",
  },
  outbound_payment: {
    badge: "bg-violet-50 border-violet-200",
    badgeText: "text-violet-700",
    accent: "border-l-violet-500",
  },
};

const DEFAULT_TYPE_STYLE = {
  badge: "bg-slate-50 border-slate-200",
  badgeText: "text-slate-600",
  accent: "border-l-slate-400",
};

// Fields configuration - categorize fields by display area
const FIELD_CONFIG = {
  // Fields to exclude from auto-rendering (handled specially)
  exclude: [
    "id",
    "order",
    "payment_code",
    "payment_type",
    "amount",
    "currency",
    "attachments",
    "remark",
    "owner",
    "created_at",
    "updated_at",
    "created_by",
    "updated_by",
  ],
  // Fields for Info Grid section (auto-rendered)
  infoGrid: [
    "payment_method",
    "payment_date",
    "bank_reference",
    "transaction_id",
    "notes",
  ],
  // Full-width text fields
  fullWidth: ["remark", "description"],
};

export default function PaymentItemsCard({
  def,
  value,
  onItemClick,
  orderStatus,
  hideEmptyFields = false,
}: PaymentItemsCardProps) {
  // Use the shared hook for common card item helpers
  const {
    getChoiceLabel,
    renderFieldValue,
    infoGridFields,
    fullWidthFields,
    getFieldLabel,
  } = useCardItemHelpers(def, FIELD_CONFIG);

  // Helper to get type style
  const getTypeStyle = (type: string) =>
    PAYMENT_TYPE_STYLES[type] ?? DEFAULT_TYPE_STYLE;

  // Can edit if onItemClick is provided and order is not completed
  const canEdit =
    typeof onItemClick === "function" && orderStatus !== "completed";

  if (!value?.length) {
    return <EmptySlot message={i18n.t("No payment records")} />;
  }

  return (
    <View className="gap-4 w-full">
      {value.map((item, index) => {
        const typeStyle = getTypeStyle(item.payment_type);
        const currencyLabel = getChoiceLabel(
          "currency",
          item.currency || "USD",
        );

        // Filter out fields with no value if hideEmptyFields is true
        const visibleInfoGridFields = filterVisibleFields(
          infoGridFields,
          item,
          hideEmptyFields,
        );
        const visibleFullWidthFields = filterVisibleFields(
          fullWidthFields,
          item,
          hideEmptyFields,
        );

        return (
          <View
            key={item.id ?? index}
            className={`bg-white rounded-xl overflow-hidden border border-slate-200/80 shadow-sm border-l-4 ${typeStyle.accent}`}
          >
            {/* Header */}
            <CardHeader
              code={item.payment_code}
              statusValue={item.payment_type}
              statusLabel={
                item.payment_type
                  ? getChoiceLabel("payment_type", item.payment_type)
                  : undefined
              }
              badgeStyle={item.payment_type ? typeStyle : undefined}
              rightContent={
                <View className="items-end">
                  <Text className="text-2xl font-bold text-slate-800 tracking-tight">
                    {formatNumberTrim(item.amount, 2)}
                  </Text>
                  <Text className="text-sm text-slate-500 font-medium">
                    {currencyLabel}
                  </Text>
                </View>
              }
            />

            {/* Dynamic Info Grid */}
            {visibleInfoGridFields.length > 0 && (
              <CardSection className="bg-slate-50/70">
                <View className="flex-row flex-wrap gap-x-6 gap-y-3">
                  {visibleInfoGridFields.map((fieldDef) => (
                    <CardField
                      key={fieldDef.field}
                      label={fieldDef.label}
                      value={renderFieldValue(fieldDef, item[fieldDef.field])}
                      mono={
                        fieldDef.type === "string" &&
                        (fieldDef.field.includes("reference") ||
                          fieldDef.field.includes("transaction"))
                      }
                    />
                  ))}
                </View>
              </CardSection>
            )}

            {/* Dynamic Full-Width Text Fields */}
            {visibleFullWidthFields.map((fieldDef) => (
              <CardSection key={fieldDef.field}>
                <Text className="text-xs text-slate-400 uppercase tracking-wider mb-1.5">
                  {fieldDef.label}
                </Text>
                <Text className="text-sm text-slate-600 leading-relaxed">
                  {item[fieldDef.field] || "—"}
                </Text>
              </CardSection>
            ))}

            {/* Attachments */}
            {item.attachments?.length > 0 && (
              <CardSection>
                <Text className="text-xs text-slate-400 uppercase tracking-wider mb-2">
                  {getFieldLabel("attachments")} ({item.attachments.length})
                </Text>
                <AttachmentsList value={item.attachments} />
              </CardSection>
            )}

            {/* Footer */}
            <CardSection className="py-2.5 bg-slate-50/50">
              <View className="flex-row justify-between items-center">
                <CardMetadata
                  owner={item.owner}
                  created_at={item.created_at}
                  updated_at={item.updated_at}
                  created_by={item.created_by}
                  updated_by={item.updated_by}
                />
                {canEdit && <CardEditButton onClick={() => onItemClick(index)} />}
              </View>
            </CardSection>
          </View>
        );
      })}
    </View>
  );
}
