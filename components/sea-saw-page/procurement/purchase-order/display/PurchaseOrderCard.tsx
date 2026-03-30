import React from "react";
import { View } from "react-native";

import i18n from "@/locale/i18n";
import { Text } from "@/components/sea-saw-design/text";
import { canEditPurchaseOrder } from "@/constants/PipelineStatus";
import AccountPopover from "@/components/sea-saw-page/crm/account/display/AccountPopover";
import { ContactPopover } from "@/components/sea-saw-page/crm/contact/display";
import { BankAccountPopover } from "@/components/sea-saw-page/crm/bank-account/display";
import PurchaseOrderStatusTag from "./renderers/PurchaseOrderStatusTag";
import PurchaseItemsViewToggle from "./items/PurchaseItemsViewToggle";
import { AttachmentsList } from "@/components/sea-saw-design/attachments";
import RelatedPipelineLink from "@/components/sea-saw-page/sales/order/display/RelatedPipelineLink";
import type { FormDef } from "@/hooks/useFormDefs";
import { DisplayCard } from "@/components/sea-saw-design/display-card";

interface PurchaseOrderCardProps {
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
  const isEditable =
    canEdit ?? canEditPurchaseOrder(pipelineStatus || "", activeEntity || "");

  return (
    <DisplayCard
      def={def}
      value={value}
      hideEmptyFields={hideEmptyFields}
      canEdit={isEditable}
      onItemClick={onItemClick}
      emptyMessage={i18n.t("No purchase order records")}
      header={{
        codeField: "purchase_code",
        statusField: "status",
        statusRender: (fieldDef, val, _item) =>
          val ? (
            <PurchaseOrderStatusTag
              def={fieldDef}
              value={val}
              className="w-fit"
            />
          ) : undefined,
        rightContent: (item, { getFieldLabel, formDefs }) => {
          const supplierDef = formDefs.find((d) => d.field === "supplier")
            ?.children as any;
          const contactDef = formDefs.find((d) => d.field === "contact")
            ?.children as any;
          return (
            <View className="flex-row items-end gap-3">
              <View className="items-end">
                <Text className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                  {getFieldLabel("supplier")}
                </Text>
                <AccountPopover
                  def={supplierDef}
                  value={
                    typeof item.supplier === "object" ? item.supplier : null
                  }
                />
              </View>
              <View className="items-end">
                <Text className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                  {getFieldLabel("contact")}
                </Text>
                <ContactPopover
                  def={contactDef}
                  value={typeof item.contact === "object" ? item.contact : null}
                />
              </View>
            </View>
          );
        },
      }}
      sections={[
        {
          title: i18n.t("basic information"),
          fields: ["purchase_date", "etd", "related_pipeline"],
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
            "bank_account",
          ],
          className: "bg-white-50/30",
        },
        {
          title: i18n.t("logistics information"),
          fields: ["loading_port", "destination_port", "shipment_term"],
        },
        {
          fields: ["purchase_items"],
        },
        {
          fields: ["comment", "attachments"],
        },
      ]}
      fieldConfig={{
        related_pipeline: {
          render: (value, item) =>
            item.related_pipeline?.pipeline_code ? (
              <RelatedPipelineLink
                value={value}
                loading={pipelineLoading}
                onClick={onPipelineClick}
              />
            ) : undefined,
        },
        bank_account: {
          fullWidth: true,
          render: (_value, item, fieldDef) =>
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
        comment: {
          fullWidth: true,
        },
        purchase_items: {
          fullWidth: true,
          label: (_value, item) =>
            `${i18n.t("purchase items")} (${item.purchase_items?.length ?? 0})`,
          render: (_value, item) => {
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
          label: (_value, item) =>
            `${i18n.t("attachments")} (${item.attachments?.length ?? 0})`,
          render: (_value, item) =>
            item.attachments?.length > 0 ? (
              <AttachmentsList value={item.attachments} />
            ) : undefined,
        },
      }}
    />
  );
}
