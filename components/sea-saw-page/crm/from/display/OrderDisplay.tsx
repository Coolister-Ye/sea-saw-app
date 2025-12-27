import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, ScrollView, ActivityIndicator } from "react-native";
import { Button, Divider } from "antd";
import { useLocale } from "@/context/Locale";

import Drawer from "../base/Drawer.web";
import Section from "../base/Section";

import DisplayForm from "@/components/sea-saw-design/form/DisplayForm";
import ContactPopover from "./ContactPopover";
import ProductDisplay from "./ProductDisplay";

import ProductionOrderInput from "../input/ProductionOrderInput";
import OutboundOrderInput from "../input/OutboundOrderInput";
import OrderInput from "../input/OrderInput";
import PaymentInput from "../input/PaymentInput";

import ProductionOrderEmptySlot from "./ProductionOrderEmptySlot";
import OutboundOrderEmptySlot from "./OutboundOrderEmptySlot";
import PaymentEmptySlot from "./PaymentEmptySlot";

import OrderStatusDropdown from "../../common/OrderStatusDropdown";
import useDataService from "@/hooks/useDataService";
import PaymentAddDivider from "./PaymentAddDivider";

interface OrderDisplayProps {
  isOpen: boolean;
  onClose: () => void;

  onEditOrder?: (order: any) => void;
  onEditProductionOrder?: (prod: any) => void;
  onEditOutboundOrder?: (ob: any) => void;
  onEditPayment?: (payment: any) => void;

  onCreate?: (res: any) => void;
  onUpdate?: (res: any) => void;

  def?: any[];
  data?: Record<string, any> | null;
}

export default function OrderDisplay({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  def = [],
  data,
}: OrderDisplayProps) {
  const { i18n } = useLocale();
  const parentNodeRef = useRef<any>(null);

  const order = data ?? {};
  const orderStatus = order.status;

  const {
    production_orders = [],
    outbound_orders = [],
    payments = [],
    ...baseData
  } = order;

  /* ========================
   * defs 拆分 & 是否存在
   * ======================== */
  const defs = useMemo(() => {
    const pick = (field: string) => def.find((d) => d.field === field);

    return {
      base: def.filter(
        (d) =>
          !["production_orders", "outbound_orders", "payments"].includes(
            d.field
          )
      ),
      productionOrders: pick("production_orders"),
      outboundOrders: pick("outbound_orders"),
      payments: pick("payments"),
    };
  }, [def]);

  const hasProductionOrders = Boolean(defs.productionOrders);
  const hasOutboundOrders = Boolean(defs.outboundOrders);
  const hasPayments = Boolean(defs.payments);

  /* ========================
   * Action option state
   * ======================== */
  const { request } = useDataService();
  const [optionState, setOptionState] = useState<string[]>([]);
  const [isLoadingState, setIsLoadingState] = useState(false);

  useEffect(() => {
    if (!order?.id) return;

    setIsLoadingState(true);
    request({
      uri: "updateOrders",
      method: "OPTIONS",
      id: order.id,
    })
      .then((data) => {
        setOptionState(data?.state_actions ?? []);
      })
      .catch(() => setOptionState([]))
      .finally(() => setIsLoadingState(false));
  }, [order?.id, request]);

  /* ========================
   * Editing states
   * ======================== */
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  const [editingProd, setEditingProd] = useState<any | null>(null);
  const [editingOb, setEditingOb] = useState<any | null>(null);
  const [editingPayment, setEditingPayment] = useState<any | null>(null);

  /* ========================
   * DisplayForm config
   * ======================== */
  const displayConfig = {
    contact: {
      render: (f: any, v: any) => <ContactPopover def={f} value={v} />,
    },
    order_items: {
      fullWidth: true,
      render: (f: any, v: any[]) => <ProductDisplay def={f} value={v} />,
    },
    production_items: {
      fullWidth: true,
      render: (f: any, v: any[]) => <ProductDisplay def={f} value={v} />,
    },
    outbound_items: {
      fullWidth: true,
      render: (f: any, v: any[]) => <ProductDisplay def={f} value={v} />,
    },
  };

  /* ========================
   * 抽象 Divider 渲染
   * ======================== */
  const renderWithDivider = (
    items: any[],
    renderItem: (item: any) => React.ReactNode
  ) =>
    items.map((item, index) => (
      <React.Fragment key={item.id ?? index}>
        {renderItem(item)}
        {index < items.length - 1 && <Divider />}
      </React.Fragment>
    ));

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title={i18n.t("Order Details")}
      loading={isLoadingState}
      footer={
        <View className="flex-row justify-end p-2 gap-1">
          <Button onClick={onClose}>{i18n.t("Close")}</Button>
          <OrderStatusDropdown
            orderId={order.id}
            stateActions={optionState}
            onSuccess={onUpdate}
          />
        </View>
      }
    >
      <ScrollView
        ref={parentNodeRef}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ================= Order ================= */}
        <Section title={i18n.t("Order Information")}>
          <DisplayForm
            table="order"
            def={defs.base}
            data={baseData}
            config={displayConfig}
            onEdit={
              orderStatus === "draft" ? () => setEditingOrder(order) : undefined
            }
          />
          <OrderInput
            isOpen={Boolean(editingOrder)}
            def={defs.base}
            data={editingOrder ?? {}}
            onClose={() => {
              setEditingOrder(null);
            }}
            onCreate={onCreate}
            onUpdate={onUpdate}
          />
        </Section>

        {/* ================= Production Orders ================= */}
        {hasProductionOrders && (
          <Section title={i18n.t("Production Order")}>
            {production_orders.length ? (
              renderWithDivider(production_orders, (prod) => (
                <View className="mb-4">
                  <DisplayForm
                    table="production_order"
                    def={defs.productionOrders}
                    data={prod}
                    config={displayConfig}
                    onEdit={
                      orderStatus === "in_production"
                        ? () => setEditingProd(prod)
                        : undefined
                    }
                  />
                </View>
              ))
            ) : (
              <ProductionOrderEmptySlot
                orderId={order.id}
                disabled={!optionState.includes("in_production")}
                onCreate={onUpdate}
              />
            )}

            <ProductionOrderInput
              isOpen={Boolean(editingProd)}
              def={defs.productionOrders}
              data={editingProd ?? {}}
              orderId={order.id}
              onClose={() => setEditingProd(null)}
              onCreate={onCreate}
              onUpdate={onUpdate}
            />
          </Section>
        )}

        {/* ================= Outbound Orders ================= */}
        {hasOutboundOrders && (
          <Section title={i18n.t("Outbound Order")}>
            {outbound_orders.length ? (
              renderWithDivider(outbound_orders, (ob) => (
                <View className="mb-4">
                  <DisplayForm
                    table="outbound_order"
                    def={defs.outboundOrders}
                    data={ob}
                    config={displayConfig}
                    onEdit={
                      orderStatus === "in_outbound"
                        ? () => setEditingOb(ob)
                        : undefined
                    }
                  />
                </View>
              ))
            ) : (
              <OutboundOrderEmptySlot
                orderId={order.id}
                disabled={!optionState.includes("in_outbound")}
                onCreate={onUpdate}
              />
            )}

            <OutboundOrderInput
              isOpen={Boolean(editingOb)}
              def={defs.outboundOrders}
              data={editingOb ?? {}}
              orderId={order.id}
              onClose={() => setEditingOb(null)}
              onCreate={onCreate}
              onUpdate={onUpdate}
            />
          </Section>
        )}

        {/* ================= Payments ================= */}
        {hasPayments && (
          <Section title={i18n.t("Payments")}>
            {payments.length ? (
              <>
                {renderWithDivider(payments, (pay) => (
                  <View className="mb-4">
                    <DisplayForm
                      table="payment"
                      def={defs.payments}
                      data={pay}
                      onEdit={() => setEditingPayment(pay)}
                    />
                  </View>
                ))}

                {/* 👇 新增：底部 Add Divider */}
                <PaymentAddDivider
                  disabled={["cancelled", "completed"].includes(orderStatus)}
                  onAdd={() => setEditingPayment({ order: order.id })}
                />
              </>
            ) : (
              <PaymentEmptySlot
                orderId={order.id}
                onCreate={() => setEditingPayment({ order: order.id })}
                disabled={["cancelled", "completed"].includes(orderStatus)}
              />
            )}

            <PaymentInput
              isOpen={Boolean(editingPayment)}
              def={defs.payments}
              data={editingPayment ?? {}}
              orderId={order.id}
              onClose={() => setEditingPayment(null)}
              onCreate={onCreate}
              onUpdate={onUpdate}
            />
          </Section>
        )}
      </ScrollView>
    </Drawer>
  );
}
