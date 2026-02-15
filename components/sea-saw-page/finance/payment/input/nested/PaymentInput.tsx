import React, { useState, useEffect, useMemo } from "react";
import i18n from "@/locale/i18n";
import { ScrollView, View } from "react-native";
import { Form, Select, message } from "antd";

import useDataService from "@/hooks/useDataService";
import { prepareRequestBody } from "@/utils";
import { devError } from "@/utils/logger";
import { Drawer, InputFooter } from "@/components/sea-saw-page/base";
import InputForm from "@/components/sea-saw-design/form/InputForm";
import AttachmentInput from "@/components/sea-saw-page/base/attachments/AttachmentInput";

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
  def?: any;
  data?: any;
  pipeline: {
    id: number | string;
    order?: { id: number | string; order_code?: string };
    purchase_orders?: {
      id: number | string;
      purchase_code?: string;
    }[];
  };
}

/** Parse "type:id" string into structured object */
function parseSelectedEntity(
  value: string | null,
): { type: RelatedEntityType; id: string } | null {
  if (!value) return null;
  const [type, id] = value.split(":");
  return { type: type as RelatedEntityType, id };
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

  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [entityTouched, setEntityTouched] = useState(false);

  const isEdit = Boolean(data?.id);

  // 构建关联实体下拉选项
  const entityOptions = useMemo(() => {
    const options: RelatedEntityOption[] = [];

    if (pipeline?.order) {
      options.push({
        type: "order",
        id: pipeline.order.id,
        label: `${i18n.t("Order")}: ${pipeline.order.order_code || pipeline.order.id}`,
      });
    }

    if (pipeline?.purchase_orders?.length) {
      pipeline.purchase_orders.forEach((po) => {
        options.push({
          type: "purchase_order",
          id: po.id,
          label: `${i18n.t("Purchase Order")}: ${po.purchase_code || po.id}`,
        });
      });
    }

    return options;
  }, [pipeline]);

  // 初始化表单和选择状态
  useEffect(() => {
    if (!isOpen) {
      form.resetFields();
      setSelectedEntity(null);
      setEntityTouched(false);
      return;
    }

    // 设置默认值，现有数据优先
    form.setFieldsValue({
      payment_date: new Date().toISOString().split("T")[0],
      currency: "USD",
      ...data,
    });

    // 编辑模式下，根据现有数据匹配选中实体
    if (isEdit && data?.content_type && data?.object_id) {
      const matched = entityOptions.find(
        (opt) => String(opt.id) === String(data.object_id),
      );
      if (matched) {
        setSelectedEntity(`${matched.type}:${matched.id}`);
      }
    } else if (entityOptions.length === 1) {
      // 只有一个选项时自动选中
      const opt = entityOptions[0];
      setSelectedEntity(`${opt.type}:${opt.id}`);
    } else {
      setSelectedEntity(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, form, entityOptions]);

  const handleSave = async () => {
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

      const requestBody = prepareRequestBody(values);
      const queryParams = {
        [parsed.type]: parsed.id,
        return_related: "true",
      };

      const result = isEdit
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

      isEdit ? onUpdate?.(result) : onCreate?.(result);
      onClose(result);
    } catch (err: any) {
      devError("Payment save failed:", err);

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
        {/* 关联实体选择器 */}
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
