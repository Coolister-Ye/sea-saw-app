import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import i18n from "@/locale/i18n";
import { ScrollView } from "react-native";
import { Form, message } from "antd";

import useDataService from "@/hooks/useDataService";
import { Drawer, InputFooter } from "@/components/sea-saw-page/base";
import { InputForm } from "@/components/sea-saw-design/form/InputForm";
import { devError } from "@/utils/logger";
import ContactsInput from "./ContactsInput";

interface AccountFormInputProps {
  isOpen: boolean;
  onClose: (res?: any) => void;
  onCreate?: (res?: any) => void;
  onUpdate?: (res?: any) => void;
  def: any;
  data?: {
    id?: string | number;
    [key: string]: any;
  };
  columnOrder?: string[];
}

export default function AccountFormInput({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  def,
  data = {},
  columnOrder,
}: AccountFormInputProps) {
  const { getViewSet } = useDataService();
  const accountViewSet = useMemo(() => getViewSet("account"), [getViewSet]);

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

  // Configure custom renderers for fields
  const config = useMemo(
    () => ({
      contacts: {
        fullWidth: true,
        render: (def: any) => <ContactsInput def={def} />,
        hidden: false,
      },
      contact_ids: {
        hidden: true,
      },
    }),
    [],
  );

  const normalizePayload = useCallback((values: any) => {
    const payload = { ...values };

    // Convert contacts array to contact_ids for backend
    if (payload.contacts && Array.isArray(payload.contacts)) {
      payload.contact_ids = payload.contacts.map((contact: any) => contact.id);
      delete payload.contacts;
    }

    return payload;
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);

      const values = await form.validateFields();
      const payload = normalizePayload(values);

      messageApi.open({
        key: "save",
        type: "loading",
        content: i18n.t("saving"),
        duration: 0,
      });

      const res = isEdit
        ? await accountViewSet.update({
            id: data.id!,
            body: payload,
          })
        : await accountViewSet.create({
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
      devError("Account save failed:", err);
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
      onClose={onClose}
      title={isEdit ? i18n.t("Edit Account") : i18n.t("Create Account")}
      footer={
        <InputFooter loading={loading} onSave={handleSave} onCancel={onClose} />
      }
    >
      {contextHolder}

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <InputForm
          table="account"
          form={form}
          def={def}
          data={data}
          config={config}
          hideReadOnly={true}
          columnOrder={columnOrder}
        />
      </ScrollView>
    </Drawer>
  );
}
