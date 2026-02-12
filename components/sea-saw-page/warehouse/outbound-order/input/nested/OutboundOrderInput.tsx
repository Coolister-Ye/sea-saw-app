import React, { useMemo } from "react";
import i18n from "@/locale/i18n";
import { ScrollView } from "react-native";

import InputForm from "@/components/sea-saw-design/form/InputForm";
import OutboundOrderItemsInput from "../shared/items/OutboundOrderItemsInput";
import OutboundOrderStatusSelector from "../shared/selectors/OutboundOrderStatusSelector";
import AttachmentInput from "@/components/sea-saw-page/base/attachments/AttachmentInput";
import { Drawer, InputFooter } from "@/components/sea-saw-page/base";
import useOrderDrawerForm from "@/hooks/useOrderDrawerForm";

const DEFAULT_VALUES = { status: "pending" };

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
}

export default function OutboundOrderInput({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  def,
  data = {},
  pipelineId,
}: OutboundOrderInputProps) {
  const { form, loading, contextHolder, isEdit, handleSave } =
    useOrderDrawerForm({
      mode: "nested",
      isOpen,
      data,
      pipelineId,
      nestedViewSetKey: "nestedOutboundOrder",
      standaloneViewSetKey: "outboundOrder",
      nestedParamName: "related_pipeline",
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
          <OutboundOrderItemsInput def={def} showToolbar={false} />
        ),
      },
    }),
    [],
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
          hideReadOnly
        />
      </ScrollView>
    </Drawer>
  );
}
