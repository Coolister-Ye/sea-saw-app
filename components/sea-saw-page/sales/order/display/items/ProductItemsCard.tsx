import React from "react";
import i18n from '@/locale/i18n';
import {
  ItemsCard,
  type ItemsCardFieldConfig,
  type TagConfig,
} from "../../../base";

interface ProductItemsCardProps {
  def?: any;
  value?: any[] | null;
  onItemClick?: (index: number) => void;
  hideEmptyFields?: boolean;
}

// Field configuration for product items card
const FIELD_CONFIG: ItemsCardFieldConfig = {
  // Fields to exclude from auto-rendering (shown in header/tags)
  exclude: ["id", "product_name", "specification", "size", "unit", "glazing"],
  // Full-width text fields
  fullWidth: ["comment", "notes", "description", "remark"],
  // Organized field sections
  sections: [
    {
      title: "order information",
      fields: ["order_qty", "unit_price", "total_price"],
      className: "bg-blue-50/30",
    },
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

export default function ProductItemsCard({
  def,
  value,
  onItemClick,
  hideEmptyFields = false,
}: ProductItemsCardProps) {
  return (
    <ItemsCard
      def={def}
      value={value}
      onItemClick={onItemClick}
      hideEmptyFields={hideEmptyFields}
      emptyMessage={i18n.t("No product information")}
      fieldConfig={FIELD_CONFIG}
      headerField="product_name"
      subtitleField="specification"
      tags={TAGS}
      accentColor="indigo"
    />
  );
}
