import React, { useEffect, useState, useCallback, useMemo } from "react";
import i18n from "@/locale/i18n";
import { ScrollView } from "react-native";
import { Form, message } from "antd";

import useDataService from "@/hooks/useDataService";
import { prepareRequestBody } from "@/utils/form";
import { devError } from "@/utils/logger";
import { Drawer } from "@/components/sea-saw-page/base";
import InputForm from "@/components/sea-saw-design/form/InputForm";
import AccountSelector from "@/components/sea-saw-page/crm/account/input/AccountSelector";
import OrderItemsInput from "./OrderItemsInput";
import OrderStatusSelector from "./OrderStatusSelector";
import { ContactSelector } from "@/components/sea-saw-page/crm/contact/input";
import AttachmentInput from "@/components/sea-saw-page/base/attachments/AttachmentInput";
import { InputFooter } from "@/components/sea-saw-page/base";

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

  useEffect(() => {
    if (!isOpen) {
      return;
    }

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
  }, [isOpen, isEdit, data, form]);

  const handleTotalsChange = useCallback(
    (totals: { total_amount: number }) => {
      form.setFieldsValue({ total_amount: totals.total_amount });
    },
    [form],
  );

  const calculateBalance = useCallback(() => {
    const values = form.getFieldsValue(["deposit", "total_amount"]);
    const deposit =
      values.deposit !== undefined && values.deposit !== null
        ? Number(values.deposit)
        : null;
    const totalAmount =
      values.total_amount !== undefined && values.total_amount !== null
        ? Number(values.total_amount)
        : null;

    if (deposit !== null && totalAmount !== null) {
      form.setFieldsValue({ balance: totalAmount - deposit });
    }
  }, [form]);

  const config = useMemo(
    () => ({
      account: {
        read_only: false,
        render: (def: any) => <AccountSelector def={def} />,
      },
      account_id: {
        hidden: true,
      },
      contact: {
        read_only: false,
        render: (def: any) => <ContactSelector def={def} />,
      },
      contact_id: {
        hidden: true,
      },
      status: {
        render: (def: any) => <OrderStatusSelector def={def} />,
      },
      order_items: {
        fullWidth: true,
        render: (def: any) => (
          <OrderItemsInput def={def} onTotalsChange={handleTotalsChange} />
        ),
      },
      attachments: {
        fullWidth: true,
        render: (def: any) => <AttachmentInput def={def} />,
      },
      deposit: {
        onBlur: calculateBalance,
      },
      total_amount: {
        onBlur: calculateBalance,
      },
      related_pipeline: {
        hidden: true,
      },
    }),
    [handleTotalsChange, calculateBalance, mode],
  );

  const normalizePayload = useCallback((values: any) => {
    const payload = { ...values };
    delete payload.account;
    delete payload.contact;
    return payload;
  }, []);

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

      // Nested mode: add pipelineId to payload and params
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

      const res = isEdit
        ? await orderViewSet.update({
            id: data.id!,
            body: requestBody,
            ...(mode === "nested" && { params }),
          })
        : await orderViewSet.create({
            body: requestBody,
            ...(mode === "nested" && { params }),
          });

      showMessage("success", i18n.t("save successfully"));

      if (isEdit) {
        onUpdate?.(res);
      } else {
        onCreate?.(res);
      }
      onClose(res);
    } catch (err: any) {
      devError("Order save failed:", err);
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
    normalizePayload,
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

  const drawerTitle = isEdit ? i18n.t("Edit Order") : i18n.t("Create Order");

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
