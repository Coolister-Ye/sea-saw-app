import React from "react";
import i18n from "@/locale/i18n";
import { View } from "react-native";
import { Text } from "@/components/sea-saw-design/text";
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
import { AttachmentsDisplay } from "@/components/sea-saw-design/attachments";
import AccountPopover from "@/components/sea-saw-page/crm/account/display/AccountPopover";
import { ContactPopover } from "@/components/sea-saw-page/crm/contact/display";

interface PipelineCardProps {
  def?: any;
  value?: any;
  onItemClick?: () => void;
  canEdit?: boolean;
  hideEmptyFields?: boolean;
}

// Pipeline status visual styles
const PIPELINE_STATUS_STYLES: Record<
  string,
  { badge: string; badgeText: string; accent: string }
> = {
  draft: {
    badge: "bg-slate-50 border-slate-200",
    badgeText: "text-slate-600",
    accent: "border-l-slate-400",
  },
  order_confirmed: {
    badge: "bg-blue-50 border-blue-200",
    badgeText: "text-blue-700",
    accent: "border-l-blue-500",
  },
  in_production: {
    badge: "bg-amber-50 border-amber-200",
    badgeText: "text-amber-700",
    accent: "border-l-amber-500",
  },
  production_completed: {
    badge: "bg-teal-50 border-teal-200",
    badgeText: "text-teal-700",
    accent: "border-l-teal-500",
  },
  in_purchase: {
    badge: "bg-indigo-50 border-indigo-200",
    badgeText: "text-indigo-700",
    accent: "border-l-indigo-500",
  },
  purchase_completed: {
    badge: "bg-cyan-50 border-cyan-200",
    badgeText: "text-cyan-700",
    accent: "border-l-cyan-500",
  },
  in_outbound: {
    badge: "bg-violet-50 border-violet-200",
    badgeText: "text-violet-700",
    accent: "border-l-violet-500",
  },
  outbound_completed: {
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
  issue_reported: {
    badge: "bg-orange-50 border-orange-200",
    badgeText: "text-orange-700",
    accent: "border-l-orange-500",
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
    "pipeline_code",
    "status",
    "account",
    "account_id",
    "contact",
    "contact_id",
    "active_entity",
    "order",
    "production_orders",
    "purchase_orders",
    "outbound_orders",
    "payments",
    "attachments",
    "allowed_actions",
    "owner",
    "created_at",
    "updated_at",
    "created_by",
    "updated_by",
  ],
  // Full-width text fields
  fullWidth: ["comment", "notes", "description", "special_requirements"],
  // Organized field sections
  sections: [
    {
      title: "basic information",
      fields: [
        "pipeline_type",
        "order_date",
        "confirmed_at",
        "completed_at",
        "cancelled_at",
      ],
    },
    {
      title: "financial information",
      fields: ["total_budget", "currency"],
      className: "bg-white-50/30",
    },
  ],
};

export default function PipelineCard({
  def,
  value,
  onItemClick,
  canEdit = false,
  hideEmptyFields = false,
}: PipelineCardProps) {
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
    PIPELINE_STATUS_STYLES[status] ?? DEFAULT_STATUS_STYLE;

  if (!value) {
    return <EmptySlot message={i18n.t("No pipeline data")} />;
  }

  const item = value;
  const statusStyle = getStatusStyle(item.status);

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
    <View className="w-full">
      <View
        className={`bg-white rounded-xl overflow-hidden border border-slate-200/80 shadow-sm border-l-4 ${statusStyle.accent}`}
      >
        {/* Header */}
        <CardHeader
          code={item.pipeline_code}
          statusValue={item.status}
          statusLabel={
            item.status ? getChoiceLabel("status", item.status) : undefined
          }
          badgeStyle={item.status ? statusStyle : undefined}
          rightContent={
            <View className="items-end gap-1">
              <View className="items-end">
                <Text className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                  {getFieldLabel("account")}
                </Text>
                <AccountPopover
                  value={typeof item.account === "object" ? item.account : null}
                />
              </View>
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
                        value={renderFieldValue(fieldDef, item[fieldDef.field])}
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

        {/* Attachments */}
        {item.attachments?.length > 0 && (
          <CardSection>
            <Text className="text-xs text-slate-400 uppercase tracking-wider mb-2">
              {getFieldLabel("attachments")} ({item.attachments.length})
            </Text>
            <AttachmentsDisplay
              def={def?.children?.attachments}
              value={item.attachments}
            />
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
            {canEdit && typeof onItemClick === "function" && (
              <CardEditButton onClick={onItemClick} />
            )}
          </View>
        </CardSection>
      </View>
    </View>
  );
}
