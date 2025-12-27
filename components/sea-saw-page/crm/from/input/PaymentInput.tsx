import React, { useState, useEffect } from "react";
import { ScrollView } from "react-native";
import { Form, message } from "antd";

import Drawer from "../base/Drawer.web";
import InputFooter from "../base/InputFooter";
import InputForm from "@/components/sea-saw-design/form/InputForm";

import { useLocale } from "@/context/Locale";
import useDataService from "@/hooks/useDataService";

interface PaymentInputProps {
  isOpen: boolean;
  onClose: (res?: any) => void;
  onCreate?: (res?: any) => void;
  onUpdate?: (res?: any) => void;
  def?: any; // Payment 表单定义
  data?: any; // 当前编辑的数据
  orderId: string | number; // 所属订单 id
}

export default function PaymentInput({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  def,
  data = {},
  orderId,
}: PaymentInputProps) {
  const { i18n } = useLocale();
  const { create, update, retrieve } = useDataService();

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const isEdit = Boolean(data?.id);

  // 初始化表单，确保 order 不可编辑，但提交时自动带上 orderId
  useEffect(() => {
    if (!isOpen) return;

    form.setFieldsValue({
      ...data,
      order: orderId,
    });
  }, [isOpen, data, orderId, form]);

  /* ========================
   * 保存逻辑
   * ======================== */
  const handleSave = async () => {
    try {
      setLoading(true);

      const values = await form.validateFields();

      // 强制设置 order 为 orderId，避免用户篡改
      const payload = {
        ...values,
        order: orderId,
      };

      messageApi.open({
        key: "save",
        type: "loading",
        content: i18n.t("saving"),
      });

      let res;
      if (isEdit) {
        // 调用 PaymentRecordViewSet 的 PATCH 接口
        res = await update({
          contentType: "payment",
          id: data.id,
          body: payload,
        });
      } else {
        // 调用 PaymentRecordViewSet 的 POST 接口
        res = await create({
          contentType: "payment",
          body: payload,
        });
      }

      const updatedOrder = await retrieve({
        contentType: "order",
        id: orderId,
      });

      isEdit ? onUpdate?.(updatedOrder) : onCreate?.(updatedOrder);
      form.resetFields();
      onClose(updatedOrder);
    } catch (err: any) {
      console.error("Payment save failed:", err);

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
      title={isEdit ? i18n.t("Edit Payment") : i18n.t("Create Payment")}
      footer={
        <InputFooter loading={loading} onSave={handleSave} onCancel={onClose} />
      }
    >
      {contextHolder}

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <InputForm
          table="payment"
          form={form}
          def={def}
          data={data}
          // 隐藏 order 字段
          config={{ order: { hidden: true } }}
        />
      </ScrollView>
    </Drawer>
  );
}
