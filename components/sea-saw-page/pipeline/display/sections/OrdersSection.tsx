import React from "react";
import i18n from "@/locale/i18n";
import { ShoppingCartIcon, CubeIcon } from "react-native-heroicons/outline";
import OrderCard from "@/components/sea-saw-page/sales/order/display/items/OrderCard";
import OrderInput from "@/components/sea-saw-page/sales/order/input/OrderInput";
import {
  SectionWrapper,
  SectionHeader,
  SectionStatsBadge,
  SectionContentCard,
} from "@/components/sea-saw-page/base";

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

  // Generate subtitle text
  const subtitle =
    orderCount > 0
      ? `${orderCount} ${i18n.t("record")}${orderCount > 1 ? "s" : ""}`
      : undefined;

  // Generate stats badge
  const statsBadge =
    orderCount > 0 && totalItems > 0 ? (
      <SectionStatsBadge
        icon={<CubeIcon size={14} color="#64748b" />}
        label={`${totalItems} ${i18n.t("items")}`}
      />
    ) : undefined;

  return (
    <SectionWrapper>
      <SectionHeader
        icon={<ShoppingCartIcon size={20} color="#ffffff" />}
        iconGradient="from-blue-500 to-blue-600"
        iconShadow="shadow-blue-500/25"
        title={i18n.t("Orders")}
        subtitle={subtitle}
        rightContent={statsBadge}
      />

      <SectionContentCard gradientColors="from-blue-400 via-blue-500 to-cyan-400">
        <OrderCard
          def={defs.orders}
          value={orders}
          onItemClick={(index: number) => setEditingOrder(orders[index])}
          pipelineStatus={pipeline?.status}
        />
      </SectionContentCard>

      <OrderInput
        mode="nested"
        isOpen={Boolean(editingOrder)}
        def={defs.orders}
        data={editingOrder ?? {}}
        pipelineId={pipeline?.id}
        onClose={() => setEditingOrder(null)}
        onCreate={onCreate}
        onUpdate={onUpdate}
      />
    </SectionWrapper>
  );
}
