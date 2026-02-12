import React from "react";
import i18n from "@/locale/i18n";
import { ShoppingBagIcon, CubeIcon } from "react-native-heroicons/outline";
import { PurchaseOrdersSectionProps } from "@/components/sea-saw-page/sales/order/display/types";
import {
  SectionWrapper,
  SectionHeader,
  SectionStatsBadge,
  SectionContentCard,
} from "@/components/sea-saw-page/base";
import PurchaseOrderCard from "@/components/sea-saw-page/procurement/purchase-order/display/PurchaseOrderCard";
import PurchaseAddDivider from "@/components/sea-saw-page/procurement/purchase-order/display/shared/PurchaseAddDivider";
import PurchaseOrderEmptySlot from "@/components/sea-saw-page/procurement/purchase-order/display/shared/PurchaseOrderEmptySlot";
import PurchaseOrderInput from "@/components/sea-saw-page/procurement/purchase-order/input/PurchaseOrderInput";

export default function PurchaseOrdersSection({
  order,
  orderStatus,
  purchaseOrders,
  def,
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

  // Generate subtitle text
  const subtitle =
    purchaseCount > 0
      ? `${purchaseCount} ${i18n.t("record")}${purchaseCount > 1 ? "s" : ""}`
      : undefined;

  // Generate stats badge
  const statsBadge =
    purchaseCount > 0 && totalItems > 0 ? (
      <SectionStatsBadge
        icon={<CubeIcon size={14} color="#64748b" />}
        label={`${totalItems} ${i18n.t("items")}`}
      />
    ) : undefined;

  return (
    <SectionWrapper>
      <SectionHeader
        icon={<ShoppingBagIcon size={20} color="#ffffff" />}
        iconGradient="from-purple-500 to-purple-600"
        iconShadow="shadow-purple-500/25"
        title={i18n.t("Purchase Order")}
        subtitle={subtitle}
        rightContent={statsBadge}
      />

      <SectionContentCard gradientColors="from-purple-400 via-purple-500 to-pink-400">
        {purchaseOrders.length ? (
          <>
            <PurchaseOrderCard
              def={def}
              value={purchaseOrders}
              onItemClick={(index: number) =>
                setEditingPurchase(purchaseOrders[index])
              }
              orderStatus={orderStatus}
              activeEntity={order?.active_entity}
            />

            <PurchaseAddDivider
              disabled={!optionState.includes("in_purchase") && !optionState.includes("in_purchase_and_production")}
              onAdd={() => setEditingPurchase({ order: order.id })}
            />
          </>
        ) : (
          <PurchaseOrderEmptySlot
            orderId={order.id}
            onCreate={onUpdate}
            disabled={!optionState.includes("in_purchase") && !optionState.includes("in_purchase_and_production")}
          />
        )}
      </SectionContentCard>

      <PurchaseOrderInput
        mode="nested"
        isOpen={Boolean(editingPurchase)}
        def={def}
        data={editingPurchase ?? {}}
        pipelineId={order.id}
        onClose={() => setEditingPurchase(null)}
        onCreate={onCreate}
        onUpdate={onUpdate}
      />
    </SectionWrapper>
  );
}
