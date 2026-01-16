import React, { useState, useEffect, useRef, useMemo } from "react";
import { ScrollView } from "react-native";
import { Form, message } from "antd";

import Drawer from "../../base/Drawer.web";
import InputFooter from "../../base/InputFooter";
import InputForm from "@/components/sea-saw-design/form/InputForm";
import CompanySelector from "../company/CompanySelector";

import { useLocale } from "@/context/Locale";
import useDataService from "@/hooks/useDataService";

interface ContactFormInputProps {
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

export default function ContactFormInput({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  def,
  data = {},
}: ContactFormInputProps) {
  const { i18n } = useLocale();
  const { getViewSet } = useDataService();
  const contactViewSet = useMemo(() => getViewSet("contact"), [getViewSet]);

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const prevOpenRef = useRef(isOpen);

  const isEdit = Boolean(data?.id);

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
   * InputForm custom config
   * ======================== */
  const config = useMemo(
    () => ({
      company: {
        read_only: false, // Override backend read_only to make it editable
        render: (def: any) => <CompanySelector def={def} />,
      },
      company_id: {
        hidden: true, // Hidden - auto-updated by CompanySelector
      },
    }),
    []
  );

  /* ========================
   * Save (Create / Update contact)
   * ======================== */
  const handleSave = async () => {
    try {
      setLoading(true);

      const values = await form.validateFields();

      // CompanySelector already sets company_id directly
      const payload = { ...values };
      delete payload.company;

      messageApi.open({
        key: "save",
        type: "loading",
        content: i18n.t("saving"),
        duration: 0, // Don't auto-close loading message
      });

      const res = isEdit
        ? await contactViewSet.update({
            id: data.id!,
            body: payload,
          })
        : await contactViewSet.create({
            body: payload,
          });

      messageApi.open({
        key: "save",
        type: "success",
        content: i18n.t("save successfully"),
      });

      isEdit ? onUpdate?.(res) : onCreate?.(res);
      onClose(res);
    } catch (err: any) {
      console.error("Contact save failed:", err);
      messageApi.open({
        key: "save",
        type: "error",
        content:
          err?.message ||
          err?.response?.data?.message ||
          i18n.t("Save failed, please try again"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      open={isOpen}
      onClose={() => {
        onClose();
      }}
      title={isEdit ? i18n.t("Edit Contact") : i18n.t("Create Contact")}
      footer={
        <InputFooter loading={loading} onSave={handleSave} onCancel={onClose} />
      }
    >
      {contextHolder}

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <InputForm
          table="contact"
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
