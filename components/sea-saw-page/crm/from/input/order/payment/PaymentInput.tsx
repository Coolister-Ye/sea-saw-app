import React, { useState, useEffect, useRef, useMemo } from "react";
import { ScrollView } from "react-native";
import { Form, message } from "antd";

import Drawer from "../../../base/Drawer.web";
import InputFooter from "../../../base/InputFooter";
import InputForm from "@/components/sea-saw-design/form/InputForm";
import AttachmentInput from "../../shared/AttachmentInput";

import { useLocale } from "@/context/Locale";
import useDataService from "@/hooks/useDataService";
import { prepareRequestBody } from "@/utils";

interface PaymentInputProps {
  isOpen: boolean;
  onClose: (res?: any) => void;
  onCreate?: (res?: any) => void;
  onUpdate?: (res?: any) => void;
  def?: any; // Payment 表单定义
  data?: any; // 当前编辑的数据
  relatedObjectId: string | number; // 关联对象 ID (Order 或 PurchaseOrder)
  paramName: "order" | "purchase_order"; // 查询参数名称 (order 或 purchase_order)
}

export default function PaymentInput({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  def,
  data = {},
  relatedObjectId,
  paramName,
}: PaymentInputProps) {
  const { i18n } = useLocale();
  const { getViewSet } = useDataService();
  const nestedPaymentViewSet = useMemo(
    () => getViewSet("nestedPayment"),
    [getViewSet]
  );

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const prevOpenRef = useRef(isOpen);

  const isEdit = Boolean(data?.id);

  // 初始化表单
  // content_type 和 object_id 会由后端根据查询参数自动注入，无需前端设置
  useEffect(() => {
    // Reset when transitioning from open to closed
    if (prevOpenRef.current && !isOpen) {
      form.resetFields();
    }

    prevOpenRef.current = isOpen;

    if (!isOpen) return;

    form.setFieldsValue(data);
  }, [isOpen, data, form]);

  /* ========================
   * 保存逻辑
   * ======================== */
  const handleSave = async () => {
    try {
      setLoading(true);

      const values = await form.validateFields();

      messageApi.open({
        key: "save",
        type: "loading",
        content: i18n.t("saving"),
        duration: 0,
      });

      // Convert to FormData if files are present
      // content_type 和 object_id 会由后端根据查询参数自动注入
      const requestBody = prepareRequestBody(values);

      // 构建查询参数
      const queryParams = {
        [paramName]: relatedObjectId,
        return_related: "true",
      };

      // 调用 NestedPaymentViewSet，使用 return_related=true 直接返回关联对象数据
      const updatedRelatedObject = isEdit
        ? await nestedPaymentViewSet.update({
            id: data.id,
            body: requestBody,
            params: queryParams,
          })
        : await nestedPaymentViewSet.create({
            body: requestBody,
            params: queryParams,
          });

      messageApi.open({
        key: "save",
        type: "success",
        content: i18n.t("save successfully"),
      });

      isEdit
        ? onUpdate?.(updatedRelatedObject)
        : onCreate?.(updatedRelatedObject);
      form.resetFields();
      onClose(updatedRelatedObject);
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
          // 隐藏 GenericForeignKey 字段和旧的 order 字段
          config={{
            content_type: { hidden: true },
            object_id: { hidden: true },
            order: { hidden: true }, // 兼容旧的 order 字段
            attachments: {
              fullWidth: true,
              render: (
                def: any,
                value: any[] = [],
                onChange: (v: any[]) => void
              ) => (
                <AttachmentInput def={def} value={value} onChange={onChange} />
              ),
            },
          }}
        />
      </ScrollView>
    </Drawer>
  );
}
