import React from "react";
import i18n from '@/locale/i18n';
import { View } from "react-native";
import { Tag } from "antd";
import { Text } from "@/components/ui/text";
import { formatNumberTrim } from "@/utils";
import {
  ItemsCard,
  type ItemsCardFieldConfig,
  type TagConfig,
  CardSection,
  CardField,
} from "../../../base";

interface OutboundItemsCardProps {
  def?: any;
  value?: any[] | null;
  onItemClick?: (index: number) => void;
  hideEmptyFields?: boolean;
}

// Field configuration for outbound items card
const FIELD_CONFIG: ItemsCardFieldConfig = {
  // Fields shown in header/tags, exclude from auto-rendering
  exclude: [
    "id",
    "product_name",
    "specification",
    "size",
    "unit",
    "glazing",
    // Outbound-specific fields handled in extra sections
    "order_qty",
    "outbound_qty",
    "outbound_net_weight",
    "outbound_gross_weight",
  ],
  // Full-width text fields
  fullWidth: ["comment", "notes", "description", "remark"],
  // Organized field sections
  sections: [
    {
      title: "packaging information",
      fields: ["inner_packaging", "outter_packaging"],
      className: "bg-white",
    },
    {
      title: "weight information",
      fields: [
        "gross_weight",
        "net_weight",
        "total_gross_weight",
        "total_net_weight",
      ],
      className: "bg-slate-50/70",
    },
  ],
};

// Tag configurations
const TAGS: TagConfig[] = [
  { field: "size", color: "blue", showLabel: true },
  { field: "unit", color: "cyan", showLabel: true },
  {
    field: "glazing",
    color: "purple",
    showLabel: true,
    format: (value) => (Number(value) * 100).toFixed(0) + "%",
  },
];

export default function OutboundItemsCard({
  def,
  value,
  onItemClick,
  hideEmptyFields = false,
}: OutboundItemsCardProps) {
  // Calculate outbound progress percent for an item
  const getOutboundPercent = (item: any) => {
    const orderQty = Number(item.order_qty || 0);
    const outboundQty = Number(item.outbound_qty || 0);
    return orderQty > 0 ? ((outboundQty / orderQty) * 100).toFixed(1) : null;
  };

  // Custom header with outbound percent in top-right corner
  const renderHeader = (
    item: any,
    _index: number,
    getFieldLabel: (field: string) => string,
  ) => {
    const outboundPercent = getOutboundPercent(item);

    return (
      <View className="p-4 pb-3">
        <View className="flex-row justify-between items-start mb-1">
          <Text className="text-base font-semibold text-slate-800 flex-1">
            {item.product_name || getFieldLabel("product_name")}
          </Text>
          {outboundPercent != null && (
            <Tag color={Number(outboundPercent) >= 100 ? "green" : "orange"}>
              {outboundPercent}%
            </Tag>
          )}
        </View>
        {item.specification && (
          <Text className="text-sm text-slate-500 mb-2">
            {item.specification}
          </Text>
        )}

        {/* Attributes Tags */}
        {TAGS.length > 0 && (
          <View className="flex-row gap-2 flex-wrap">
            {TAGS.map((tagConfig) => {
              const tagValue = item[tagConfig.field];
              if (!tagValue) return null;
              const displayValue = tagConfig.format
                ? tagConfig.format(tagValue)
                : tagValue;
              return (
                <Tag key={tagConfig.field} color={tagConfig.color}>
                  {tagConfig.showLabel !== false
                    ? `${getFieldLabel(tagConfig.field)}: ${displayValue}`
                    : displayValue}
                </Tag>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  // Render outbound progress section (specific to outbound items)
  const renderExtraSections = (
    item: any,
    _index: number,
    getFieldLabel: (field: string) => string,
  ) => {
    // Hide section if no outbound data and hideEmptyFields is true
    if (
      hideEmptyFields &&
      !item.order_qty &&
      !item.outbound_qty &&
      !item.outbound_net_weight &&
      !item.outbound_gross_weight
    ) {
      return null;
    }

    return (
      <CardSection>
        <Text className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          {i18n.t("Outbound Progress")}
        </Text>
        <View className="flex-row flex-wrap gap-x-6 gap-y-3">
          <CardField
            label={getFieldLabel("order_qty")}
            value={
              item.order_qty != null ? formatNumberTrim(item.order_qty) : null
            }
          />
          <CardField
            label={getFieldLabel("outbound_qty")}
            value={
              item.outbound_qty != null
                ? formatNumberTrim(item.outbound_qty)
                : null
            }
          />
          <CardField
            label={getFieldLabel("outbound_net_weight")}
            value={
              item.outbound_net_weight != null
                ? formatNumberTrim(item.outbound_net_weight)
                : null
            }
          />
          <CardField
            label={getFieldLabel("outbound_gross_weight")}
            value={
              item.outbound_gross_weight != null
                ? formatNumberTrim(item.outbound_gross_weight)
                : null
            }
          />
        </View>
      </CardSection>
    );
  };

  return (
    <ItemsCard
      def={def}
      value={value}
      onItemClick={onItemClick}
      hideEmptyFields={hideEmptyFields}
      emptyMessage={i18n.t("No outbound items")}
      fieldConfig={FIELD_CONFIG}
      headerField="product_name"
      subtitleField="specification"
      tags={TAGS}
      accentColor="orange"
      renderHeader={renderHeader}
      renderExtraSections={renderExtraSections}
    />
  );
}
