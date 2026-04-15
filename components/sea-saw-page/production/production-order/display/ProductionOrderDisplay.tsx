import React, { useState } from "react";
import i18n from "@/locale/i18n";
import { View, ScrollView } from "react-native";
import { Button } from "antd";

import { Drawer, SectionContainer } from "@/components/sea-saw-page/base";
import ProductionOrderCard from "./ProductionOrderCard";
import ProductionOrderInput from "../input/ProductionOrderInput";
import type { ProductionOrderDisplayProps } from "./types";
import { canEditProductionOrder, SubEntityStatus } from "@/constants/PipelineStatus";

/**
 * ProductionOrderDisplay - Standalone Production Order View
 *
 * Displays Production Order information using ProductionOrderCard.
 * Allows editing via ProductionOrderInput drawer.
 * canEdit is determined by pipeline status (if linked) or order status (if standalone).
 */
export default function ProductionOrderDisplay({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  def = [],
  data,
}: ProductionOrderDisplayProps) {
  const productionOrder = data ?? {};
  const hasPipeline = Boolean(productionOrder.related_pipeline?.id);
  const pipelineStatus = productionOrder.related_pipeline?.status as string | undefined;
  const activeEntity = productionOrder.related_pipeline?.active_entity as string | undefined;

  const canEdit = hasPipeline
    ? canEditProductionOrder(pipelineStatus ?? "", activeEntity ?? "")
    : productionOrder.status !== SubEntityStatus.COMPLETED &&
      productionOrder.status !== SubEntityStatus.CANCELLED;

  const [editingProductionOrder, setEditingProductionOrder] = useState<any>(null);

  const handleUpdateSuccess = (res?: any) => {
    setEditingProductionOrder(null);
    onUpdate?.(res);
  };

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title={i18n.t("Production Order Details")}
      footer={
        <View className="flex-row justify-end p-2 gap-2">
          <Button onClick={onClose}>{i18n.t("Close")}</Button>
        </View>
      }
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <SectionContainer
          title={i18n.t("Production Order Information")}
          contentClassName="border-none"
        >
          <ProductionOrderCard
            def={def}
            value={[productionOrder]}
            canEdit={canEdit}
            onItemClick={() => setEditingProductionOrder(productionOrder)}
            hideEmptyFields
          />
          <ProductionOrderInput
            mode="standalone"
            isOpen={Boolean(editingProductionOrder)}
            def={def}
            data={editingProductionOrder ?? {}}
            onClose={() => setEditingProductionOrder(null)}
            onCreate={onCreate}
            onUpdate={handleUpdateSuccess}
          />
        </SectionContainer>
      </ScrollView>
    </Drawer>
  );
}
