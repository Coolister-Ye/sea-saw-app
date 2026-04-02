import React from "react";
import { View, Pressable } from "react-native";
import i18n from "@/locale/i18n";
import { Text } from "@/components/sea-saw-design/text";
import { canEditOrder } from "@/constants/PipelineStatus";
import AccountPopover from "@/components/sea-saw-page/crm/account/display/AccountPopover";
import { ContactPopover } from "@/components/sea-saw-page/crm/contact/display";
import { BankAccountPopover } from "@/components/sea-saw-page/crm/bank-account/display";
import OrderStatusTag from "./OrderStatusTag";
import OrderItemsViewToggle from "./items/OrderItemsViewToggle";
import { AttachmentsList } from "@/components/sea-saw-design/attachments";
import { PipelinePopover } from "@/components/sea-saw-page/pipeline/display/renderers/PipelinePopover";
import { EyeOutlined } from "@ant-design/icons";
import type { FormDef } from "@/hooks/useFormDefs";
import { DisplayCard } from "@/components/sea-saw-design/display-card";

interface OrderCardProps {
  def?: FormDef[];
  value?: any[] | null;
  onItemClick?: (index: number) => void;
  onPipelineClick?: () => void;
  pipelineStatus?: string;
  hideEmptyFields?: boolean;
}

export default function OrderCard({
  def,
  value,
  onItemClick,
  onPipelineClick,
  pipelineStatus,
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
      defaultEmptyDisplay="—"
      header={{
        codeField: "order_code",
        statusField: "status",
        statusRender: (fieldDef, val) =>
          val ? (
            <OrderStatusTag def={fieldDef} value={val} className="w-fit" />
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
            "order_date",
            "etd",
            "buyer",
            "contact",
            "seller",
            "shipper",
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
          fields: ["order_items"],
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
                value={
                  typeof item.contact === "object"
                    ? item.contact
                    : item.contact_display_name
                      ? { name: item.contact_display_name }
                      : null
                }
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
        seller: {
          render: (_v, item, fieldDef) =>
            item.seller ? (
              <AccountPopover
                def={(fieldDef as any)?.children}
                value={typeof item.seller === "object" ? item.seller : null}
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
        payment_terms: { fullWidth: true },
        comment: { fullWidth: true },
        additional_info: { fullWidth: true },
        order_items: {
          fullWidth: true,
          label: (_v, item) =>
            `${i18n.t("order items")} (${item.order_items?.length ?? 0})`,
          render: (_v, item) => {
            const orderItemsDef = def?.find(
              (d: FormDef) => d.field === "order_items",
            )?.child?.children;
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
