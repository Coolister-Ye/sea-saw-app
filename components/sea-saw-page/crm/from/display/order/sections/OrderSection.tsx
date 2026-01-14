import React, { useMemo } from "react";
import { useLocale } from "@/context/Locale";
import Section from "../../../base/Section";
import DisplayForm from "@/components/sea-saw-design/form/DisplayForm";
import { OrderInput } from "../../../input/order";
import { OrderSectionProps } from "../types";
import ContactPopover from "../../contact/ContactPopover";
import OrderStatusTag from "../renderers/OrderStatusTag";
import ProductItemsViewToggle from "../../shared/items/ProductItemsViewToggle";
import AttachmentsDisplay from "../../shared/AttachmentsDisplay";

export default function OrderSection({
  order,
  orderStatus,
  defs,
  displayConfig,
  editingOrder,
  setEditingOrder,
  onCreate,
  onUpdate,
}: OrderSectionProps) {
  const { i18n } = useLocale();

  const {
    production_orders,
    outbound_orders,
    payments,
    attachments,
    allowed_actions,
    ...baseData
  } = order;

  const _displayConfig = useMemo(
    () => ({
      status: {
        render: (f: any, v: any) => <OrderStatusTag def={f} value={v} />,
      },
      contact: {
        render: (f: any, v: any) => <ContactPopover def={f} value={v} />,
      },
      order_items: {
        fullWidth: true,
        render: (f: any, v: any[]) => (
          <ProductItemsViewToggle def={f} value={v} />
        ),
      },
      attachments: {
        fullWidth: true,
        render: (f: any, v: any[]) => <AttachmentsDisplay def={f} value={v} />,
      },
      ...displayConfig,
    }),
    [displayConfig]
  );

  return (
    <Section title={i18n.t("Order Information")}>
      <DisplayForm
        table="order"
        def={defs.base}
        data={{ ...baseData, attachments }}
        config={_displayConfig}
        onEdit={
          orderStatus === "draft" ? () => setEditingOrder(order) : undefined
        }
      />
      <OrderInput
        isOpen={Boolean(editingOrder)}
        def={defs.base}
        data={editingOrder ?? {}}
        onClose={() => setEditingOrder(null)}
        onCreate={onCreate}
        onUpdate={onUpdate}
      />
    </Section>
  );
}
