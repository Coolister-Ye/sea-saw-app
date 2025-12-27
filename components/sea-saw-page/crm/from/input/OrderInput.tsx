import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { Form, message } from "antd";

import Drawer from "../base/Drawer.web";
import InputFooter from "../base/InputFooter";
import InputForm from "@/components/sea-saw-design/form/InputForm";

import ContactInput from "./ContactInput";
import ProductInput from "./ProductInput";

import { useLocale } from "@/context/Locale";
import useDataService from "@/hooks/useDataService";

interface OrderInputProps {
  isOpen: boolean;
  onClose: (res?: any) => void;
  onCreate?: (res?: any) => void;
  onUpdate?: (res?: any) => void;
  def: any;
  data?: {
    id?: string | number;
    [key: string]: any;
  };
}

export default function OrderInput({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  def,
  data = {},
}: OrderInputProps) {
  const { i18n } = useLocale();
  const { create, update } = useDataService();

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const isEdit = Boolean(data?.id);

  /* ========================
   * InputForm 自定义渲染
   * ======================== */
  const config = {
    contact: {
      render: (def: any) => <ContactInput def={def} />,
    },
    order_items: {
      fullWidth: true,
      render: (def: any, value: any[] = [], onChange: (v: any[]) => void) => (
        <ProductInput def={def} value={value} onChange={onChange} />
      ),
    },
  };

  /* ========================
   * 保存（Create / Update order）
   * ======================== */
  const handleSave = async () => {
    try {
      setLoading(true);

      const values = await form.validateFields();

      const payload = {
        ...values,
        contact: Array.isArray(values.contact)
          ? values.contact[0]
          : values.contact,
      };

      messageApi.open({
        key: "save",
        type: "loading",
        content: i18n.t("saving"),
      });

      const res = isEdit
        ? await update({
            contentType: "order",
            id: data.id,
            body: payload,
          })
        : await create({
            contentType: "order",
            body: payload,
          });

      messageApi.open({
        key: "save",
        type: "success",
        content: i18n.t("save successfully"),
      });

      isEdit ? onUpdate?.(res) : onCreate?.(res);
      onClose(res);
    } catch (err: any) {
      console.error("Order save failed:", err);
      messageApi.open({
        key: "save",
        type: "error",
        content:
          err?.message ||
          err?.response?.data?.message ||
          i18n.t("Save failed, please try again"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      open={isOpen}
      onClose={() => {
        onClose();
      }}
      title={isEdit ? i18n.t("Edit Order") : i18n.t("Create Order")}
      footer={
        <InputFooter loading={loading} onSave={handleSave} onCancel={onClose} />
      }
    >
      {contextHolder}

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <InputForm
          table="order"
          form={form}
          def={def}
          data={data}
          config={config}
        />
      </ScrollView>
    </Drawer>
  );
}
