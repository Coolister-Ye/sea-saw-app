import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { ScrollView } from "react-native";
import { Form, message } from "antd";

import { useLocale } from "@/context/Locale";
import useDataService from "@/hooks/useDataService";
import { prepareRequestBody } from "@/utils/form";
import { devError } from "@/utils/logger";
import Drawer from "../../base/Drawer.web";
import InputFooter from "../../base/InputFooter";
import InputForm from "@/components/sea-saw-design/form/InputForm";
import ContactSelector from "../contact/ContactSelector";
import ProductInput from "./items/ProductInput";
import OrderStatusSelector from "./OrderStatusSelector";
import AttachmentInput from "../shared/AttachmentInput";

interface OrderInputProps {
  mode: "nested" | "standalone";
  isOpen: boolean;
  onClose: (res?: any) => void;
  onCreate?: (res?: any) => void;
  onUpdate?: (res?: any) => void;
  def: any;
  data?: {
    id?: string | number;
    [key: string]: any;
  };
  pipelineId?: string | number; // Required only for nested mode
}

export default function OrderInput({
  mode,
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  def,
  data = {},
  pipelineId,
}: OrderInputProps) {
  const { i18n } = useLocale();
  const { getViewSet } = useDataService();

  // ViewSets for different modes
  const orderViewSet = useMemo(() => getViewSet("order"), [getViewSet]);
  const nestedOrderViewSet = useMemo(
    () => getViewSet("nestedOrder"),
    [getViewSet]
  );

  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  /* ========================
   * State Management
   * ======================== */
  const [loading, setLoading] = useState(false);
  const prevOpenRef = useRef(isOpen);

  const isEdit = Boolean(data?.id);
  const isNested = mode === "nested";
  const isStandalone = mode === "standalone";

  /* ========================
   * Initialize Form with Default Values
   * ======================== */
  useEffect(() => {
    if (isOpen && !isEdit) {
      // Set default status to "draft" and order_date to today for new orders
      const today = new Date().toISOString().split("T")[0];
      form.setFieldsValue({
        status: "draft",
        order_date: today,
        currency: "USD",
      });
    }
  }, [isOpen, isEdit, form]);

  /* ========================
   * Reset Form on Drawer Close
   * ======================== */
  useEffect(() => {
    if (prevOpenRef.current && !isOpen) {
      form.resetFields();
    }
    prevOpenRef.current = isOpen;
  }, [isOpen, form]);

  /* ========================
   * Populate form when drawer opens with edit data
   * ======================== */
  useEffect(() => {
    if (isOpen && isEdit && data && Object.keys(data).length > 0) {
      form.setFieldsValue(data);
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
    [form]
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
  const config = useMemo(() => {
    const baseConfig: Record<string, any> = {
      contact: {
        read_only: false, // Override backend read_only to make it editable
        render: (def: any) => <ContactSelector def={def} />,
      },
      contact_id: {
        hidden: true, // Hidden - auto-updated by ContactSelector
      },
      status: {
        render: (def: any) => <OrderStatusSelector def={def} />,
      },
      order_items: {
        fullWidth: true,
        render: (def: any) => (
          <ProductInput
            def={def}
            onTotalsChange={handleTotalsChange}
            // In nested mode, don't show toolbar for adding new items
            showToolbar={isNested ? false : true}
          />
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
    };

    // In nested mode, hide related_pipeline field (it's auto-set)
    if (isNested) {
      baseConfig.related_pipeline = {
        hidden: true,
      };
    }

    return baseConfig;
  }, [handleTotalsChange, calculateBalance, isNested]);

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
    [messageApi]
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

      let res;

      if (isNested) {
        // Nested mode: Use NestedOrderViewSet API
        if (!pipelineId) {
          throw new Error("Pipeline ID is required for nested mode");
        }

        const nestedPayload = {
          ...payload,
          related_pipeline: pipelineId,
        };

        // Convert to FormData if files are present
        const requestBody = prepareRequestBody(nestedPayload);

        res = isEdit
          ? await nestedOrderViewSet.update({
              id: data.id!,
              body: requestBody,
              params: { related_pipeline: pipelineId, return_related: "true" },
            })
          : await nestedOrderViewSet.create({
              body: requestBody,
              params: { related_pipeline: pipelineId, return_related: "true" },
            });
      } else {
        // Standalone mode: Direct create/update on orderViewSet
        const requestBody = prepareRequestBody(payload);

        res = isEdit
          ? await orderViewSet.update({
              id: data.id!,
              body: requestBody,
            })
          : await orderViewSet.create({
              body: requestBody,
            });
      }

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
    isNested,
    pipelineId,
    nestedOrderViewSet,
    orderViewSet,
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
          table={isStandalone ? "order" : "order"}
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
