import React from "react";
import i18n from "@/locale/i18n";
import { View } from "react-native";
import { Text } from "@/components/sea-saw-design/text";
import { OrderInputNested as OrderInput } from "../../../../input/order";
import { ShoppingCartIcon, CubeIcon } from "react-native-heroicons/outline";
import OrderCard from "../../items/OrderCard";

interface OrdersSectionProps {
  pipeline: any;
  orders: any[];
  defs: any;
  displayConfig?: any;
  editingOrder: any | null;
  setEditingOrder: (data: any | null) => void;
  onCreate?: (res?: any) => void;
  onUpdate?: (res?: any) => void;
}

export default function OrdersSection({
  pipeline,
  orders,
  defs,
  editingOrder,
  setEditingOrder,
  onCreate,
  onUpdate,
}: OrdersSectionProps) {
  // Calculate order summary
  const orderCount = orders.length;
  const totalItems = orders.reduce(
    (sum, order) => sum + (order.order_items?.length || 0),
    0,
  );

  return (
    <View className="mb-8">
      {/* Section Header with Stats */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 items-center justify-center shadow-lg shadow-blue-500/25">
            <ShoppingCartIcon size={20} color="#ffffff" />
          </View>
          <View>
            <Text
              className="text-lg font-semibold text-slate-800 tracking-tight"
              style={{ fontFamily: "System" }}
            >
              {i18n.t("Orders")}
            </Text>
            {orderCount > 0 && (
              <Text className="text-xs text-slate-400 mt-0.5">
                {orderCount} {i18n.t("record")}
                {orderCount > 1 ? "s" : ""}
              </Text>
            )}
          </View>
        </View>

        {/* Summary Stats Badge */}
        {orderCount > 0 && totalItems > 0 && (
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
          boxShadow: "0 4px 12px rgba(15, 23, 42, 0.03)",
        }}
      >
        {/* Decorative top gradient line */}
        <View className="h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400" />

        <View className="p-1">
          <OrderCard
            def={defs.orders}
            value={orders}
            onItemClick={(index: number) => setEditingOrder(orders[index])}
            pipelineStatus={pipeline?.status}
          />
        </View>
      </View>

      <OrderInput
        isOpen={Boolean(editingOrder)}
        def={defs.orders}
        data={editingOrder ?? {}}
        pipelineId={pipeline?.id}
        onClose={() => setEditingOrder(null)}
        onCreate={onCreate}
        onUpdate={onUpdate}
      />
    </View>
  );
}
