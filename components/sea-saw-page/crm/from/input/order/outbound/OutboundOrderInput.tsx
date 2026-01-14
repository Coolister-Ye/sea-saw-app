import React, { useState, useEffect, useRef, useMemo } from "react";
import { ScrollView } from "react-native";
import { Form, message } from "antd";

import Drawer from "../../../base/Drawer.web";
import InputFooter from "../../../base/InputFooter";
import InputForm from "@/components/sea-saw-design/form/InputForm";
import OutboundOrderItemsInput from "./OutboundOrderItemsInput";
import OutboundOrderStatusSelector from "./OutboundOrderStatusSelector";
import AttachmentInput from "../../shared/AttachmentInput";

import { useLocale } from "@/context/Locale";
import useDataService from "@/hooks/useDataService";
import { prepareRequestBody } from "@/utils";

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
  orderId: string | number;
}

export default function OutboundOrderInput({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  def,
  data = {},
  orderId,
}: OutboundOrderInputProps) {
  const { i18n } = useLocale();
  const { getViewSet } = useDataService();
  const orderViewSet = useMemo(() => getViewSet("order"), [getViewSet]);
  const nestedOutboundOrder = useMemo(
    () => getViewSet("nestedOutboundOrder"),
    [getViewSet]
  );

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const prevOpenRef = useRef(isOpen);

  const isEdit = Boolean(data?.id);

  /* ========================
   * Reset form when drawer closes
   * ======================== */
  useEffect(() => {
    // Only reset when transitioning from open to closed
    if (prevOpenRef.current && !isOpen) {
      form.resetFields();
    }
    prevOpenRef.current = isOpen;
  }, [isOpen, form]);

  /* ========================
   * Populate form when drawer opens with data
   * ======================== */
  useEffect(() => {
    if (isOpen && data && Object.keys(data).length > 0) {
      form.setFieldsValue(data);
    }
  }, [isOpen, data, form]);

  /* ========================
   * InputForm Custom Field Renderers
   * ======================== */
  const config = useMemo(
    () => ({
      status: {
        render: (def: any) => <OutboundOrderStatusSelector def={def} />,
      },
      outbound_items: {
        fullWidth: true,
        render: (def: any, value: any[] = [], onChange: (v: any[]) => void) => (
          <OutboundOrderItemsInput
            def={def}
            value={value}
            onChange={onChange}
            showToolbar={false}
          />
        ),
      },
      attachments: {
        fullWidth: true,
        render: (def: any, value: any[] = [], onChange: (v: any[]) => void) => (
          <AttachmentInput def={def} value={value} onChange={onChange} />
        ),
      },
    }),
    []
  );

  /* ========================
   * 保存（PATCH order）
   * ======================== */
  const handleSave = async () => {
    try {
      setLoading(true);

      const values = await form.validateFields();

      const payload = {
        ...values,
        // Keep order in body for backward compatibility
        order: orderId,
      };

      messageApi.open({
        key: "save",
        type: "loading",
        content: i18n.t("saving"),
      });

      // Convert to FormData if files are present
      const requestBody = prepareRequestBody(payload);

      const res = isEdit
        ? await nestedOutboundOrder.update({
            id: data.id!,
            body: requestBody,
            params: { order: orderId, return_related: "true" },
          })
        : await nestedOutboundOrder.create({
            body: requestBody,
            params: { order: orderId, return_related: "true" },
          });

      messageApi.open({
        key: "save",
        type: "success",
        content: i18n.t("save successfully"),
      });

      if (isEdit) {
        onUpdate?.(res);
      } else {
        onCreate?.(res);
      }
      onClose(res);
    } catch (err: any) {
      console.error("Outbound order save failed:", err);
      messageApi.open({
        key: "save",
        type: "error",
        content:
          err?.message || err?.response?.data?.message || i18n.t("Save failed"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title={
        isEdit ? i18n.t("Edit Outbound Order") : i18n.t("Create Outbound Order")
      }
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
        />
      </ScrollView>
    </Drawer>
  );
}
