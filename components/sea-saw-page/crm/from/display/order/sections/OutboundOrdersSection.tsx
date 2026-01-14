import React, { useMemo } from "react";
import { View } from "react-native";
import { Divider as AntDivider } from "antd";
import { useLocale } from "@/context/Locale";
import Section from "../../../base/Section";
import DisplayForm from "@/components/sea-saw-design/form/DisplayForm";
import { OutboundOrderInput } from "../../../input/order";
import { OutboundOrderEmptySlot } from "../../shared";
import { OutboundOrdersSectionProps } from "../types";
import OutboundItemsViewToggle from "../outbound/OutboundItemsViewToggle";
import OutboundStatusTag from "../outbound/OutboundStatusTag";
import AttachmentsDisplay from "../../shared/AttachmentsDisplay";

export default function OutboundOrdersSection({
  order,
  orderStatus,
  outboundOrders,
  defs,
  displayConfig,
  optionState,
  editingOb,
  setEditingOb,
  onCreate,
  onUpdate,
}: OutboundOrdersSectionProps) {
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
        render: (f: any, v: any) => <OutboundStatusTag def={f} value={v} />,
      },
      outbound_items: {
        fullWidth: true,
        render: (f: any, v: any[]) => (
          <OutboundItemsViewToggle def={f} value={v} />
        ),
      },
      attachments: {
        fullWidth: true,
        render: (f: any, v: any) => <AttachmentsDisplay value={v} />,
      },
      ...displayConfig,
    }),
    []
  );

  return (
    <Section title={i18n.t("Outbound Order")}>
      {outboundOrders.length ? (
        renderWithDivider(outboundOrders, (ob) => (
          <View className="mb-4">
            <DisplayForm
              table="outbound_order"
              def={defs.outboundOrders}
              data={ob}
              config={_displayConfig}
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
  );
}
