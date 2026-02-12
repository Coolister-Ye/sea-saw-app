import React, { useCallback, useMemo } from "react";
import i18n from "@/locale/i18n";
import { ScrollView } from "react-native";

import InputForm from "@/components/sea-saw-design/form/InputForm";
import PurchaseOrderItemsInput from "./shared/items/PurchaseOrderItemsInput";
import PurchaseOrderStatusSelector from "./shared/selectors/PurchaseOrderStatusSelector";
import PurchaseRelatedOrderSelector from "./shared/selectors/PurchaseRelatedOrderSelector";
import AccountSelector from "@/components/sea-saw-page/crm/account/input/AccountSelector";
import AttachmentInput from "@/components/sea-saw-page/base/attachments/AttachmentInput";
import { Drawer, InputFooter } from "@/components/sea-saw-page/base";
import useOrderDrawerForm from "@/hooks/useOrderDrawerForm";

interface PurchaseOrderInputProps {
  mode?: "nested" | "standalone";
  isOpen: boolean;
  onClose: (res?: any) => void;
  onCreate?: (res?: any) => void;
  onUpdate?: (res?: any) => void;
  def: any;
  data?: {
    id?: string | number;
    [key: string]: any;
  };
  pipelineId?: string | number;
}

export default function PurchaseOrderInput({
  mode = "standalone",
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  def,
  data = {},
  pipelineId,
}: PurchaseOrderInputProps) {
  const normalizePayload = useCallback(
    (values: any) => ({
      ...values,
      related_order:
        values.related_order?.id ||
        values.related_order?.pk ||
        values.related_order,
    }),
    [],
  );

  const { form, loading, contextHolder, isEdit, handleSave } =
    useOrderDrawerForm({
      mode,
      isOpen,
      data,
      pipelineId,
      nestedViewSetKey: "nestedPurchaseOrder",
      standaloneViewSetKey: "purchaseOrder",
      nestedParamName: "pipeline",
      normalizePayload,
      entityName: "Purchase order",
      onClose,
      onCreate,
      onUpdate,
    });

  const config = useMemo(
    () => ({
      status: {
        render: (def: any) => <PurchaseOrderStatusSelector def={def} />,
      },
      supplier: {
        render: (def: any) => (
          <AccountSelector def={def} roleFilter="supplier" />
        ),
      },
      attachments: {
        fullWidth: true,
        render: (def: any, value: any[] = [], onChange: (v: any[]) => void) => (
          <AttachmentInput def={def} value={value} onChange={onChange} />
        ),
      },
      purchase_items: {
        fullWidth: true,
        render: (def: any, value: any[] = [], onChange: (v: any[]) => void) => (
          <PurchaseOrderItemsInput
            def={def}
            value={value}
            onChange={onChange}
            showToolbar={mode === "standalone"}
          />
        ),
      },
      related_order: {
        hidden: mode === "nested",
        render: (def: any) => <PurchaseRelatedOrderSelector def={def} />,
      },
    }),
    [mode],
  );

  const drawerTitle = isEdit
    ? i18n.t("Edit Purchase Order")
    : i18n.t("Create Purchase Order");

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title={drawerTitle}
      footer={
        <InputFooter loading={loading} onSave={handleSave} onCancel={onClose} />
      }
    >
      {contextHolder}

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <InputForm
          table="purchase_order"
          form={form}
          def={def}
          data={data}
          config={config}
        />
      </ScrollView>
    </Drawer>
  );
}
