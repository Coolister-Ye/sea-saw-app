import React, { useState, useEffect, useRef, useMemo } from "react";
import { ScrollView } from "react-native";
import { Form, message } from "antd";

import Drawer from "../../../base/Drawer.web";
import InputFooter from "../../../base/InputFooter";
import InputForm from "@/components/sea-saw-design/form/InputForm";
import PurchaseOrderItemsInput from "../shared/items/PurchaseOrderItemsInput";
import PurchaseOrderStatusSelector from "../shared/selectors/PurchaseOrderStatusSelector";
import RelatedOrderSelector from "../shared/selectors/RelatedOrderSelector";
import SupplierSelector from "../shared/selectors/SupplierSelector";

import { useLocale } from "@/context/Locale";
import useDataService from "@/hooks/useDataService";
import { prepareRequestBody, devError } from "@/utils";
import { AttachmentInput } from "../../shared";

interface PurchaseOrderInputProps {
  isOpen: boolean;
  onClose: (res?: any) => void;
  onCreate?: (res?: any) => void;
  onUpdate?: (res?: any) => void;
  def: any;
  data?: {
    id?: string | number;
    [key: string]: any;
  };
  orderId?: string | number; // Required only for nested mode
}

export default function PurchaseOrderInput({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  def,
  data = {},
  orderId,
}: PurchaseOrderInputProps) {
  const { i18n } = useLocale();
  const { getViewSet } = useDataService();
  const purchaseOrder = useMemo(
    () => getViewSet("purchaseOrder"),
    [getViewSet],
  );
  const nestedPurchaseOrder = useMemo(
    () => getViewSet("nestedPurchaseOrder"),
    [getViewSet],
  );

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const prevOpenRef = useRef(isOpen);

  const isEdit = Boolean(data?.id);
  const isNested = true;
  const isStandalone = false;

  /* ========================
   * Reset form when drawer closes
   * ======================== */
  useEffect(() => {
    // Only reset when transitioning from open to closed
    if (prevOpenRef.current && !isOpen) {
      form.resetFields();
    }
    prevOpenRef.current = isOpen;
  }, [isOpen, form]);

  /* ========================
   * Populate form when drawer opens with data
   * ======================== */
  useEffect(() => {
    if (isOpen && data && Object.keys(data).length > 0) {
      form.setFieldsValue(data);
    }
  }, [isOpen, data, form]);

  /* ========================
   * InputForm Custom Field Renderers
   * ======================== */
  const config = useMemo(() => {
    const baseConfig: Record<string, any> = {
      status: {
        render: (def: any) => <PurchaseOrderStatusSelector def={def} />,
      },
      supplier: {
        render: (def: any) => <SupplierSelector def={def} />,
      },
      attachments: {
        fullWidth: true,
        render: (def: any, value: any[] = [], onChange: (v: any[]) => void) => (
          <AttachmentInput def={def} value={value} onChange={onChange} />
        ),
      },
      purchase_items: {
        fullWidth: true,
        render: (def: any, value: any[] = [], onChange: (v: any[]) => void) => (
          <PurchaseOrderItemsInput
            def={def}
            value={value}
            onChange={onChange}
            showToolbar={isNested ? false : true}
          />
        ),
      },
    };

    // Only add related_order selector in standalone mode
    if (isStandalone) {
      baseConfig.related_order = {
        render: (def: any) => <RelatedOrderSelector def={def} />,
      };
    }

    return baseConfig;
  }, [isNested, isStandalone]);

  /* ========================
   * Save handler (mode-specific)
   * ======================== */
  const handleSave = async () => {
    try {
      setLoading(true);

      const values = await form.validateFields();

      messageApi.open({
        key: "save",
        type: "loading",
        content: i18n.t("saving"),
      });

      let res;

      if (isNested) {
        // Nested mode: Use NestedPurchaseOrderViewSet API
        if (!orderId) {
          throw new Error("Order ID is required for nested mode");
        }

        const payload = {
          ...values,
          // Keep related_order in body for backward compatibility
          related_order: orderId,
        };

        // Convert to FormData if files are present
        const requestBody = prepareRequestBody(payload);

        res = isEdit
          ? await nestedPurchaseOrder.update({
              id: data.id!,
              body: requestBody,
              params: { related_order: orderId, return_related: "true" },
            })
          : await nestedPurchaseOrder.create({
              body: requestBody,
              params: { related_order: orderId, return_related: "true" },
            });
      } else {
        // Standalone mode: Direct create/update on purchaseOrder
        const payload = {
          ...values,
          // Transform related_order if it's an object
          related_order:
            values.related_order?.id ||
            values.related_order?.pk ||
            values.related_order,
        };

        res = isEdit
          ? await purchaseOrder.update({
              id: data.id!,
              body: payload,
            })
          : await purchaseOrder.create({
              body: payload,
            });
      }

      messageApi.open({
        key: "save",
        type: "success",
        content: i18n.t("save successfully"),
      });

      if (isEdit) {
        onUpdate?.(res);
      } else {
        onCreate?.(res);
      }
      onClose(res);
    } catch (err: any) {
      devError("Purchase order save failed:", err);
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
      title={
        isEdit ? i18n.t("Edit Purchase Order") : i18n.t("Create Purchase Order")
      }
      footer={
        <InputFooter loading={loading} onSave={handleSave} onCancel={onClose} />
      }
    >
      {contextHolder}

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <InputForm
          table={isStandalone ? "purchaseOrder" : "purchase_order"}
          form={form}
          def={def}
          data={data}
          config={config}
        />
      </ScrollView>
    </Drawer>
  );
}
