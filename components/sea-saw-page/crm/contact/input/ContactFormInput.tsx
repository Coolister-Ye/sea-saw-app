import React, { useState, useEffect, useRef, useMemo } from "react";
import i18n from "@/locale/i18n";
import { ScrollView } from "react-native";
import { Form, message } from "antd";

import InputForm from "@/components/sea-saw-design/form/InputForm";
import AccountSelector from "@/components/sea-saw-page/crm/account/input/AccountSelector";

import useDataService from "@/hooks/useDataService";
import { InputFooter, Drawer } from "@/components/sea-saw-page/base";

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
  const { getViewSet } = useDataService();
  const contactViewSet = useMemo(() => getViewSet("contact"), [getViewSet]);

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const prevOpenRef = useRef(isOpen);

  const isEdit = Boolean(data?.id);

  useEffect(() => {
    if (prevOpenRef.current && !isOpen) {
      form.resetFields();
    }
    prevOpenRef.current = isOpen;
  }, [isOpen, form]);

  const config = useMemo(
    () => ({
      account: {
        read_only: false,
        render: (def: any) => <AccountSelector def={def} />,
      },
      account_id: {
        hidden: true,
      },
    }),
    [],
  );

  const handleSave = async () => {
    try {
      setLoading(true);

      const values = await form.validateFields();

      console.log("values", values);
      const payload = { ...values };
      delete payload.account;

      messageApi.open({
        key: "save",
        type: "loading",
        content: i18n.t("saving"),
        duration: 0,
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
