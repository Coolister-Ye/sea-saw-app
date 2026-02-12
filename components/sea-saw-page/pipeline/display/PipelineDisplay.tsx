import React, { useCallback, useMemo, useState } from "react";
import i18n from "@/locale/i18n";
import { View, ScrollView } from "react-native";
import { Button } from "antd";
import { Drawer } from "@/components/sea-saw-page/base";
import { getChildrenFormDefs } from "@/utils/formDefUtils";

import PipelineSection from "./sections/PipelineSection";
import OrdersSection from "./sections/OrdersSection";
import ProductionOrdersSection from "@/components/sea-saw-page/pipeline/display/sections/ProductionOrdersSection";
import PurchaseOrdersSection from "@/components/sea-saw-page/pipeline/display/sections/PurchaseOrdersSection";
import OutboundOrdersSection from "@/components/sea-saw-page/pipeline/display/sections/OutboundOrdersSection";
import PaymentsSection from "@/components/sea-saw-page/pipeline/display/sections/PaymentsSection";
import PipelineStatusDropdown from "./renderers/PipelineStatusDropdown";
import { PipelineDisplayProps } from "./types";

// Static config - extract to component level to avoid recreating on every render
const DISPLAY_CONFIG = {
  company_id: { hidden: true },
  contact_id: { hidden: true },
} as const;

export default function PipelineDisplay({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  defs,
  data,
}: PipelineDisplayProps) {
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
  const orders = useMemo(() => (order ? [order] : []), [order]);

  // Visibility checks
  const visibility = useMemo(
    () => ({
      hasOrders: Boolean(defs.orders),
      hasProductionOrders: Boolean(defs.productionOrders),
      hasPurchaseOrders: Boolean(defs.purchaseOrders),
      hasOutboundOrders: Boolean(defs.outboundOrders),
      hasPayments: Boolean(defs.payments),
    }),
    [defs],
  );

  // Get status def from base defs
  const statusDef = useMemo(
    () => defs.base.find((d) => d.field === "status"),
    [defs.base],
  );

  // Merged editing state - all sections share one state object
  const [editing, setEditing] = useState<{
    pipeline: any | null;
    order: any | null;
    prod: any | null;
    purchase: any | null;
    ob: any | null;
    payment: any | null;
  }>({ pipeline: null, order: null, prod: null, purchase: null, ob: null, payment: null });

  const setEditingPipeline = useCallback((v: any) => setEditing((e) => ({ ...e, pipeline: v })), []);
  const setEditingOrder = useCallback((v: any) => setEditing((e) => ({ ...e, order: v })), []);
  const setEditingProd = useCallback((v: any) => setEditing((e) => ({ ...e, prod: v })), []);
  const setEditingPurchase = useCallback((v: any) => setEditing((e) => ({ ...e, purchase: v })), []);
  const setEditingOb = useCallback((v: any) => setEditing((e) => ({ ...e, ob: v })), []);
  const setEditingPayment = useCallback((v: any) => setEditing((e) => ({ ...e, payment: v })), []);

  const { pipeline: editingPipeline, order: editingOrder, prod: editingProd, purchase: editingPurchase, ob: editingOb, payment: editingPayment } = editing;

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
            statusDef={statusDef}
            onSuccess={onUpdate}
          />
          <Button onClick={onClose}>{i18n.t("Close")}</Button>
        </View>
      }
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Pipeline Information */}
        <PipelineSection
          pipeline={pipeline}
          def={defs.base}
          displayConfig={DISPLAY_CONFIG}
          editingPipeline={editingPipeline}
          setEditingPipeline={setEditingPipeline}
          onCreate={onCreate}
          onUpdate={onUpdate}
        />

        {/* Orders */}
        {visibility.hasOrders && (
          <OrdersSection
            pipeline={pipeline}
            orders={orders}
            def={getChildrenFormDefs(defs.orders)}
            displayConfig={DISPLAY_CONFIG}
            editingOrder={editingOrder}
            setEditingOrder={setEditingOrder}
            onCreate={onCreate}
            onUpdate={onUpdate}
          />
        )}

        {/* Purchase Orders */}
        {visibility.hasPurchaseOrders && (
          <PurchaseOrdersSection
            order={pipeline}
            orderStatus={pipeline.status}
            purchaseOrders={purchase_orders}
            def={getChildrenFormDefs(defs.purchaseOrders)}
            displayConfig={DISPLAY_CONFIG}
            optionState={allowed_actions}
            editingPurchase={editingPurchase}
            setEditingPurchase={setEditingPurchase}
            onCreate={onCreate}
            onUpdate={onUpdate}
          />
        )}

        {/* Production Orders */}
        {visibility.hasProductionOrders && (
          <ProductionOrdersSection
            order={pipeline}
            orderStatus={pipeline.status}
            productionOrders={production_orders}
            def={getChildrenFormDefs(defs.productionOrders)}
            displayConfig={DISPLAY_CONFIG}
            optionState={allowed_actions}
            editingProd={editingProd}
            setEditingProd={setEditingProd}
            onCreate={onCreate}
            onUpdate={onUpdate}
          />
        )}

        {/* Outbound Orders */}
        {visibility.hasOutboundOrders && (
          <OutboundOrdersSection
            pipeline={pipeline}
            pipelineStatus={pipeline.status}
            outboundOrders={outbound_orders}
            def={getChildrenFormDefs(defs.outboundOrders)}
            displayConfig={DISPLAY_CONFIG}
            optionState={allowed_actions}
            editingOb={editingOb}
            setEditingOb={setEditingOb}
            onCreate={onCreate}
            onUpdate={onUpdate}
          />
        )}

        {/* Payments */}
        {visibility.hasPayments && (
          <PaymentsSection
            order={pipeline}
            orderStatus={pipeline.status}
            payments={payments}
            def={getChildrenFormDefs(defs.payments)}
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
