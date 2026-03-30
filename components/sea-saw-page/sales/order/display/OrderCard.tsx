import React from "react";
import { View } from "react-native";
import i18n from "@/locale/i18n";
import { Text } from "@/components/sea-saw-design/text";
import { canEditOrder } from "@/constants/PipelineStatus";
import AccountPopover from "@/components/sea-saw-page/crm/account/display/AccountPopover";
import { ContactPopover } from "@/components/sea-saw-page/crm/contact/display";
import { BankAccountPopover } from "@/components/sea-saw-page/crm/bank-account/display";
import OrderStatusTag from "./OrderStatusTag";
import OrderItemsViewToggle from "./items/OrderItemsViewToggle";
import { AttachmentsList } from "@/components/sea-saw-design/attachments";
import RelatedPipelineLink from "./RelatedPipelineLink";
import type { FormDef } from "@/hooks/useFormDefs";
import { DisplayCard } from "@/components/sea-saw-design/display-card";

interface OrderCardProps {
  def?: FormDef[];
  value?: any[] | null;
  onItemClick?: (index: number) => void;
  onPipelineClick?: () => void;
  pipelineStatus?: string;
  pipelineLoading?: boolean;
  hideEmptyFields?: boolean;
}

export default function OrderCard({
  def,
  value,
  onItemClick,
  onPipelineClick,
  pipelineStatus,
  pipelineLoading,
  hideEmptyFields = false,
}: OrderCardProps) {
  return (
    <DisplayCard
      def={def}
      value={value}
      hideEmptyFields={hideEmptyFields}
      canEdit={(item) => canEditOrder(pipelineStatus || "", item.status || "")}
      onItemClick={onItemClick}
      emptyMessage={i18n.t("No orders yet")}
      header={{
        codeField: "order_code",
        statusField: "status",
        statusRender: (fieldDef, val) =>
          val ? (
            <OrderStatusTag def={fieldDef} value={val} className="w-fit" />
          ) : undefined,
        rightContent: (item, { getFieldLabel, formDefs }) => {
          const accountDef = formDefs.find((d) => d.field === "account")
            ?.children as any;
          const contactDef = formDefs.find((d) => d.field === "contact")
            ?.children as any;
          return (
            <View className="flex-row items-end gap-3">
              <View className="items-end">
                <Text className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                  {getFieldLabel("account")}
                </Text>
                <AccountPopover
                  def={accountDef}
                  value={
                    typeof item.account === "object" ? item.account : null
                  }
                />
              </View>
              <View className="items-end">
                <Text className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                  {getFieldLabel("contact")}
                </Text>
                <ContactPopover
                  def={contactDef}
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
          );
        },
      }}
      sections={[
        {
          title: i18n.t("basic information"),
          fields: ["order_date", "etd", "related_pipeline"],
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
          fields: ["comment", "order_items", "attachments"],
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
        comment: { fullWidth: true },
        order_items: {
          fullWidth: true,
          label: (_v, item) =>
            `${i18n.t("order items")} (${item.order_items?.length ?? 0})`,
          render: (_v, item) => {
            const orderItemsDef = def
              ?.find((d: FormDef) => d.field === "order_items")
              ?.child?.children;
            return item.order_items?.length > 0 ? (
              <OrderItemsViewToggle
                def={orderItemsDef}
                value={item.order_items}
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
