import React, { useMemo } from "react";
import i18n from "@/locale/i18n";
import { ScrollView } from "react-native";

import InputForm from "@/components/sea-saw-design/form/InputForm";
import OutboundOrderItemsInput from "./OutboundOrderItemsInput";
import OutboundOrderStatusSelector from "./OutboundOrderStatusSelector";
import AttachmentInput from "@/components/sea-saw-page/base/attachments/AttachmentInput";
import PurchaseRelatedPipelineSelector from "@/components/sea-saw-page/procurement/purchase-order/input/PurchaseRelatedPipelineSelector";
import { Drawer, InputFooter } from "@/components/sea-saw-page/base";
import useOrderDrawerForm from "@/hooks/useOrderDrawerForm";

const DEFAULT_VALUES = { status: "draft" };

const normalizePayload = (values: any) => {
  const payload = { ...values };
  delete payload.related_pipeline;
  payload.related_pipeline_id =
    values.related_pipeline?.id ??
    values.related_pipeline?.pk ??
    values.related_pipeline ??
    null;
  return payload;
};

interface OutboundOrderInputProps {
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
  mode?: "nested" | "standalone";
  columnOrder?: string[];
}

export default function OutboundOrderInput({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  def,
  data = {},
  pipelineId,
  mode = "standalone",
  columnOrder,
}: OutboundOrderInputProps) {
  const { form, loading, contextHolder, isEdit, handleSave } =
    useOrderDrawerForm({
      mode,
      isOpen,
      data,
      pipelineId,
      nestedViewSetKey: "nestedOutboundOrder",
      standaloneViewSetKey: "outboundOrder",
      nestedParamName: "related_pipeline",
      normalizePayload,
      defaultValues: DEFAULT_VALUES,
      entityName: "Outbound order",
      onClose,
      onCreate,
      onUpdate,
    });

  const config = useMemo(
    () => ({
      status: {
        render: (def: any) => <OutboundOrderStatusSelector def={def} />,
      },
      attachments: {
        fullWidth: true,
        render: (def: any) => <AttachmentInput def={def} />,
      },
      outbound_items: {
        fullWidth: true,
        render: (def: any) => (
          <OutboundOrderItemsInput def={def} showToolbar={mode === "standalone"} />
        ),
      },
      related_pipeline: {
        hidden: mode === "nested",
        render: (def: any) => <PurchaseRelatedPipelineSelector def={def} />,
      },
      related_pipeline_id: { hidden: true },
    }),
    [mode],
  );

  const drawerTitle = isEdit
    ? i18n.t("Edit Outbound Order")
    : i18n.t("Create Outbound Order");

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
          table="outbound_order"
          form={form}
          def={def}
          data={data}
          config={config}
          columnOrder={columnOrder}
          hideReadOnly
        />
      </ScrollView>
    </Drawer>
  );
}
