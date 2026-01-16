import React, { useMemo } from "react";
import { View } from "react-native";
import { Divider as AntDivider } from "antd";
import { useLocale } from "@/context/Locale";
import Section from "../../../base/Section";
import DisplayForm from "@/components/sea-saw-design/form/DisplayForm";
import { OrderInput } from "../../../input/order";
import { AttachmentsDisplay } from "../../shared";
import ProductItemsViewToggle from "../../shared/items/ProductItemsViewToggle";
import OrderStatusTag from "../../order/renderers/OrderStatusTag";
import ContactPopover from "../../contact/ContactPopover";

interface OrdersSectionProps {
  pipeline: any;
  orders: any[];
  defs: any;
  displayConfig: any;
  editingOrder: any | null;
  setEditingOrder: (data: any | null) => void;
  onCreate?: (res?: any) => void;
  onUpdate?: (res?: any) => void;
}

export default function OrdersSection({
  pipeline,
  orders,
  defs,
  displayConfig,
  editingOrder,
  setEditingOrder,
  onCreate,
  onUpdate,
}: OrdersSectionProps) {
  const { i18n } = useLocale();

  const renderWithDivider = (
    items: any[],
    renderItem: (item: any) => React.ReactNode
  ) =>
    items.map((item, index) => (
      <React.Fragment key={item.id ?? index}>
        {renderItem(item)}
        {index < items.length - 1 && <AntDivider />}
      </React.Fragment>
    ));

  const _displayConfig = useMemo(
    () => ({
      status: {
        render: (f: any, v: any) => <OrderStatusTag def={f} value={v} />,
      },
      contact: {
        render: (f: any, v: any) => <ContactPopover def={f} value={v} />,
      },
      order_items: {
        fullWidth: true,
        render: (f: any, v: any[]) => (
          <ProductItemsViewToggle def={f} value={v} />
        ),
      },
      attachments: {
        fullWidth: true,
        render: (f: any, v: any[]) => <AttachmentsDisplay def={f} value={v} />,
      },
      ...displayConfig,
    }),
    [displayConfig]
  );

  return (
    <Section title={i18n.t("Orders")}>
      {orders.length > 0 ? (
        renderWithDivider(orders, (order) => (
          <View className="mb-4">
            <DisplayForm
              table="order"
              def={defs.orders}
              data={order}
              config={_displayConfig}
              onEdit={() => setEditingOrder(order)}
            />
          </View>
        ))
      ) : (
        <View className="p-4">
          <View className="text-gray-400 text-center">
            {i18n.t("No orders yet")}
          </View>
        </View>
      )}

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
    </Section>
  );
}
