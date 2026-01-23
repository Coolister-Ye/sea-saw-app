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
import ContactSelector from "../../contact/shared/ContactSelector";
import OrderItemsInput from "../shared/items/ProductInput";
import OrderStatusSelector from "../shared/selectors/OrderStatusSelector";
import AttachmentInput from "../../shared/AttachmentInput";

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
  pipelineId?: string | number;
}

export default function OrderInput({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  def,
  data = {},
  pipelineId,
}: OrderInputProps) {
  const { getViewSet } = useDataService();

  const nestedOrderViewSet = useMemo(
    () => getViewSet("nestedOrder"),
    [getViewSet],
  );

  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(data?.id);

  /* ========================
   * Form Initialization
   * Reset on close, populate on open
   * ======================== */
  useEffect(() => {
    if (!isOpen) {
      form.resetFields();
      return;
    }

    if (isEdit) {
      // Edit mode: populate with existing data
      form.setFieldsValue(data);
    } else {
      // Create mode: set defaults
      form.setFieldsValue({
        status: "draft",
        order_date: new Date().toISOString().split("T")[0],
        currency: "USD",
      });
    }
  }, [isOpen, isEdit, data, form]);

  /* ========================
   * Helper: Handle Totals Update
   * ======================== */
  const handleTotalsChange = useCallback(
    (totals: { total_amount: number }) => {
      form.setFieldsValue({
        total_amount: totals.total_amount,
      });
    },
    [form],
  );

  /* ========================
   * Helper: Auto-calculate balance
   * When deposit and total_amount are filled, calculate balance
   * balance = total_amount - deposit
   * ======================== */
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

    // If both deposit and total_amount have values, calculate balance
    if (deposit !== null && totalAmount !== null) {
      form.setFieldsValue({
        balance: totalAmount - deposit,
      });
    }
  }, [form]);

  /* ========================
   * Custom Field Renderers
   * ======================== */
  const config = useMemo(
    () => ({
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
        render: (def: any) => (
          <OrderItemsInput def={def} onTotalsChange={handleTotalsChange} />
        ),
      },
      attachments: {
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
    [handleTotalsChange, calculateBalance],
  );

  /* ========================
   * Helper Functions
   * ======================== */
  const normalizePayload = useCallback((values: any) => {
    // ContactSelector already sets contact_id directly
    // Just remove the contact field (read-only)
    const payload = { ...values };
    delete payload.contact;
    return payload;
  }, []);

  const showMessage = useCallback(
    (type: "loading" | "success" | "error", content: string) => {
      messageApi.open({
        key: "save",
        type,
        content,
        duration: type === "loading" ? 0 : undefined, // Don't auto-close loading message
      });
    },
    [messageApi],
  );

  /* ========================
   * Save Handler (Create / Update)
   * ======================== */
  const handleSave = useCallback(async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const payload = normalizePayload(values);

      showMessage("loading", i18n.t("saving"));

      if (!pipelineId) {
        throw new Error("Pipeline ID is required for nested mode");
      }

      const nestedPayload = {
        ...payload,
        related_pipeline: pipelineId,
      };

      const requestBody = prepareRequestBody(nestedPayload);

      const res = isEdit
        ? await nestedOrderViewSet.update({
            id: data.id!,
            body: requestBody,
            params: { related_pipeline: pipelineId, return_related: "true" },
          })
        : await nestedOrderViewSet.create({
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
    i18n,
    isEdit,
    pipelineId,
    nestedOrderViewSet,
    data,
    onUpdate,
    onCreate,
    onClose,
  ]);

  /* ========================
   * Render
   * ======================== */
  const drawerTitle = isEdit ? i18n.t("Edit Order") : i18n.t("Create Order");
  const footer = (
    <InputFooter loading={loading} onSave={handleSave} onCancel={onClose} />
  );

  return (
    <Drawer open={isOpen} onClose={onClose} title={drawerTitle} footer={footer}>
      {contextHolder}

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <InputForm
          table="order"
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
