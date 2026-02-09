import { useEffect, useState, useCallback, useMemo } from "react";
import i18n from "@/locale/i18n";
import { ScrollView } from "react-native";
import { Form, message, Input } from "antd";

import useDataService from "@/hooks/useDataService";
import { prepareRequestBody } from "@/utils/form";
import { devError } from "@/utils/logger";
import { round2, toNumber } from "@/utils/number";
import { Drawer, InputFooter } from "@/components/sea-saw-page/base";
import InputForm from "@/components/sea-saw-design/form/InputForm";
import AccountSelector from "@/components/sea-saw-page/crm/account/input/AccountSelector";
import OrderItemsInput from "./OrderItemsInput";
import OrderStatusSelector from "./OrderStatusSelector";
import { ContactSelector } from "@/components/sea-saw-page/crm/contact/input";
import AttachmentInput from "@/components/sea-saw-page/base/attachments/AttachmentInput";

const { TextArea } = Input;

interface OrderInputProps {
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
  columnOrder?: string[];
}

const normalizePayload = (values: any) => {
  const payload = { ...values };
  delete payload.account;
  delete payload.contact;
  return payload;
};

export default function OrderInput({
  mode = "standalone",
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  def,
  data = {},
  pipelineId,
  columnOrder,
}: OrderInputProps) {
  const { getViewSet } = useDataService();

  const orderViewSet = useMemo(
    () => getViewSet(mode === "nested" ? "nestedOrder" : "order"),
    [getViewSet, mode],
  );

  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(data?.id);

  const deposit = Form.useWatch("deposit", form);
  const orderItems = Form.useWatch("order_items", form);

  useEffect(() => {
    if (!isOpen) return;

    if (isEdit) {
      form.setFieldsValue(data);
    } else {
      form.resetFields();
      form.setFieldsValue({
        status: "draft",
        order_date: new Date().toISOString().split("T")[0],
        currency: "USD",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isEdit, form]);

  // 自动计算 total_amount 和 balance
  useEffect(() => {
    const totalAmount = (orderItems ?? []).reduce(
      (sum: number, item: any) => sum + (parseFloat(item?.total_price) || 0),
      0,
    );
    const depositNum = toNumber(deposit) ?? 0;

    form.setFieldsValue({
      total_amount: round2(totalAmount),
      balance: round2(totalAmount - depositNum),
    });
  }, [orderItems, deposit, form]);

  const config = useMemo(
    () => ({
      account: {
        read_only: false,
        render: (def: any) => <AccountSelector def={def} />,
      },
      account_id: { hidden: true },
      contact: {
        read_only: false,
        render: (def: any) => <ContactSelector def={def} />,
      },
      contact_id: { hidden: true },
      status: {
        render: (def: any) => <OrderStatusSelector def={def} />,
      },
      order_items: {
        fullWidth: true,
        render: (def: any) => <OrderItemsInput def={def} />,
      },
      attachments: {
        fullWidth: true,
        render: (def: any) => <AttachmentInput def={def} />,
      },
      total_amount: { read_only: true, hidden: false },
      comment: { render: () => <TextArea rows={3} /> },
    }),
    [],
  );

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

  const handleSave = useCallback(async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      let payload = normalizePayload(values);

      showMessage("loading", i18n.t("saving"));

      const params: Record<string, any> = {};
      if (mode === "nested") {
        if (!pipelineId) {
          throw new Error("Pipeline ID is required for nested mode");
        }
        payload = { ...payload, related_pipeline: pipelineId };
        params.related_pipeline = pipelineId;
        params.return_related = "true";
      }

      const requestBody = prepareRequestBody(payload);
      const nestedParams = mode === "nested" ? { params } : {};

      const res = isEdit
        ? await orderViewSet.update({
            id: data.id!,
            body: requestBody,
            ...nestedParams,
          })
        : await orderViewSet.create({
            body: requestBody,
            ...nestedParams,
          });

      showMessage("success", i18n.t("save successfully"));
      (isEdit ? onUpdate : onCreate)?.(res);
      onClose(res);
    } catch (err: any) {
      devError("Order save failed:", err);
      showMessage(
        "error",
        err?.message ||
          err?.response?.data?.message ||
          i18n.t("Save failed, please try again"),
      );
    } finally {
      setLoading(false);
    }
  }, [
    form,
    showMessage,
    mode,
    pipelineId,
    isEdit,
    orderViewSet,
    data,
    onUpdate,
    onCreate,
    onClose,
  ]);

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
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
          columnOrder={columnOrder}
          hideReadOnly
        />
      </ScrollView>
    </Drawer>
  );
}
