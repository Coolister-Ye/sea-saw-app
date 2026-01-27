import React from "react";
import i18n from "@/locale/i18n";
import { View } from "react-native";
import { Text } from "@/components/sea-saw-design/text";
import { OutboundOrderInput } from "../../../../input/warehouse";
import { OutboundOrderEmptySlot, OutboundAddDivider } from "../../shared";
import { OutboundOrdersSectionProps } from "../../../order/types";
import { OutboundOrderItemsCard } from "../../items";
import { TruckIcon, CubeIcon } from "react-native-heroicons/outline";

export default function OutboundOrdersSection({
  pipeline,
  pipelineStatus,
  outboundOrders,
  defs,
  optionState,
  editingOb,
  setEditingOb,
  onCreate,
  onUpdate,
}: OutboundOrdersSectionProps) {
  // Calculate outbound summary
  const outboundCount = outboundOrders.length;
  const totalItems = outboundOrders.reduce(
    (sum, ob) => sum + (ob.outbound_items?.length || 0),
    0,
  );

  return (
    <View className="mb-8">
      {/* Section Header with Stats */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 items-center justify-center shadow-lg shadow-indigo-500/25">
            <TruckIcon size={20} color="#ffffff" />
          </View>
          <View>
            <Text
              className="text-lg font-semibold text-slate-800 tracking-tight"
              style={{ fontFamily: "System" }}
            >
              {i18n.t("Outbound Order")}
            </Text>
            {outboundCount > 0 && (
              <Text className="text-xs text-slate-400 mt-0.5">
                {outboundCount} {i18n.t("record")}
                {outboundCount > 1 ? "s" : ""}
              </Text>
            )}
          </View>
        </View>

        {/* Summary Stats Badge */}
        {outboundCount > 0 && totalItems > 0 && (
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
        <View className="h-1 bg-gradient-to-r from-indigo-400 via-indigo-500 to-purple-400" />

        <View className="p-1">
          {outboundOrders.length ? (
            <>
              <OutboundOrderItemsCard
                def={defs.outboundOrders}
                value={outboundOrders}
                onItemClick={(index: number) =>
                  setEditingOb(outboundOrders[index])
                }
                orderStatus={pipelineStatus}
                activeEntity={pipeline?.active_entity}
              />

              <OutboundAddDivider
                disabled={!optionState.includes("in_outbound")}
                onAdd={() => setEditingOb({ pipeline: pipeline.id })}
              />
            </>
          ) : (
            <OutboundOrderEmptySlot
              pipelineId={pipeline.id}
              onCreate={onUpdate}
              disabled={!optionState.includes("in_outbound")}
            />
          )}
        </View>
      </View>

      <OutboundOrderInput
        isOpen={Boolean(editingOb)}
        def={defs.outboundOrders}
        data={editingOb ?? {}}
        pipelineId={pipeline.id}
        onClose={() => setEditingOb(null)}
        onCreate={onCreate}
        onUpdate={onUpdate}
      />
    </View>
  );
}
