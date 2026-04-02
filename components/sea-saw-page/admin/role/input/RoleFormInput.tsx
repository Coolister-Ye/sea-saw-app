import React, { useState, useEffect, useRef, useMemo } from "react";
import i18n from "@/locale/i18n";
import { ScrollView } from "react-native";
import { Form, message } from "antd";

import useDataService from "@/hooks/useDataService";
import { Drawer, InputFooter } from "@/components/sea-saw-page/base";
import { InputForm } from "@/components/sea-saw-design/form/InputForm";
import { devError } from "@/utils/logger";

interface RoleFormInputProps {
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

export default function RoleFormInput({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  def,
  data = {},
  columnOrder,
}: RoleFormInputProps) {
  const { getViewSet } = useDataService();
  const roleViewSet = useMemo(() => getViewSet("adminRole"), [getViewSet]);

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
        ? await roleViewSet.update({ id: data.id!, body: values })
        : await roleViewSet.create({ body: values });

      messageApi.open({
        key: "save",
        type: "success",
        content: i18n.t("save successfully"),
      });

      isEdit ? onUpdate?.(res) : onCreate?.(res);
      onClose(res);
    } catch (err: any) {
      devError("Role save failed:", err);
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
      title={isEdit ? i18n.t("Edit Role") : i18n.t("Create Role")}
      footer={
        <InputFooter loading={loading} onSave={handleSave} onCancel={onClose} />
      }
    >
      {contextHolder}
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <InputForm
          table="adminRole"
          form={form}
          def={def}
          data={data}
          hideReadOnly={true}
          columnOrder={columnOrder}
        />
      </ScrollView>
    </Drawer>
  );
}
