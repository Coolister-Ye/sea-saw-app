import React from "react";
import i18n from '@/locale/i18n';
import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { Button } from "antd";
import { PencilSquareIcon } from "react-native-heroicons/outline";
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
} from "../../../base";
import { ProductItemsViewToggle } from "../../shared/items/";
import { AttachmentsList } from "@/components/sea-saw-design/attachments";
import { canEditOrder } from "@/constants/PipelineStatus";
import ContactPopover from "../../contact/ContactPopover";

interface OrderCardProps {
  def?: any;
  value?: any[] | null;
  onItemClick?: (index: number) => void;
  pipelineStatus?: string;
  hideEmptyFields?: boolean;
}

// Order status visual styles
const ORDER_STATUS_STYLES: Record<
  string,
  { badge: string; badgeText: string; accent: string }
> = {
  draft: {
    badge: "bg-slate-50 border-slate-200",
    badgeText: "text-slate-600",
    accent: "border-l-slate-400",
  },
  confirmed: {
    badge: "bg-blue-50 border-blue-200",
    badgeText: "text-blue-700",
    accent: "border-l-blue-500",
  },
  in_production: {
    badge: "bg-amber-50 border-amber-200",
    badgeText: "text-amber-700",
    accent: "border-l-amber-500",
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

// Fields configuration
const FIELD_CONFIG = {
  // Fields to exclude from auto-rendering
  exclude: [
    "id",
    "pipeline",
    "order_code",
    "status",
    "contact",
    "order_items",
    "attachments",
    "owner",
    "created_at",
    "updated_at",
    "created_by",
    "updated_by",
  ],
  // Full-width text fields
  fullWidth: ["comment", "notes", "description", "special_requirements"],
  // Organized field sections (optional: comment out to use default flat layout)
  sections: [
    {
      title: "basic information",
      fields: ["order_date", "etd"],
    },
    {
      title: "financial information",
      fields: ["inco_terms", "currency", "deposit", "balance", "total_amount"],
      className: "bg-white-50/30",
    },
    {
      title: "logistics information",
      fields: ["loading_port", "destination_port", "shipment_term"],
    },
  ],
};

export default function OrderCard({
  def,
  value,
  onItemClick,
  pipelineStatus,
  hideEmptyFields = false,
}: OrderCardProps) {
  // Use the shared hook for common card item helpers
  const {
    getChoiceLabel,
    renderFieldValue,
    infoGridFields,
    fullWidthFields,
    getFieldLabel,
    fieldSections,
  } = useCardItemHelpers(def, FIELD_CONFIG);

  // Helper to get status style
  const getStatusStyle = (status: string) =>
    ORDER_STATUS_STYLES[status] ?? DEFAULT_STATUS_STYLE;

  if (!value?.length) {
    return <EmptySlot message={i18n.t("No orders yet")} />;
  }

  return (
    <View className="gap-4 w-full">
      {value.map((item, index) => {
        const statusStyle = getStatusStyle(item.status);
        const canEdit =
          typeof onItemClick === "function" &&
          canEditOrder(pipelineStatus || "", item.status || "");

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
              code={item.order_code}
              statusValue={item.status}
              statusLabel={
                item.status ? getChoiceLabel("status", item.status) : undefined
              }
              badgeStyle={item.status ? statusStyle : undefined}
              rightContent={
                <View className="items-end">
                  <Text className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                    {getFieldLabel("contact")}
                  </Text>
                  <ContactPopover
                    value={
                      typeof item.contact === "object"
                        ? item.contact
                        : item.contact_display_name
                          ? { name: item.contact_display_name }
                          : null
                    }
                  />
                </View>
              }
            />

            {/* Dynamic Info Grid - Section-based or flat layout */}
            {fieldSections.length > 0
              ? // Section-based layout
                fieldSections.map((section, sectionIndex) => {
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
                            value={renderFieldValue(
                              fieldDef,
                              item[fieldDef.field],
                            )}
                            mono={
                              fieldDef.type === "string" &&
                              fieldDef.field.includes("number")
                            }
                          />
                        ))}
                      </View>
                    </CardSection>
                  );
                })
              : // Flat layout (default fallback)
                visibleInfoGridFields.length > 0 && (
                  <CardSection className="bg-slate-50/70">
                    <View className="flex-row flex-wrap gap-x-6 gap-y-3">
                      {visibleInfoGridFields.map((fieldDef) => (
                        <CardField
                          key={fieldDef.field}
                          label={fieldDef.label}
                          value={renderFieldValue(
                            fieldDef,
                            item[fieldDef.field],
                          )}
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

            {/* Order Items */}
            {item.order_items?.length > 0 && (
              <CardSection>
                <Text className="text-xs text-slate-400 uppercase tracking-wider mb-3">
                  {getFieldLabel("order_items")} ({item.order_items.length})
                </Text>
                <ProductItemsViewToggle
                  def={def.children.order_items}
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
                {canEdit && (
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
                )}
              </View>
            </CardSection>
          </View>
        );
      })}
    </View>
  );
}
