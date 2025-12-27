import React, { useState } from "react";
import { ScrollView } from "react-native";
import { Form, message } from "antd";

import Drawer from "../base/Drawer.web";
import InputFooter from "../base/InputFooter";
import InputForm from "@/components/sea-saw-design/form/InputForm";
import ProductInput from "./ProductInput";

import { useLocale } from "@/context/Locale";
import useDataService from "@/hooks/useDataService";

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
  orderId: string | number;
}

export default function ProductionOrderInput({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  def,
  data = {},
  orderId,
}: ProductionOrderInputProps) {
  const { i18n } = useLocale();
  const { update } = useDataService();

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const isEdit = Boolean(data?.id);

  /* ========================
   * InputForm 自定义渲染
   * ======================== */
  const config = {
    production_items: {
      fullWidth: true,
      render: (def: any, value: any[] = [], onChange: (v: any[]) => void) => (
        <ProductInput def={def} value={value} onChange={onChange} />
      ),
    },
  };

  /* ========================
   * 保存（PATCH order）
   * ======================== */
  const handleSave = async () => {
    try {
      setLoading(true);

      const values = await form.validateFields();

      const payload = {
        production_orders: [
          {
            ...(isEdit ? { id: data.id } : {}),
            ...values,
          },
        ],
      };

      messageApi.open({
        key: "save",
        type: "loading",
        content: i18n.t("saving"),
      });

      const res = await update({
        contentType: "order",
        id: orderId,
        body: payload,
      });

      messageApi.open({
        key: "save",
        type: "success",
        content: i18n.t("save successfully"),
      });

      isEdit ? onUpdate?.(res) : onCreate?.(res);
    } catch (err: any) {
      console.error("Production order save failed:", err);
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
        isEdit
          ? i18n.t("Edit Production Order")
          : i18n.t("Create Production Order")
      }
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
        />
      </ScrollView>
    </Drawer>
  );
}
