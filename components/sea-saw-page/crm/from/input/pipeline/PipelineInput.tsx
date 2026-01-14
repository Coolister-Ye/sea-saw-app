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
import Drawer from "../../base/Drawer.web";
import InputFooter from "../../base/InputFooter";
import InputForm from "@/components/sea-saw-design/form/InputForm";
import ContactSelector from "../contact/ContactSelector";
import AttachmentInput from "../shared/AttachmentInput";

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
  const { i18n } = useLocale();
  const { getViewSet } = useDataService();
  const pipelineViewSet = useMemo(() => getViewSet("pipeline"), [getViewSet]);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  /* ========================
   * State Management
   * ======================== */
  const [loading, setLoading] = useState(false);
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
        created_date: today,
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
   * Custom Field Renderers
   * ======================== */
  const config = useMemo(
    () => ({
      contact: {
        read_only: false, // Override backend read_only to make it editable
        render: (def: any) => <ContactSelector def={def} />,
      },
      contact_id: {
        hidden: true, // Hidden - auto-updated by ContactSelector
      },
      attachments: {
        fullWidth: true,
        render: (def: any) => <AttachmentInput def={def} />,
      },
    }),
    []
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

      // Convert to FormData if files are present
      const requestBody = prepareRequestBody(payload);

      const res = isEdit
        ? await pipelineViewSet.update({
            id: data.id!,
            body: requestBody,
          })
        : await pipelineViewSet.create({
            body: requestBody,
          });

      showMessage("success", i18n.t("save successfully"));

      if (isEdit) {
        onUpdate?.(res);
      } else {
        onCreate?.(res);
      }
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
    pipelineViewSet,
    data,
    onUpdate,
    onCreate,
    onClose,
  ]);

  /* ========================
   * Render
   * ======================== */
  const drawerTitle = isEdit ? i18n.t("Edit Pipeline") : i18n.t("Create Pipeline");
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
        />
      </ScrollView>
    </Drawer>
  );
}
