import React, { useMemo } from "react";
import { View } from "react-native";
import { Divider as AntDivider } from "antd";
import { useLocale } from "@/context/Locale";
import Section from "../../../base/Section";
import DisplayForm from "@/components/sea-saw-design/form/DisplayForm";
import { ProductionOrderInput } from "../../../input/production";
import { AttachmentsDisplay, ProductionOrderEmptySlot } from "../../shared";
import { ProductionOrdersSectionProps } from "../types";
import ProductionItemsViewToggle from "../../production/items/ProductionItemsViewToggle";
import ProductionStatusTag from "../../production/renderers/ProductionStatusTag";

export default function ProductionOrdersSection({
  order,
  orderStatus,
  productionOrders,
  defs,
  displayConfig,
  optionState,
  editingProd,
  setEditingProd,
  onCreate,
  onUpdate,
}: ProductionOrdersSectionProps) {
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
      production_items: {
        fullWidth: true,
        render: (f: any, v: any[]) => (
          <ProductionItemsViewToggle def={f} value={v} />
        ),
      },
      status: {
        render: (f: any, v: any) => <ProductionStatusTag def={f} value={v} />,
      },
      attachments: {
        render: (f: any, v: any[]) => <AttachmentsDisplay value={v} />,
      },
      ...displayConfig,
    }),
    []
  );

  return (
    <Section title={i18n.t("Production Order")}>
      {productionOrders.length ? (
        renderWithDivider(productionOrders, (prod) => (
          <View className="mb-4">
            <DisplayForm
              table="production_order"
              def={defs.productionOrders}
              data={prod}
              config={_displayConfig}
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
        mode="nested"
        isOpen={Boolean(editingProd)}
        def={defs.productionOrders}
        data={editingProd ?? {}}
        orderId={order?.id}
        onClose={() => setEditingProd(null)}
        onCreate={onCreate}
        onUpdate={onUpdate}
      />
    </Section>
  );
}
