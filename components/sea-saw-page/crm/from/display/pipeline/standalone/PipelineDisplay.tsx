import React, { useMemo, useRef, useState } from "react";
import { View, ScrollView } from "react-native";
import { Button } from "antd";
import { useLocale } from "@/context/Locale";

import Drawer from "../../../base/Drawer.web";

import PipelineSection from "./sections/PipelineSection";
import OrdersSection from "../../order/nested/sections/OrdersSection";
import ProductionOrdersSection from "../../production/nested/sections/ProductionOrdersSection";
import PurchaseOrdersSection from "../../purchase/nested/sections/PurchaseOrdersSection";
import OutboundOrdersSection from "../../warehouse/nested/sections/OutboundOrdersSection";
import PaymentsSection from "../../finance/nested/sections/PaymentsSection";
import PipelineStatusDropdown from "../renderers/PipelineStatusDropdown";
import { PipelineDisplayProps, PipelineDefs } from "../types";

export default function PipelineDisplay({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  def = [],
  data,
}: PipelineDisplayProps) {
  const { i18n } = useLocale();
  const parentNodeRef = useRef<any>(null);

  const pipeline = data ?? {};

  const {
    order,
    production_orders = [],
    purchase_orders = [],
    outbound_orders = [],
    payments = [],
    allowed_actions = [],
  } = pipeline;

  // Convert single order to array for OrdersSection compatibility
  const orders = order ? [order] : [];

  /* ========================
   * Defs split & existence check
   * ======================== */
  const defs: PipelineDefs = useMemo(() => {
    const pick = (field: string) => def.find((d) => d.field === field);

    return {
      base: def.filter(
        (d) =>
          ![
            "order",
            "orders",
            "production_orders",
            "purchase_orders",
            "outbound_orders",
            "payments",
            "allowed_actions",
          ].includes(d.field)
      ),
      // Support both "order" (single) and "orders" (array) field names
      orders: pick("order") || pick("orders"),
      productionOrders: pick("production_orders"),
      purchaseOrders: pick("purchase_orders"),
      outboundOrders: pick("outbound_orders"),
      payments: pick("payments"),
    };
  }, [def]);

  const hasOrders = Boolean(defs.orders);
  const hasProductionOrders = Boolean(defs.productionOrders);
  const hasPurchaseOrders = Boolean(defs.purchaseOrders);
  const hasOutboundOrders = Boolean(defs.outboundOrders);
  const hasPayments = Boolean(defs.payments);

  /* ========================
   * Editing states
   * ======================== */
  const [editingPipeline, setEditingPipeline] = useState<any | null>(null);
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  const [editingProd, setEditingProd] = useState<any | null>(null);
  const [editingPurchase, setEditingPurchase] = useState<any | null>(null);
  const [editingOb, setEditingOb] = useState<any | null>(null);
  const [editingPayment, setEditingPayment] = useState<any | null>(null);

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
      title={i18n.t("Pipeline Details")}
      footer={
        <View className="flex-row justify-end p-2 gap-1">
          <PipelineStatusDropdown
            pipelineId={pipeline.id}
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
        {/* Pipeline Information */}
        <PipelineSection
          pipeline={pipeline}
          defs={defs}
          displayConfig={displayConfig}
          editingPipeline={editingPipeline}
          setEditingPipeline={setEditingPipeline}
          onCreate={onCreate}
          onUpdate={onUpdate}
        />

        {/* Orders */}
        {hasOrders && (
          <OrdersSection
            pipeline={pipeline}
            orders={orders}
            defs={defs}
            displayConfig={displayConfig}
            editingOrder={editingOrder}
            setEditingOrder={setEditingOrder}
            onCreate={onCreate}
            onUpdate={onUpdate}
          />
        )}

        {/* Purchase Orders */}
        {hasPurchaseOrders && (
          <PurchaseOrdersSection
            order={pipeline}
            orderStatus={pipeline.status}
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
            order={pipeline}
            orderStatus={pipeline.status}
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
            order={pipeline}
            orderStatus={pipeline.status}
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
