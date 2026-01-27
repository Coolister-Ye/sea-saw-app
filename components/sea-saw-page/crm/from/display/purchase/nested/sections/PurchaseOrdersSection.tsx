import React from "react";
import i18n from "@/locale/i18n";
import { View } from "react-native";
import { Text } from "@/components/sea-saw-design/text";
import { PurchaseOrderInputNested as PurchaseOrderInput } from "../../../../input/purchase";
import { PurchaseOrderEmptySlot, PurchaseAddDivider } from "../../shared";
import { PurchaseOrdersSectionProps } from "../../../order/types";
import PurchaseOrderItemsCard from "../../items/PurchaseOrderItemsCard";
import { ShoppingBagIcon, CubeIcon } from "react-native-heroicons/outline";

export default function PurchaseOrdersSection({
  order,
  orderStatus,
  purchaseOrders,
  defs,
  optionState,
  editingPurchase,
  setEditingPurchase,
  onCreate,
  onUpdate,
}: PurchaseOrdersSectionProps) {
  // Calculate purchase summary
  const purchaseCount = purchaseOrders.length;
  const totalItems = purchaseOrders.reduce(
    (sum, po) => sum + (po.purchase_items?.length || 0),
    0,
  );

  return (
    <View className="mb-8">
      {/* Section Header with Stats */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 items-center justify-center shadow-lg shadow-purple-500/25">
            <ShoppingBagIcon size={20} color="#ffffff" />
          </View>
          <View>
            <Text
              className="text-lg font-semibold text-slate-800 tracking-tight"
              style={{ fontFamily: "System" }}
            >
              {i18n.t("Purchase Order")}
            </Text>
            {purchaseCount > 0 && (
              <Text className="text-xs text-slate-400 mt-0.5">
                {purchaseCount} {i18n.t("record")}
                {purchaseCount > 1 ? "s" : ""}
              </Text>
            )}
          </View>
        </View>

        {/* Summary Stats Badge */}
        {purchaseCount > 0 && totalItems > 0 && (
          <View className="flex-row items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100">
            <CubeIcon size={14} color="#64748b" />
            <Text className="text-sm font-semibold text-slate-600 font-mono tracking-tight">
              {totalItems} {i18n.t("items")}
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
        <View className="h-1 bg-gradient-to-r from-purple-400 via-purple-500 to-pink-400" />

        <View className="p-1">
          {purchaseOrders.length ? (
            <>
              <PurchaseOrderItemsCard
                def={defs.purchaseOrders}
                value={purchaseOrders}
                onItemClick={(index: number) =>
                  setEditingPurchase(purchaseOrders[index])
                }
                orderStatus={orderStatus}
                activeEntity={order?.active_entity}
              />

              <PurchaseAddDivider
                disabled={!optionState.includes("create_purchase_order")}
                onAdd={() => setEditingPurchase({ order: order.id })}
              />
            </>
          ) : (
            <PurchaseOrderEmptySlot
              orderId={order.id}
              onCreate={onUpdate}
              disabled={!optionState.includes("create_purchase_order")}
            />
          )}
        </View>
      </View>

      <PurchaseOrderInput
        isOpen={Boolean(editingPurchase)}
        def={defs.purchaseOrders}
        data={editingPurchase ?? {}}
        orderId={order.id}
        onClose={() => setEditingPurchase(null)}
        onCreate={onCreate}
        onUpdate={onUpdate}
      />
    </View>
  );
}
