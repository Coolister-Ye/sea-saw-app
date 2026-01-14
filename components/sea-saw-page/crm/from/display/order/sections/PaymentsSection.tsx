import React from "react";
import { useLocale } from "@/context/Locale";
import Section from "../../../base/Section";
import { PaymentInput } from "../../../input/order";
import { PaymentEmptySlot, PaymentAddDivider } from "../../shared";
import { PaymentsSectionProps } from "../types";
import { PaymentItemsCard } from "../../finance/payment";

export default function PaymentsSection({
  order,
  orderStatus,
  payments,
  defs,
  editingPayment,
  setEditingPayment,
  onCreate,
  onUpdate,
}: PaymentsSectionProps) {
  const { i18n } = useLocale();

  return (
    <Section title={i18n.t("Payments")}>
      {payments.length ? (
        <>
          <PaymentItemsCard
            def={defs.payments}
            value={payments}
            onItemClick={(index) => setEditingPayment(payments[index])}
            orderStatus={orderStatus}
          />

          <PaymentAddDivider
            disabled={["cancelled", "completed"].includes(orderStatus)}
            onAdd={() => setEditingPayment({ order: order.id })}
          />
        </>
      ) : (
        <PaymentEmptySlot
          onCreate={() => setEditingPayment({ order: order.id })}
          disabled={["cancelled", "completed"].includes(orderStatus)}
        />
      )}

      <PaymentInput
        isOpen={Boolean(editingPayment)}
        def={defs.payments}
        data={editingPayment ?? {}}
        orderId={order.id}
        onClose={() => setEditingPayment(null)}
        onCreate={onCreate}
        onUpdate={onUpdate}
      />
    </Section>
  );
}
