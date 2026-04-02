import { useEffect, useMemo } from "react";
import i18n from "@/locale/i18n";
import { ScrollView } from "react-native";
import { Form, Input } from "antd";

import { round2, toNumber } from "@/utils/number";
import InputForm from "@/components/sea-saw-design/form/InputForm";
import PurchaseOrderItemsInput from "./PurchaseOrderItemsInput";
import PurchaseOrderStatusSelector from "./PurchaseOrderStatusSelector";
import PurchaseRelatedOrderSelector from "./PurchaseRelatedOrderSelector";
import AccountSelector from "@/components/sea-saw-page/crm/account/input/AccountSelector";
import BankAccountSelector from "@/components/sea-saw-page/crm/bank-account/input/BankAccountSelector";
import { ContactSelector } from "@/components/sea-saw-page/crm/contact/input";
import AttachmentInput from "@/components/sea-saw-page/base/attachments/AttachmentInput";
import { Drawer, InputFooter } from "@/components/sea-saw-page/base";
import useOrderDrawerForm from "@/hooks/useOrderDrawerForm";

const { TextArea } = Input;

interface PurchaseOrderInputProps {
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
  orderCode?: string;
}

export default function PurchaseOrderInput({
  mode = "standalone",
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  def,
  data = {},
  pipelineId,
  columnOrder,
  orderCode,
}: PurchaseOrderInputProps) {
  const getDefaultValues = () => ({
    status: "draft",
    purchase_date: new Date().toISOString().split("T")[0],
    currency: "USD",
    ...(orderCode ? { purchase_code: orderCode } : {}),
  });

  const normalizePayload = (values: any) => {
    const payload = { ...values };
    delete payload.buyer;
    delete payload.supplier;
    delete payload.shipper;
    delete payload.contact;
    delete payload.bank_account;
    delete payload.related_order;
    payload.related_order =
      values.related_order?.id ||
      values.related_order?.pk ||
      values.related_order ||
      null;
    return payload;
  };

  const { form, loading, contextHolder, isEdit, handleSave } =
    useOrderDrawerForm({
      mode,
      isOpen,
      data,
      pipelineId,
      nestedViewSetKey: "nestedPurchaseOrder",
      standaloneViewSetKey: "purchaseOrder",
      nestedParamName: "pipeline",
      nestedPayloadKey: "pipeline",
      normalizePayload,
      defaultValues: getDefaultValues,
      entityName: "Purchase order",
      onClose,
      onCreate,
      onUpdate,
    });

  const purchaseItems = Form.useWatch("purchase_items", form);
  const deposit = Form.useWatch("deposit", form);
  const currency = Form.useWatch("currency", form);

  useEffect(() => {
    const totalAmount = (purchaseItems ?? []).reduce(
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
  }, [purchaseItems, deposit, currency, form]);

  const config = useMemo(
    () => ({
      buyer: {
        read_only: false,
        render: (def: any) => (
          <AccountSelector def={def} fieldName="buyer" idFieldName="buyer_id" />
        ),
      },
      buyer_id: { hidden: true },
      supplier: {
        read_only: false,
        render: (def: any) => (
          <AccountSelector
            def={def}
            fieldName="supplier"
            idFieldName="supplier_id"
          />
        ),
      },
      supplier_id: { hidden: true },
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
        render: (def: any) => <PurchaseOrderStatusSelector def={def} />,
      },
      purchase_items: {
        fullWidth: true,
        render: (def: any) => (
          <PurchaseOrderItemsInput
            def={def}
            showToolbar={mode === "standalone"}
          />
        ),
      },
      attachments: {
        fullWidth: true,
        render: (def: any) => <AttachmentInput def={def} />,
      },
      total_amount: { read_only: true, hidden: false },
      payment_terms: { render: () => <TextArea rows={3} /> },
      additional_info: { render: () => <TextArea rows={3} /> },
      comment: { render: () => <TextArea rows={3} /> },
      related_order: {
        hidden: mode === "nested",
        render: (def: any) => <PurchaseRelatedOrderSelector def={def} />,
      },
      related_order_id: { hidden: true },
    }),
    [mode],
  );

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title={isEdit ? i18n.t("Edit Purchase Order") : i18n.t("Create Purchase Order")}
      footer={
        <InputFooter loading={loading} onSave={handleSave} onCancel={onClose} />
      }
    >
      {contextHolder}

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <InputForm
          table="purchase_order"
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
