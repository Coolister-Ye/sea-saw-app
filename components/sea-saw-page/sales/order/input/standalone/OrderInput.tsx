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
import CompanySelector from "../../company/shared/CompanySelector";
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
}

export default function OrderInput({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  def,
  data = {},
}: OrderInputProps) {
  const { getViewSet } = useDataService();

  const orderViewSet = useMemo(() => getViewSet("order"), [getViewSet]);

  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(data?.id);

  /* ========================
   * Form Initialization
   * Populate on open only (form will unmount when drawer closes)
   * ======================== */
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (isEdit) {
      form.setFieldsValue(data);
    } else {
      // Create mode: reset and set defaults
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
      company: {
        read_only: false,
        render: (def: any) => <CompanySelector def={def} />,
      },
      company_id: {
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
    }),
    [handleTotalsChange, calculateBalance],
  );

  const normalizePayload = useCallback((values: any) => {
    const payload = { ...values };
    delete payload.company;
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
      const payload = normalizePayload(values);

      showMessage("loading", i18n.t("saving"));

      const requestBody = prepareRequestBody(payload);

      const res = isEdit
        ? await orderViewSet.update({ id: data.id!, body: requestBody })
        : await orderViewSet.create({ body: requestBody });

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
          hideReadOnly
        />
      </ScrollView>
    </Drawer>
  );
}
