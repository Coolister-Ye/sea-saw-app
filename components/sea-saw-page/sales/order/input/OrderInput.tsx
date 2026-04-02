import { useEffect, useMemo } from "react";
import i18n from "@/locale/i18n";
import { ScrollView } from "react-native";
import { Form, Input } from "antd";

import { round2, toNumber } from "@/utils/number";
import { Drawer, InputFooter } from "@/components/sea-saw-page/base";
import InputForm from "@/components/sea-saw-design/form/InputForm";
import AccountSelector from "@/components/sea-saw-page/crm/account/input/AccountSelector";
import BankAccountSelector from "@/components/sea-saw-page/crm/bank-account/input/BankAccountSelector";
import OrderItemsInput from "./OrderItemsInput";
import OrderStatusSelector from "./OrderStatusSelector";
import { ContactSelector } from "@/components/sea-saw-page/crm/contact/input";
import AttachmentInput from "@/components/sea-saw-page/base/attachments/AttachmentInput";
import useOrderDrawerForm from "@/hooks/useOrderDrawerForm";

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
  const getDefaultValues = () => ({
    status: "draft",
    order_date: new Date().toISOString().split("T")[0],
    currency: "USD",
  });

  const normalizePayload = (values: any) => {
    const payload = { ...values };
    delete payload.buyer;
    delete payload.seller;
    delete payload.shipper;
    delete payload.contact;
    delete payload.bank_account;
    return payload;
  };

  const { form, loading, contextHolder, isEdit, handleSave } =
    useOrderDrawerForm({
      mode,
      isOpen,
      data,
      pipelineId,
      nestedViewSetKey: "nestedOrder",
      standaloneViewSetKey: "order",
      nestedParamName: "related_pipeline",
      nestedPayloadKey: "related_pipeline",
      normalizePayload,
      defaultValues: getDefaultValues,
      entityName: "Order",
      onClose,
      onCreate,
      onUpdate,
    });

  const deposit = Form.useWatch("deposit", form);
  const orderItems = Form.useWatch("order_items", form);
  const currency = Form.useWatch("currency", form);

  useEffect(() => {
    const totalAmount = (orderItems ?? []).reduce(
      (sum: number, item: any) => sum + (parseFloat(item?.total_price) || 0),
      0,
    );
    const depositNum = toNumber(deposit) ?? 0;
    const balance = round2(totalAmount - depositNum);

    const updates: Record<string, any> = {
      total_amount: round2(totalAmount),
      balance,
    };

    if (totalAmount > 0 && depositNum > 0) {
      const curr = currency || "USD";
      const depPct = round2((depositNum / totalAmount) * 100);
      const balPct = round2(100 - depPct);
      updates.payment_terms =
        `${curr} ${depositNum} (${depPct}%) deposit, ` +
        `${curr} ${balance} (${balPct}%) balance`;
    }

    form.setFieldsValue(updates);
  }, [orderItems, deposit, currency, form]);

  const config = useMemo(
    () => ({
      buyer: {
        read_only: false,
        render: (def: any) => (
          <AccountSelector def={def} fieldName="buyer" idFieldName="buyer_id" />
        ),
      },
      buyer_id: { hidden: true },
      seller: {
        read_only: false,
        render: (def: any) => (
          <AccountSelector
            def={def}
            fieldName="seller"
            idFieldName="seller_id"
          />
        ),
      },
      seller_id: { hidden: true },
      shipper: {
        read_only: false,
        render: (def: any) => (
          <AccountSelector
            def={def}
            fieldName="shipper"
            idFieldName="shipper_id"
          />
        ),
      },
      shipper_id: { hidden: true },
      contact: {
        read_only: false,
        render: (def: any) => <ContactSelector def={def} />,
      },
      contact_id: { hidden: true },
      bank_account: {
        read_only: false,
        render: (def: any) => <BankAccountSelector def={def} />,
      },
      bank_account_id: { hidden: true },
      status: {
        // Status is managed by Pipeline once a pipeline exists
        read_only: !!data?.related_pipeline?.id,
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
      payment_terms: { render: () => <TextArea rows={3} /> },
      additional_info: { render: () => <TextArea rows={3} /> },
      comment: { render: () => <TextArea rows={3} /> },
    }),
    [data?.related_pipeline?.id],
  );

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
