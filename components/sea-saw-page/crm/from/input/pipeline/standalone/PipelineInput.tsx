import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { ScrollView, View } from "react-native";
import i18n from '@/locale/i18n';
import { Form, message } from "antd";

import useDataService from "@/hooks/useDataService";
import { prepareRequestBody } from "@/utils/form";
import Drawer from "../../../base/Drawer.web";
import InputFooter from "../../../base/InputFooter";
import InputForm from "@/components/sea-saw-design/form/InputForm";
import CompanySelector from "../../company/shared/CompanySelector";
import ContactSelector from "../../contact/shared/ContactSelector";
import OrderSelector from "../../order/shared/selectors/OrderSelector";
import AutoCreateOrderToggle from "../../order/shared/selectors/AutoCreateOrderToggle";

interface PipelineInputProps {
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

export default function PipelineInput({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  def,
  data = {},
}: PipelineInputProps) {
  const { getViewSet } = useDataService();
  const pipelineViewSet = useMemo(() => getViewSet("pipeline"), [getViewSet]);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  /* ========================
   * State Management
   * ======================== */
  const [loading, setLoading] = useState(false);
  const [autoCreateOrder, setAutoCreateOrder] = useState(false);
  const prevOpenRef = useRef(isOpen);
  const isEdit = Boolean(data?.id);

  /* ========================
   * Initialize Form with Default Values
   * ======================== */
  useEffect(() => {
    if (isOpen && !isEdit) {
      // Set default values for new pipelines
      const today = new Date().toISOString().split("T")[0];
      form.setFieldsValue({
        order_date: today,
        status: "draft",
      });
    }
  }, [isOpen, isEdit, form]);

  /* ========================
   * Reset Form on Drawer Close
   * ======================== */
  useEffect(() => {
    if (prevOpenRef.current && !isOpen) {
      form.resetFields();
      setAutoCreateOrder(false);
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
   * Custom Field Renderers
   * ======================== */
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
      order: {
        read_only: false,
        render: (def: any) => (
          <View>
            {/* Order Selector */}
            <OrderSelector def={{ ...def, read_only: autoCreateOrder }} />

            {/* Auto-create Order Toggle (only for new pipelines) */}
            {!isEdit && (
              <AutoCreateOrderToggle
                checked={autoCreateOrder}
                onChange={(checked) => {
                  setAutoCreateOrder(checked);
                  if (checked) {
                    // Clear the order field when auto-create is enabled
                    form.setFieldsValue({ order: null, order_id: null });
                  }
                }}
              />
            )}
          </View>
        ),
      },
      order_id: { hidden: true },
    }),
    [autoCreateOrder, isEdit, i18n, form]
  );

  /* ========================
   * Helper Functions
   * ======================== */
  const normalizePayload = useCallback((values: any) => {
    const payload = { ...values };

    // Extract IDs from nested objects (only if _id field doesn't already exist)
    // Note: Some selectors return arrays, some return objects
    if (payload.company && !payload.company_id) {
      const company = Array.isArray(payload.company) ? payload.company[0] : payload.company;
      payload.company_id = company?.id ?? company?.pk;
    }
    if (payload.contact && !payload.contact_id) {
      const contact = Array.isArray(payload.contact) ? payload.contact[0] : payload.contact;
      payload.contact_id = contact?.id ?? contact?.pk;
    }
    if (payload.order && !payload.order_id) {
      const order = Array.isArray(payload.order) ? payload.order[0] : payload.order;
      payload.order_id = order?.id ?? order?.pk;
    }

    // Remove read-only nested objects (backend uses _id fields for write)
    delete payload.company;
    delete payload.contact;
    delete payload.order;

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

      // Add auto_create_order flag when creating new pipeline
      if (!isEdit && autoCreateOrder) {
        payload.auto_create_order = true;
      }

      showMessage("loading", i18n.t("saving"));

      // Convert to FormData if files are present
      const requestBody = prepareRequestBody(payload);

      let res;

      if (isEdit) {
        // Update existing pipeline
        res = await pipelineViewSet.update({
          id: data.id!,
          body: requestBody,
        });
        onUpdate?.(res);
      } else {
        // Create new pipeline (backend will auto-create order if auto_create_order=true)
        res = await pipelineViewSet.create({
          body: requestBody,
        });
        onCreate?.(res);
      }

      showMessage("success", i18n.t("save successfully"));
      onClose(res);
    } catch (err: any) {
      console.error("Pipeline save failed:", err);
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
    autoCreateOrder,
    pipelineViewSet,
    data,
    onUpdate,
    onCreate,
    onClose,
  ]);

  /* ========================
   * Render
   * ======================== */
  const drawerTitle = isEdit
    ? i18n.t("Edit Pipeline")
    : i18n.t("Create Pipeline");
  const footer = (
    <InputFooter loading={loading} onSave={handleSave} onCancel={onClose} />
  );

  return (
    <Drawer open={isOpen} onClose={onClose} title={drawerTitle} footer={footer}>
      {contextHolder}

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <InputForm
          table="pipeline"
          form={form}
          def={def}
          data={data}
          config={config}
          hideReadOnly={true}
        />
      </ScrollView>
    </Drawer>
  );
}
