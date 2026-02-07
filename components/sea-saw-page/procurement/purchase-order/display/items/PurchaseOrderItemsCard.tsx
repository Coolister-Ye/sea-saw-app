import React from "react";
import i18n from "@/locale/i18n";
import { View } from "react-native";
import { Text } from "@/components/sea-saw-design/text";
import { ShoppingBagIcon } from "react-native-heroicons/outline";
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
import PurchaseItemsViewToggle from "./PurchaseItemsViewToggle";
import { AttachmentsList } from "@/components/sea-saw-design/attachments";
import { canEditPurchaseOrder } from "@/constants/PipelineStatus";

interface PurchaseOrderItemsCardProps {
  def?: any;
  value?: any[] | null;
  onItemClick?: (index: number) => void;
  orderStatus?: string;
  activeEntity?: string;
  hideEmptyFields?: boolean; // Control whether to hide fields with no value, default: false
}

// Purchase order status visual styles
const PURCHASE_STATUS_STYLES: Record<
  string,
  { badge: string; badgeText: string; accent: string }
> = {
  draft: {
    badge: "bg-slate-50 border-slate-200",
    badgeText: "text-slate-600",
    accent: "border-l-slate-400",
  },
  ordered: {
    badge: "bg-blue-50 border-blue-200",
    badgeText: "text-blue-700",
    accent: "border-l-blue-500",
  },
  in_transit: {
    badge: "bg-amber-50 border-amber-200",
    badgeText: "text-amber-700",
    accent: "border-l-amber-500",
  },
  received: {
    badge: "bg-purple-50 border-purple-200",
    badgeText: "text-purple-700",
    accent: "border-l-purple-500",
  },
  completed: {
    badge: "bg-emerald-50 border-emerald-200",
    badgeText: "text-emerald-700",
    accent: "border-l-emerald-500",
  },
  cancelled: {
    badge: "bg-red-50 border-red-200",
    badgeText: "text-red-700",
    accent: "border-l-red-500",
  },
};

const DEFAULT_STATUS_STYLE = {
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
    "purchase_code",
    "status",
    "tracking_number",
    "purchase_items",
    "attachments",
    "remark",
    "notes",
    "description",
    "supplier_address",
    "owner",
    "created_at",
    "updated_at",
    "created_by",
    "updated_by",
  ],
  // Fields for Info Grid section (auto-rendered)
  infoGrid: [
    "supplier",
    "order_date",
    "expected_delivery_date",
    "actual_delivery_date",
    "total_amount",
    "currency",
    "payment_terms",
    "shipping_method",
    "shipping_cost",
  ],
  // Full-width text fields
  fullWidth: ["supplier_address", "remark", "notes", "description"],
};

export default function PurchaseOrderItemsCard({
  def,
  value,
  onItemClick,
  orderStatus,
  activeEntity,
  hideEmptyFields = false,
}: PurchaseOrderItemsCardProps) {
  // Use the shared hook for common card item helpers
  const {
    getChoiceLabel,
    renderFieldValue,
    infoGridFields,
    fullWidthFields,
    getFieldLabel,
  } = useCardItemHelpers(def, FIELD_CONFIG);

  // Helper to get status style
  const getStatusStyle = (status: string) =>
    PURCHASE_STATUS_STYLES[status] ?? DEFAULT_STATUS_STYLE;

  if (!value?.length) {
    return <EmptySlot message={i18n.t("No purchase order records")} />;
  }

  return (
    <View className="gap-4 w-full">
      {value.map((item, index) => {
        const statusStyle = getStatusStyle(item.status);
        const canEdit =
          typeof onItemClick === "function" &&
          canEditPurchaseOrder(
            orderStatus || "",
            activeEntity || "",
            item.status || "",
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
            className={`bg-white rounded-xl overflow-hidden border border-slate-200/80 shadow-sm border-l-4 ${statusStyle.accent}`}
          >
            {/* Header */}
            <CardHeader
              code={item.purchase_code}
              statusValue={item.status}
              statusLabel={
                item.status ? getChoiceLabel("status", item.status) : undefined
              }
              badgeStyle={item.status ? statusStyle : undefined}
              rightContent={
                item.tracking_number ? (
                  <View className="items-end">
                    <Text className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                      {getFieldLabel("tracking_number")}
                    </Text>
                    <View className="flex-row items-center gap-1.5">
                      <ShoppingBagIcon size={16} color="#64748b" />
                      <Text className="text-sm font-mono text-slate-700 font-medium">
                        {item.tracking_number}
                      </Text>
                    </View>
                  </View>
                ) : undefined
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
                        fieldDef.field.includes("number")
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
                  {item[fieldDef.field]}
                </Text>
              </CardSection>
            ))}

            {/* Purchase Items */}
            {item.purchase_items && item.purchase_items.length > 0 && (
              <CardSection>
                <Text className="text-xs text-slate-400 uppercase tracking-wider mb-3">
                  {getFieldLabel("purchase_items")} (
                  {item.purchase_items.length})
                </Text>
                <PurchaseItemsViewToggle
                  def={def?.child?.children?.purchase_items}
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
