import React from "react";
import i18n from "@/locale/i18n";
import { canEditOutboundOrder } from "@/constants/PipelineStatus";
import OutboundItemsViewToggle from "./items/OutboundItemsViewToggle";
import OutboundStatusTag from "./OutboundStatusTag";
import { AttachmentsList } from "@/components/sea-saw-design/attachments";
import type { FormDef } from "@/hooks/useFormDefs";
import { DisplayCard } from "@/components/sea-saw-design/display-card";

interface OutboundOrderCardProps {
  def?: FormDef[];
  value?: any[] | null;
  onItemClick?: (index: number) => void;
  pipelineStatus?: string;
  activeEntity?: string;
  hideEmptyFields?: boolean;
  /** Override pipeline-based edit permission (for standalone use) */
  canEdit?: boolean;
}

export default function OutboundOrderCard({
  def,
  value,
  onItemClick,
  pipelineStatus,
  activeEntity,
  hideEmptyFields = false,
  canEdit: canEditProp,
}: OutboundOrderCardProps) {
  const isEditable =
    canEditProp ??
    canEditOutboundOrder(pipelineStatus || "", activeEntity || "");

  return (
    <DisplayCard
      def={def}
      value={value}
      hideEmptyFields={hideEmptyFields}
      canEdit={isEditable}
      onItemClick={onItemClick}
      emptyMessage={i18n.t("No outbound order records")}
      header={{
        codeField: "outbound_code",
        statusField: "status",
        statusRender: (fieldDef, val) =>
          val ? (
            <OutboundStatusTag
              def={fieldDef}
              value={val}
              className="w-fit"
            />
          ) : undefined,
      }}
      sections={[
        {
          title: i18n.t("basic information"),
          fields: ["outbound_date", "loader"],
          className: "bg-slate-50/70",
        },
        {
          title: i18n.t("logistics information"),
          fields: [
            "container_no",
            "seal_no",
            "destination_port",
            "eta",
            "logistics_provider",
          ],
          className: "bg-white-50/30",
        },
        {
          fields: ["remark", "outbound_items", "attachments"],
        },
      ]}
      fieldConfig={{
        remark: { fullWidth: true },
        outbound_items: {
          fullWidth: true,
          label: (_v, item) =>
            `${i18n.t("outbound items")} (${item.outbound_items?.length ?? 0})`,
          render: (_v, item) => {
            const outboundItemsDef = def
              ?.find((d: FormDef) => d.field === "outbound_items")
              ?.child?.children;
            return item.outbound_items?.length > 0 ? (
              <OutboundItemsViewToggle
                def={outboundItemsDef}
                value={item.outbound_items}
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
