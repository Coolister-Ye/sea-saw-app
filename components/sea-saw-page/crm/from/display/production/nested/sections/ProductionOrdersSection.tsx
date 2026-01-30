import React from "react";
import i18n from "@/locale/i18n";
import { View } from "react-native";
import { Text } from "@/components/sea-saw-design/text";
import { ProductionOrderInputNested as ProductionOrderInput } from "../../../../input/production";
import { ProductionOrderEmptySlot, ProductionAddDivider } from "../../shared";
import { ProductionOrdersSectionProps } from "../../../order/types";
import ProductionOrderItemsCard from "../../items/ProductionOrderItemsCard";
import {
  WrenchScrewdriverIcon,
  CubeIcon,
} from "react-native-heroicons/outline";

export default function ProductionOrdersSection({
  order,
  orderStatus,
  productionOrders,
  defs,
  optionState,
  editingProd,
  setEditingProd,
  onCreate,
  onUpdate,
}: ProductionOrdersSectionProps) {
  // Calculate production summary
  const productionCount = productionOrders.length;
  const totalItems = productionOrders.reduce(
    (sum, prod) => sum + (prod.production_items?.length || 0),
    0,
  );

  return (
    <View className="mb-8">
      {/* Section Header with Stats */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 items-center justify-center shadow-lg shadow-amber-500/25">
            <WrenchScrewdriverIcon size={20} color="#ffffff" />
          </View>
          <View>
            <Text
              className="text-lg font-semibold text-slate-800 tracking-tight"
              style={{ fontFamily: "System" }}
            >
              {i18n.t("Production Order")}
            </Text>
            {productionCount > 0 && (
              <Text className="text-xs text-slate-400 mt-0.5">
                {productionCount} {i18n.t("record")}
                {productionCount > 1 ? "s" : ""}
              </Text>
            )}
          </View>
        </View>

        {/* Summary Stats Badge */}
        {productionCount > 0 && totalItems > 0 && (
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
        <View className="h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400" />

        <View className="p-1">
          {productionOrders.length ? (
            <>
              <ProductionOrderItemsCard
                def={defs.productionOrders}
                value={productionOrders}
                onItemClick={(index: number) =>
                  setEditingProd(productionOrders[index])
                }
                orderStatus={orderStatus}
                activeEntity={order?.active_entity}
              />

              <ProductionAddDivider
                disabled={!optionState.includes("in_production")}
                onAdd={() => setEditingProd({ order: order.id })}
              />
            </>
          ) : (
            <ProductionOrderEmptySlot
              pipelineId={order.id}
              disabled={!optionState.includes("in_production")}
              onCreate={onUpdate}
            />
          )}
        </View>
      </View>

      <ProductionOrderInput
        isOpen={Boolean(editingProd)}
        def={defs.productionOrders}
        data={editingProd ?? {}}
        pipelineId={order.id}
        onClose={() => setEditingProd(null)}
        onCreate={onCreate}
        onUpdate={onUpdate}
      />
    </View>
  );
}
