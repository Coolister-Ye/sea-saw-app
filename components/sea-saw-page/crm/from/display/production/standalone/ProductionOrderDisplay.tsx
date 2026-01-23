import React, { useState, useRef } from "react";
import i18n from '@/locale/i18n';
import { View, ScrollView } from "react-native";
import { Button } from "antd";
import Drawer from "../../../base/Drawer.web";
import Section from "../../../base/Section";
import DisplayForm from "@/components/sea-saw-design/form/DisplayForm";
import { ProductionOrderInputStandalone as ProductionOrderInput } from "../../../input/production";
import { OrderPopover } from "../../order";
import ProductionItemsViewToggle from "../items/ProductionItemsViewToggle";
import ProductionStatusTag from "../renderers/ProductionStatusTag";
import { AttachmentsDisplay } from "@/components/sea-saw-design/attachments";

interface ProductionOrderDisplayProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate?: (res: any) => void;
  onUpdate?: (res: any) => void;
  def?: any[];
  data?: Record<string, any> | null;
}

export default function ProductionOrderDisplay({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  def = [],
  data,
}: ProductionOrderDisplayProps) {
  const parentNodeRef = useRef<any>(null);

  const productionOrder = data ?? {};

  /* ========================
   * Editing state
   * ======================== */
  const [editingProductionOrder, setEditingProductionOrder] = useState<
    any | null
  >(null);

  /* ========================
   * DisplayForm custom config
   * ======================== */
  const displayConfig = {
    status: {
      render: (def: any, value: any) => (
        <ProductionStatusTag value={value} def={def} />
      ),
    },
    related_order: {
      render: (def: any, value: any) => (
        <OrderPopover def={def} value={value} />
      ),
    },
    production_items: {
      fullWidth: true,
      render: (def: any, value: any) => (
        <ProductionItemsViewToggle def={def} value={value} />
      ),
    },
    attachments: {
      fullWidth: true,
      render: (def: any, value: any) => <AttachmentsDisplay value={value} />,
    },
  };

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title={i18n.t("Production Order Details")}
      footer={
        <View className="flex-row justify-end p-2 gap-1">
          <Button onClick={onClose}>{i18n.t("Close")}</Button>
          <Button
            type="primary"
            onClick={() => setEditingProductionOrder(productionOrder)}
          >
            {i18n.t("Edit")}
          </Button>
        </View>
      }
    >
      <ScrollView
        ref={parentNodeRef}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ================= Production Order Information ================= */}
        <Section>
          <DisplayForm
            table="productionOrder"
            def={def}
            data={productionOrder}
            config={displayConfig}
            onEdit={() => setEditingProductionOrder(productionOrder)}
          />
          <ProductionOrderInput
            isOpen={Boolean(editingProductionOrder)}
            def={def}
            data={editingProductionOrder ?? {}}
            onClose={() => {
              setEditingProductionOrder(null);
            }}
            onCreate={onCreate}
            onUpdate={onUpdate}
          />
        </Section>
      </ScrollView>
    </Drawer>
  );
}
