import React, { useMemo, useRef, useState } from "react";
import i18n from '@/locale/i18n';
import { View, ScrollView } from "react-native";
import { Button } from "antd";
import Drawer from "../../../base/Drawer.web";

import OrderSection from "./sections/OrderSection";
import ProductionOrdersSection from "../../production/nested/sections/ProductionOrdersSection";
import OutboundOrdersSection from "../../warehouse/nested/sections/OutboundOrdersSection";
import PaymentsSection from "../../finance/nested/sections/PaymentsSection";
import PurchaseOrdersSection from "../../purchase/nested/sections/PurchaseOrdersSection";
import OrderStatusDropdown from "../renderers/OrderStatusDropdown";
import { OrderDisplayProps, OrderDefs } from "../types";

export default function OrderDisplay({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  def = [],
  data,
}: OrderDisplayProps) {
  const parentNodeRef = useRef<any>(null);

  const order = data ?? {};
  const orderStatus = order.status;

  // Extract pipeline from order (for nested entities that require pipeline)
  const pipeline = order.related_pipeline || order;

  const {
    production_orders = [],
    outbound_orders = [],
    payments = [],
    purchase_orders = [],
    allowed_actions = [],
  } = order;

  /* ========================
   * Defs split & existence check
   * ======================== */
  const defs: OrderDefs = useMemo(() => {
    const pick = (field: string) => def.find((d) => d.field === field);

    return {
      base: def.filter(
        (d) =>
          ![
            "production_orders",
            "outbound_orders",
            "payments",
            "purchase_orders",
            "allowed_actions",
          ].includes(d.field)
      ),
      productionOrders: pick("production_orders"),
      outboundOrders: pick("outbound_orders"),
      payments: pick("payments"),
      purchaseOrders: pick("purchase_orders"),
    };
  }, [def]);

  const hasProductionOrders = Boolean(defs.productionOrders);
  const hasOutboundOrders = Boolean(defs.outboundOrders);
  const hasPayments = Boolean(defs.payments);
  const hasPurchaseOrders = Boolean(defs.purchaseOrders);

  /* ========================
   * Editing states
   * ======================== */
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  const [editingProd, setEditingProd] = useState<any | null>(null);
  const [editingOb, setEditingOb] = useState<any | null>(null);
  const [editingPayment, setEditingPayment] = useState<any | null>(null);
  const [editingPurchase, setEditingPurchase] = useState<any | null>(null);

  /* ========================
   * DisplayForm config
   * ======================== */
  const displayConfig = useMemo(
    () => ({
      contact_id: {
        hidden: true, // Hidden - only used for write operations
      },
    }),
    []
  );

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title={i18n.t("Order Details")}
      footer={
        <View className="flex-row justify-end p-2 gap-1">
          <OrderStatusDropdown
            orderId={order.id}
            stateActions={allowed_actions}
            onSuccess={onUpdate}
          />
          <Button onClick={onClose}>{i18n.t("Close")}</Button>
        </View>
      }
    >
      <ScrollView
        ref={parentNodeRef}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Order Information */}
        <OrderSection
          order={order}
          orderStatus={orderStatus}
          defs={defs}
          displayConfig={displayConfig}
          editingOrder={editingOrder}
          setEditingOrder={setEditingOrder}
          onCreate={onCreate}
          onUpdate={onUpdate}
        />

        {/* Purchase Orders */}
        {hasPurchaseOrders && (
          <PurchaseOrdersSection
            order={order}
            orderStatus={orderStatus}
            purchaseOrders={purchase_orders}
            defs={defs}
            displayConfig={displayConfig}
            optionState={allowed_actions}
            editingPurchase={editingPurchase}
            setEditingPurchase={setEditingPurchase}
            onCreate={onCreate}
            onUpdate={onUpdate}
          />
        )}

        {/* Production Orders */}
        {hasProductionOrders && (
          <ProductionOrdersSection
            order={order}
            orderStatus={orderStatus}
            productionOrders={production_orders}
            defs={defs}
            displayConfig={displayConfig}
            optionState={allowed_actions}
            editingProd={editingProd}
            setEditingProd={setEditingProd}
            onCreate={onCreate}
            onUpdate={onUpdate}
          />
        )}

        {/* Outbound Orders */}
        {hasOutboundOrders && (
          <OutboundOrdersSection
            pipeline={pipeline}
            pipelineStatus={pipeline.status}
            outboundOrders={outbound_orders}
            defs={defs}
            displayConfig={displayConfig}
            optionState={allowed_actions}
            editingOb={editingOb}
            setEditingOb={setEditingOb}
            onCreate={onCreate}
            onUpdate={onUpdate}
          />
        )}

        {/* Payments */}
        {hasPayments && (
          <PaymentsSection
            order={order}
            orderStatus={orderStatus}
            payments={payments}
            defs={defs}
            editingPayment={editingPayment}
            setEditingPayment={setEditingPayment}
            onCreate={onUpdate}
            onUpdate={onUpdate}
          />
        )}
      </ScrollView>
    </Drawer>
  );
}
