import React, { useCallback, useMemo } from "react";
import i18n from "@/locale/i18n";
import { ScrollView } from "react-native";

import InputForm from "@/components/sea-saw-design/form/InputForm";
import ProductionOrderItemsInput from "./shared/items/ProductionOrderItemsInput";
import ProductionOrderStatusSelector from "./shared/selectors/ProductionOrderStatusSelector";
import ProductionRelatedOrderSelector from "./shared/selectors/ProductionRelatedOrderSelector";
import AttachmentInput from "@/components/sea-saw-page/base/attachments/AttachmentInput";
import { Drawer, InputFooter } from "@/components/sea-saw-page/base";
import useOrderDrawerForm from "@/hooks/useOrderDrawerForm";

const DEFAULT_VALUES = { status: "pending" };

interface ProductionOrderInputProps {
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

export default function ProductionOrderInput({
  mode = "standalone",
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  def,
  data = {},
  pipelineId,
}: ProductionOrderInputProps) {
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
      nestedViewSetKey: "nestedProductionOrder",
      standaloneViewSetKey: "productionOrder",
      nestedParamName: "related_pipeline",
      normalizePayload,
      defaultValues: DEFAULT_VALUES,
      entityName: "Production order",
      onClose,
      onCreate,
      onUpdate,
    });

  const config = useMemo(
    () => ({
      status: {
        render: (def: any) => <ProductionOrderStatusSelector def={def} />,
      },
      attachments: {
        fullWidth: true,
        render: (def: any) => <AttachmentInput def={def} />,
      },
      production_items: {
        fullWidth: true,
        render: (def: any) => (
          <ProductionOrderItemsInput
            def={def}
            showToolbar={mode === "standalone"}
          />
        ),
      },
      related_order: {
        hidden: mode === "nested",
        render: (def: any) => <ProductionRelatedOrderSelector def={def} />,
      },
    }),
    [mode],
  );

  const drawerTitle = isEdit
    ? i18n.t("Edit Production Order")
    : i18n.t("Create Production Order");

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
          table="production_order"
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
