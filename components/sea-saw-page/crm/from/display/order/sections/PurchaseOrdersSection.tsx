import React, { useMemo } from "react";
import { View } from "react-native";
import { Divider as AntDivider } from "antd";
import { useLocale } from "@/context/Locale";
import Section from "../../../base/Section";
import DisplayForm from "@/components/sea-saw-design/form/DisplayForm";
import { PurchaseOrderInput } from "../../../input/purchase";
import { AttachmentsDisplay } from "../../shared";
import PurchaseOrderEmptySlot from "../../shared/PurchaseOrderEmptySlot";
import { PurchaseOrdersSectionProps } from "../types";

export default function PurchaseOrdersSection({
  order,
  orderStatus,
  purchaseOrders,
  defs,
  displayConfig,
  optionState,
  editingPurchase,
  setEditingPurchase,
  onCreate,
  onUpdate,
}: PurchaseOrdersSectionProps) {
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
      attachments: {
        render: (f: any, v: any[]) => <AttachmentsDisplay value={v} />,
      },
      ...displayConfig,
    }),
    [displayConfig]
  );

  return (
    <Section title={i18n.t("Purchase Order")}>
      {purchaseOrders.length ? (
        renderWithDivider(purchaseOrders, (purchase) => (
          <View className="mb-4">
            <DisplayForm
              table="purchase_order"
              def={defs.purchaseOrders}
              data={purchase}
              config={_displayConfig}
              onEdit={
                orderStatus === "in_purchase"
                  ? () => setEditingPurchase(purchase)
                  : undefined
              }
            />
          </View>
        ))
      ) : (
        <PurchaseOrderEmptySlot
          orderId={order?.id}
          onCreate={onCreate}
          disabled={!optionState.includes("create_purchase_order")}
        />
      )}

      <PurchaseOrderInput
        mode="nested"
        isOpen={Boolean(editingPurchase)}
        def={defs.purchaseOrders}
        data={editingPurchase ?? {}}
        orderId={order?.id}
        onClose={() => setEditingPurchase(null)}
        onCreate={onCreate}
        onUpdate={onUpdate}
      />
    </Section>
  );
}
