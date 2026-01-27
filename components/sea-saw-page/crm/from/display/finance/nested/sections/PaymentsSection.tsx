import React from "react";
import i18n from "@/locale/i18n";
import { View } from "react-native";
import { Text } from "@/components/sea-saw-design/text";
import { PaymentInput } from "../../../../input/finance";
import { PaymentEmptySlot, PaymentAddDivider } from "../../shared";
import { PaymentsSectionProps } from "../../../order/types";
import { PaymentItemsCard } from "../../items";
import { BanknotesIcon, ChartBarIcon } from "react-native-heroicons/outline";

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
  // Calculate payment summary
  const totalAmount = payments.reduce(
    (sum, p) => sum + (parseFloat(p.amount) || 0),
    0,
  );
  const paymentCount = payments.length;

  return (
    <View className="mb-8">
      {/* Section Header with Stats */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 items-center justify-center shadow-lg shadow-emerald-500/25">
            <BanknotesIcon size={20} color="#ffffff" />
          </View>
          <View>
            <Text
              className="text-lg font-semibold text-slate-800 tracking-tight"
              style={{ fontFamily: "System" }}
            >
              {i18n.t("Payments")}
            </Text>
            {paymentCount > 0 && (
              <Text className="text-xs text-slate-400 mt-0.5">
                {paymentCount} {i18n.t("record")}
                {paymentCount > 1 ? "s" : ""}
              </Text>
            )}
          </View>
        </View>

        {/* Summary Stats Badge */}
        {paymentCount > 0 && (
          <View className="flex-row items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100">
            <ChartBarIcon size={14} color="#64748b" />
            <Text className="text-sm font-semibold text-slate-600 font-mono tracking-tight">
              {totalAmount.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>
        )}
      </View>

      {/* Content Card */}
      <View
        className="rounded-2xl overflow-hidden border border-slate-200/60 bg-white"
        style={{
          shadowColor: "#0f172a",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.03,
          shadowRadius: 12,
        }}
      >
        {/* Decorative top gradient line */}
        <View className="h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-400" />

        <View className="p-1">
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
        </View>
      </View>

      <PaymentInput
        isOpen={Boolean(editingPayment)}
        def={defs.payments}
        data={editingPayment ?? {}}
        pipeline={order}
        onClose={() => setEditingPayment(null)}
        onCreate={onCreate}
        onUpdate={onUpdate}
      />
    </View>
  );
}
