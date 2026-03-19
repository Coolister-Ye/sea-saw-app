import React, { useState } from "react";
import i18n from "@/locale/i18n";
import { ScrollView } from "react-native";

import { Drawer, SectionContainer } from "@/components/sea-saw-page/base";
import ProductionOrderCard from "./ProductionOrderCard";
import ProductionOrderInput from "../input/ProductionOrderInput";
import type { ProductionOrderDisplayProps } from "./types";

/**
 * ProductionOrderDisplay - Standalone Production Order View
 *
 * Displays Production Order information using ProductionOrderCard.
 * Allows editing via ProductionOrderInput drawer.
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

  const [editingProductionOrder, setEditingProductionOrder] =
    useState<any>(null);

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title={i18n.t("Production Order Details")}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <ProductionOrderCard
          def={def}
          value={[productionOrder]}
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
          onUpdate={onUpdate}
        />
      </ScrollView>
    </Drawer>
  );
}
