import React from "react";
import i18n from "@/locale/i18n";
import {
  WrenchScrewdriverIcon,
  CubeIcon,
} from "react-native-heroicons/outline";
import { ProductionOrdersSectionProps } from "@/components/sea-saw-page/sales/order/display/types";
import {
  SectionWrapper,
  SectionHeader,
  SectionStatsBadge,
  SectionContentCard,
} from "@/components/sea-saw-page/base";
import ProductionAddDivider from "@/components/sea-saw-page/production/production-order/display/shared/ProductionAddDivider";
import ProductionOrderEmptySlot from "@/components/sea-saw-page/production/production-order/display/shared/ProductionOrderEmptySlot";
import ProductionOrderInput from "@/components/sea-saw-page/production/production-order/input/ProductionOrderInput";
import ProductionOrderCard from "@/components/sea-saw-page/production/production-order/display/ProductionOrderCard";

export default function ProductionOrdersSection({
  order,
  orderStatus,
  productionOrders,
  def,
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

  // Generate subtitle text
  const subtitle =
    productionCount > 0
      ? `${productionCount} ${i18n.t("record")}${productionCount > 1 ? "s" : ""}`
      : undefined;

  // Generate stats badge
  const statsBadge =
    productionCount > 0 && totalItems > 0 ? (
      <SectionStatsBadge
        icon={<CubeIcon size={14} color="#64748b" />}
        label={`${totalItems} ${i18n.t("items")}`}
      />
    ) : undefined;

  return (
    <SectionWrapper>
      <SectionHeader
        icon={<WrenchScrewdriverIcon size={20} color="#ffffff" />}
        iconGradient="from-amber-500 to-amber-600"
        iconShadow="shadow-amber-500/25"
        title={i18n.t("Production Order")}
        subtitle={subtitle}
        rightContent={statsBadge}
      />

      <SectionContentCard gradientColors="from-amber-400 via-amber-500 to-orange-400">
        {productionOrders.length ? (
          <>
            <ProductionOrderCard
              def={def}
              value={productionOrders}
              onItemClick={(index: number) =>
                setEditingProd(productionOrders[index])
              }
              orderStatus={orderStatus}
              activeEntity={order?.active_entity}
            />

            <ProductionAddDivider
              disabled={!optionState.includes("in_production") && !optionState.includes("in_purchase_and_production")}
              onAdd={() => setEditingProd({ order: order.id })}
            />
          </>
        ) : (
          <ProductionOrderEmptySlot
            pipelineId={order.id}
            disabled={!optionState.includes("in_production") && !optionState.includes("in_purchase_and_production")}
            onCreate={onUpdate}
          />
        )}
      </SectionContentCard>

      <ProductionOrderInput
        isOpen={Boolean(editingProd)}
        def={def}
        data={editingProd ?? {}}
        pipelineId={order.id}
        onClose={() => setEditingProd(null)}
        onCreate={onCreate}
        onUpdate={onUpdate}
        mode="nested"
      />
    </SectionWrapper>
  );
}
