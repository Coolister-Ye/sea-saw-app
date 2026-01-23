import React, { useState, useEffect, useRef, useMemo } from "react";
import i18n from '@/locale/i18n';
import { ScrollView, View } from "react-native";
import { Form, Select, message } from "antd";

import Drawer from "../../../base/Drawer.web";
import InputFooter from "../../../base/InputFooter";
import InputForm from "@/components/sea-saw-design/form/InputForm";
import AttachmentInput from "../../shared/AttachmentInput";

import useDataService from "@/hooks/useDataService";
import { prepareRequestBody } from "@/utils";

// 关联实体类型
type RelatedEntityType = "order" | "purchase_order";

interface RelatedEntityOption {
  type: RelatedEntityType;
  id: number | string;
  label: string;
}

interface PaymentInputProps {
  isOpen: boolean;
  onClose: (res?: any) => void;
  onCreate?: (res?: any) => void;
  onUpdate?: (res?: any) => void;
  def?: any; // Payment 表单定义
  data?: any; // 当前编辑的数据
  pipeline: {
    id: number | string;
    order?: { id: number | string; order_code?: string };
    purchase_orders?: Array<{
      id: number | string;
      purchase_order_code?: string;
    }>;
  };
}

export default function PaymentInput({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  def,
  data = {},
  pipeline,
}: PaymentInputProps) {
  const { getViewSet } = useDataService();
  const nestedPaymentViewSet = useMemo(
    () => getViewSet("nestedPayment"),
    [getViewSet],
  );

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const prevOpenRef = useRef(isOpen);

  // 当前选择的关联实体
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  // 是否触摸过选择器（用于延迟显示验证错误）
  const [entityTouched, setEntityTouched] = useState(false);

  const isEdit = Boolean(data?.id);

  // 构建关联实体下拉选项
  const entityOptions = useMemo(() => {
    const options: RelatedEntityOption[] = [];

    // 添加 Order 选项
    if (pipeline?.order) {
      options.push({
        type: "order",
        id: pipeline.order.id,
        label: `${i18n.t("Order")}: ${pipeline.order.order_code || pipeline.order.id}`,
      });
    }

    // 添加 PurchaseOrder 选项
    if (pipeline?.purchase_orders?.length) {
      pipeline.purchase_orders.forEach((po) => {
        options.push({
          type: "purchase_order",
          id: po.id,
          label: `${i18n.t("Purchase Order")}: ${po.purchase_order_code || po.id}`,
        });
      });
    }

    return options;
  }, [pipeline, i18n]);

  // 解析选中值获取类型和ID
  const parseSelectedEntity = (
    value: string | null,
  ): { type: RelatedEntityType; id: string | number } | null => {
    if (!value) return null;
    const [type, id] = value.split(":");
    return { type: type as RelatedEntityType, id };
  };

  // 初始化表单和选择状态
  useEffect(() => {
    // Reset when transitioning from open to closed
    if (prevOpenRef.current && !isOpen) {
      form.resetFields();
      setSelectedEntity(null);
      setEntityTouched(false);
    }

    prevOpenRef.current = isOpen;

    if (!isOpen) return;

    // 设置默认值：payment_date 默认当天，currency 默认 USD
    const defaults = {
      payment_date: new Date().toISOString().split("T")[0],
      currency: "USD",
    };

    // 合并默认值和现有数据（现有数据优先）
    form.setFieldsValue({ ...defaults, ...data });

    // 编辑模式下，根据现有数据设置选中的实体
    if (isEdit && data?.content_type && data?.object_id) {
      // 尝试匹配已有选项
      const matchedOption = entityOptions.find(
        (opt) => String(opt.id) === String(data.object_id),
      );
      if (matchedOption) {
        setSelectedEntity(`${matchedOption.type}:${matchedOption.id}`);
      }
    } else if (entityOptions.length === 1) {
      // 只有一个选项时自动选中
      const opt = entityOptions[0];
      setSelectedEntity(`${opt.type}:${opt.id}`);
    } else {
      setSelectedEntity(null);
    }
  }, [isOpen, data, form, isEdit, entityOptions]);

  /* ========================
   * 保存逻辑
   * ======================== */
  const handleSave = async () => {
    // 验证是否选择了关联实体
    const parsed = parseSelectedEntity(selectedEntity);
    if (!parsed) {
      setEntityTouched(true);
      messageApi.open({
        key: "save",
        type: "error",
        content: i18n.t("Please select a related order or purchase order"),
      });
      return;
    }

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
      const requestBody = prepareRequestBody(values);

      // 构建查询参数 - 使用选中的实体类型和ID
      const queryParams = {
        [parsed.type]: parsed.id,
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
      setSelectedEntity(null);
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
        {/* 关联实体选择器 - 使用 Form.Item 保持与 InputForm 一致的样式 */}
        <View className="px-2">
          <Form layout="vertical">
            <Form.Item
              label={i18n.t("Related Entity")}
              required
              validateStatus={
                entityTouched && !selectedEntity ? "error" : undefined
              }
              help={
                entityTouched && !selectedEntity
                  ? i18n.t("Please select a related order or purchase order")
                  : undefined
              }
            >
              <Select
                style={{ width: "100%" }}
                placeholder={i18n.t("Select related order or purchase order")}
                value={selectedEntity}
                onChange={(value) => {
                  setSelectedEntity(value);
                  setEntityTouched(true);
                }}
                onBlur={() => setEntityTouched(true)}
                disabled={isEdit}
                options={entityOptions.map((opt) => ({
                  value: `${opt.type}:${opt.id}`,
                  label: opt.label,
                }))}
              />
            </Form.Item>
          </Form>
        </View>

        <InputForm
          table="payment"
          form={form}
          def={def}
          data={data}
          // 隐藏 GenericForeignKey 字段
          config={{
            content_type: { hidden: true, rules: [] },
            object_id: { hidden: true, rules: [] },
            attachments: {
              render: (def: any) => <AttachmentInput def={def} />,
            },
          }}
          hideReadOnly
        />
      </ScrollView>
    </Drawer>
  );
}
