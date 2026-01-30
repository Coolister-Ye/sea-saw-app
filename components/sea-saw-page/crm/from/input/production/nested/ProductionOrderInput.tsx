import React, { useEffect, useState, useCallback, useMemo } from "react";
import i18n from '@/locale/i18n';
import { ScrollView } from "react-native";
import { Form, message } from "antd";

import useDataService from "@/hooks/useDataService";
import { prepareRequestBody } from "@/utils/form";
import { devError } from "@/utils/logger";
import Drawer from "../../../base/Drawer.web";
import InputFooter from "../../../base/InputFooter";
import InputForm from "@/components/sea-saw-design/form/InputForm";
import ProductionOrderItemsInput from "../shared/items/ProductionOrderItemsInput";
import ProductionOrderStatusSelector from "../shared/selectors/ProductionOrderStatusSelector";
import { AttachmentInput } from "../../shared";

interface ProductionOrderInputProps {
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
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  def,
  data = {},
  pipelineId,
}: ProductionOrderInputProps) {
  const { getViewSet } = useDataService();

  const nestedProductionOrder = useMemo(
    () => getViewSet("nestedProductionOrder"),
    [getViewSet],
  );

  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(data?.id);

  /* ========================
   * Form Initialization
   * Populate on open only (form will unmount when drawer closes)
   * ======================== */
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (isEdit) {
      // Edit mode: populate with existing data
      form.setFieldsValue(data);
    } else {
      // Create mode: reset and set defaults
      form.resetFields();
      form.setFieldsValue({
        status: "pending",
      });
    }
  }, [isOpen, isEdit, data, form]);

  /* ========================
   * Custom Field Renderers
   * ======================== */
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
          <ProductionOrderItemsInput def={def} showToolbar={false} />
        ),
      },
    }),
    [],
  );

  /* ========================
   * Helper Functions
   * ======================== */
  const showMessage = useCallback(
    (type: "loading" | "success" | "error", content: string) => {
      messageApi.open({
        key: "save",
        type,
        content,
        duration: type === "loading" ? 0 : undefined,
      });
    },
    [messageApi],
  );

  /* ========================
   * Save Handler
   * ======================== */
  const handleSave = useCallback(async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      showMessage("loading", i18n.t("saving"));

      if (!pipelineId) {
        throw new Error("Pipeline ID is required for nested mode");
      }

      const payload = {
        ...values,
        pipeline: pipelineId,
      };

      const requestBody = prepareRequestBody(payload);

      const res = isEdit
        ? await nestedProductionOrder.update({
            id: data.id!,
            body: requestBody,
            params: { related_pipeline: pipelineId, return_related: "true" },
          })
        : await nestedProductionOrder.create({
            body: requestBody,
            params: { related_pipeline: pipelineId, return_related: "true" },
          });

      showMessage("success", i18n.t("save successfully"));

      if (isEdit) {
        onUpdate?.(res);
      } else {
        onCreate?.(res);
      }
      onClose(res);
    } catch (err: any) {
      devError("Production order save failed:", err);
      const errorMessage =
        err?.message ||
        err?.response?.data?.message ||
        i18n.t("Save failed, please try again");
      showMessage("error", errorMessage);
    } finally {
      setLoading(false);
    }
  }, [
    form,
    showMessage,
    i18n,
    isEdit,
    pipelineId,
    nestedProductionOrder,
    data,
    onUpdate,
    onCreate,
    onClose,
  ]);

  /* ========================
   * Render
   * ======================== */
  const drawerTitle = isEdit
    ? i18n.t("Edit Production Order")
    : i18n.t("Create Production Order");

  const footer = (
    <InputFooter loading={loading} onSave={handleSave} onCancel={onClose} />
  );

  return (
    <Drawer open={isOpen} onClose={onClose} title={drawerTitle} footer={footer}>
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
