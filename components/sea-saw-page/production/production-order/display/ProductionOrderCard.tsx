import React from "react";
import i18n from "@/locale/i18n";
import { canEditProductionOrder } from "@/constants/PipelineStatus";
import ProductionStatusTag from "./renderers/ProductionStatusTag";
import ProductionItemsViewToggle from "./items/ProductionItemsViewToggle";
import { AttachmentsList } from "@/components/sea-saw-design/attachments";
import OrderPopover from "@/components/sea-saw-page/sales/order/display/OrderPopover";
import { DisplayCard } from "@/components/sea-saw-design/display-card";

interface ProductionOrderCardProps {
  def?: any[];
  value?: any[] | null;
  onItemClick?: (index: number) => void;
  pipelineStatus?: string;
  activeEntity?: string;
  /** Override edit permission (e.g. for standalone mode) */
  canEdit?: boolean;
  hideEmptyFields?: boolean;
}

export default function ProductionOrderCard({
  def,
  value,
  onItemClick,
  pipelineStatus,
  activeEntity,
  canEdit,
  hideEmptyFields = false,
}: ProductionOrderCardProps) {
  const isEditable =
    canEdit !== undefined
      ? canEdit
      : canEditProductionOrder(pipelineStatus || "", activeEntity || "");

  return (
    <DisplayCard
      def={def}
      value={value}
      hideEmptyFields={hideEmptyFields}
      canEdit={isEditable}
      onItemClick={onItemClick}
      emptyMessage={i18n.t("No production order records")}
      header={{
        codeField: "production_code",
        statusField: "status",
        statusRender: (fieldDef, val) =>
          val ? (
            <ProductionStatusTag
              def={fieldDef}
              value={val}
              className="w-fit"
            />
          ) : undefined,
      }}
      sections={[
        {
          title: i18n.t("basic information"),
          fields: ["related_order"],
          className: "bg-slate-50/70",
        },
        {
          title: i18n.t("schedule information"),
          fields: ["planned_date", "start_date", "end_date"],
        },
        {
          fields: ["remark", "comment", "production_items", "attachments"],
        },
      ]}
      fieldConfig={{
        related_order: {
          render: (_v, item, fieldDef) =>
            item.related_order ? (
              <OrderPopover
                def={(fieldDef as any)?.children}
                value={
                  typeof item.related_order === "object"
                    ? item.related_order
                    : null
                }
              />
            ) : undefined,
        },
        remark: { fullWidth: true },
        comment: { fullWidth: true },
        production_items: {
          fullWidth: true,
          label: (_v, item) =>
            `${i18n.t("production items")} (${item.production_items?.length ?? 0})`,
          render: (_v, item) => {
            const productionItemsDef = def
              ?.find((d: any) => d.field === "production_items")
              ?.child?.children;
            return item.production_items?.length > 0 ? (
              <ProductionItemsViewToggle
                def={productionItemsDef}
                value={item.production_items}
              />
            ) : undefined;
          },
        },
        attachments: {
          fullWidth: true,
          label: (_v, item) =>
            `${i18n.t("attachments")} (${item.attachments?.length ?? 0})`,
          render: (_v, item) =>
            item.attachments?.length > 0 ? (
              <AttachmentsList value={item.attachments} />
            ) : undefined,
        },
      }}
    />
  );
}
