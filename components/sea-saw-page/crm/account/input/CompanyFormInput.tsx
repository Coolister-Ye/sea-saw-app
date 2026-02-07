import React, { useState, useEffect, useRef, useMemo } from "react";
import i18n from '@/locale/i18n';
import { ScrollView } from "react-native";
import { Form, message } from "antd";

import Drawer from "../../../base/Drawer.web";
import InputFooter from "../../../base/InputFooter";
import InputForm from "@/components/sea-saw-design/form/InputForm";

import useDataService from "@/hooks/useDataService";

interface CompanyFormInputProps {
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

export default function CompanyFormInput({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  def,
  data = {},
}: CompanyFormInputProps) {
  const { getViewSet } = useDataService();
  const companyViewSet = useMemo(() => getViewSet("company"), [getViewSet]);

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
   * Save (Create / Update company)
   * ======================== */
  const handleSave = async () => {
    try {
      setLoading(true);

      const values = await form.validateFields();

      messageApi.open({
        key: "save",
        type: "loading",
        content: i18n.t("saving"),
        duration: 0,
      });

      const res = isEdit
        ? await companyViewSet.update({
            id: data.id!,
            body: values,
          })
        : await companyViewSet.create({
            body: values,
          });

      messageApi.open({
        key: "save",
        type: "success",
        content: i18n.t("save successfully"),
      });

      isEdit ? onUpdate?.(res) : onCreate?.(res);
      onClose(res);
    } catch (err: any) {
      console.error("Company save failed:", err);
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
      title={isEdit ? i18n.t("Edit Company") : i18n.t("Create Company")}
      footer={
        <InputFooter loading={loading} onSave={handleSave} onCancel={onClose} />
      }
    >
      {contextHolder}

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <InputForm
          table="company"
          form={form}
          def={def}
          data={data}
          hideReadOnly={true}
        />
      </ScrollView>
    </Drawer>
  );
}
