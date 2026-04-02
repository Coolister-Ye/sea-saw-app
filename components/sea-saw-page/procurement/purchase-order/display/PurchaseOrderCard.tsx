import React from "react";
import { View, Pressable } from "react-native";

import i18n from "@/locale/i18n";
import { Text } from "@/components/sea-saw-design/text";
import { canEditPurchaseOrder } from "@/constants/PipelineStatus";
import AccountPopover from "@/components/sea-saw-page/crm/account/display/AccountPopover";
import { ContactPopover } from "@/components/sea-saw-page/crm/contact/display";
import { BankAccountPopover } from "@/components/sea-saw-page/crm/bank-account/display";
import PurchaseOrderStatusTag from "./renderers/PurchaseOrderStatusTag";
import PurchaseItemsViewToggle from "./items/PurchaseItemsViewToggle";
import { AttachmentsList } from "@/components/sea-saw-design/attachments";
import { PipelinePopover } from "@/components/sea-saw-page/pipeline/display/renderers/PipelinePopover";
import OrderPopover from "@/components/sea-saw-page/sales/order/display/OrderPopover";
import { EyeOutlined } from "@ant-design/icons";
import type { FormDef } from "@/hooks/useFormDefs";
import { DisplayCard } from "@/components/sea-saw-design/display-card";

interface PurchaseOrderCardProps {
  mode?: "nested" | "standalone";
  def?: FormDef[];
  value?: any[] | null;
  onItemClick?: (index: number) => void;
  onPipelineClick?: () => void;
  pipelineLoading?: boolean;
  pipelineStatus?: string;
  activeEntity?: string;
  /** Override edit permission (e.g. for standalone mode) */
  canEdit?: boolean;
  hideEmptyFields?: boolean;
}

export default function PurchaseOrderCard({
  mode = "standalone",
  def,
  value,
  onItemClick,
  onPipelineClick,
  pipelineLoading,
  pipelineStatus,
  activeEntity,
  canEdit,
  hideEmptyFields = false,
}: PurchaseOrderCardProps) {
  return (
    <DisplayCard
      def={def}
      value={value}
      hideEmptyFields={hideEmptyFields}
      canEdit={
        canEdit !== undefined
          ? canEdit
          : (_item: any) =>
              canEditPurchaseOrder(pipelineStatus || "", activeEntity || "")
      }
      onItemClick={onItemClick}
      emptyMessage={i18n.t("No purchase order records")}
      defaultEmptyDisplay="—"
      header={{
        codeField: "purchase_code",
        statusField: "status",
        statusRender: (fieldDef, val) =>
          val ? (
            <PurchaseOrderStatusTag
              def={fieldDef}
              value={val}
              className="w-fit"
            />
          ) : undefined,
        rightContent: (item, { getFieldLabel, formDefs }) => {
          const pipelineDef = formDefs.find(
            (d) => d.field === "related_pipeline",
          ) as any;
          return item.related_pipeline?.pipeline_code ? (
            <View className="items-end">
              <View className="flex-row items-center gap-1 mb-1">
                <EyeOutlined style={{ fontSize: 10, color: "#94a3b8" }} />
                <Text className="text-xs text-slate-400 uppercase tracking-wider">
                  {getFieldLabel("related_pipeline")}
                </Text>
              </View>
              <Pressable onPress={onPipelineClick}>
                <PipelinePopover
                  value={item.related_pipeline}
                  def={pipelineDef}
                  placement="bottomLeft"
                />
              </Pressable>
            </View>
          ) : undefined;
        },
      }}
      sections={[
        {
          title: i18n.t("basic information"),
          fields: [
            "purchase_date",
            "etd",
            "buyer",
            "contact",
            "supplier",
            "shipper",
            ...(mode === "standalone" ? ["related_order"] : []),
          ],
          className: "bg-slate-50/70",
        },
        {
          title: i18n.t("financial information"),
          fields: [
            "inco_terms",
            "currency",
            "deposit",
            "balance",
            "total_amount",
            "payment_terms",
            "bank_account",
          ],
          className: "bg-white-50/30",
        },
        {
          title: i18n.t("logistics information"),
          fields: ["loading_port", "destination_port", "shipment_term"],
        },
        {
          title: i18n.t("notes"),
          fields: ["additional_info", "comment"],
        },
        {
          fields: ["purchase_items"],
        },
        {
          fields: ["attachments"],
        },
      ]}
      fieldConfig={{
        buyer: {
          render: (_v, item, fieldDef) =>
            item.buyer ? (
              <AccountPopover
                def={(fieldDef as any)?.children}
                value={typeof item.buyer === "object" ? item.buyer : null}
              />
            ) : undefined,
        },
        contact: {
          render: (_v, item, fieldDef) =>
            item.contact ? (
              <ContactPopover
                def={(fieldDef as any)?.children}
                value={typeof item.contact === "object" ? item.contact : null}
              />
            ) : undefined,
        },
        supplier: {
          render: (_v, item, fieldDef) =>
            item.supplier ? (
              <AccountPopover
                def={(fieldDef as any)?.children}
                value={typeof item.supplier === "object" ? item.supplier : null}
              />
            ) : undefined,
        },
        shipper: {
          render: (_v, item, fieldDef) =>
            item.shipper ? (
              <AccountPopover
                def={(fieldDef as any)?.children}
                value={typeof item.shipper === "object" ? item.shipper : null}
              />
            ) : undefined,
        },
        bank_account: {
          fullWidth: true,
          render: (_v, item, fieldDef) =>
            item.bank_account ? (
              <View className="self-start">
                <BankAccountPopover
                  def={(fieldDef as any)?.children}
                  value={
                    typeof item.bank_account === "object"
                      ? item.bank_account
                      : null
                  }
                  placement="bottomLeft"
                />
              </View>
            ) : undefined,
        },
        related_order: {
          render: (_v, item, fieldDef) =>
            item.related_order ? (
              <OrderPopover
                def={(fieldDef as any)?.children}
                value={typeof item.related_order === "object" ? item.related_order : null}
              />
            ) : undefined,
        },
        payment_terms: { fullWidth: true },
        additional_info: { fullWidth: true },
        comment: { fullWidth: true },
        purchase_items: {
          fullWidth: true,
          label: (_v, item) =>
            `${i18n.t("purchase items")} (${item.purchase_items?.length ?? 0})`,
          render: (_v, item) => {
            const purchaseItemsDef = def?.find(
              (d: FormDef) => d.field === "purchase_items",
            )?.child?.children;
            return item.purchase_items?.length > 0 ? (
              <PurchaseItemsViewToggle
                def={purchaseItemsDef}
                value={item.purchase_items}
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
