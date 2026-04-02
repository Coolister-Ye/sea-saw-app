import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import i18n from "@/locale/i18n";
import { ScrollView } from "react-native";
import { Form, message, Select } from "antd";

import useDataService from "@/hooks/useDataService";
import { Drawer, InputFooter } from "@/components/sea-saw-page/base";
import { InputForm } from "@/components/sea-saw-design/form/InputForm";
import { devError } from "@/utils/logger";

interface UserAdminFormInputProps {
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

export default function UserAdminFormInput({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  def,
  data = {},
  columnOrder,
}: UserAdminFormInputProps) {
  const { getViewSet } = useDataService();
  const userViewSet = useMemo(() => getViewSet("adminUser"), [getViewSet]);
  const roleViewSet = useMemo(() => getViewSet("adminRole"), [getViewSet]);

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [roles, setRoles] = useState<{ label: string; value: number }[]>([]);
  const prevOpenRef = useRef(isOpen);

  const isEdit = Boolean(data?.id);

  // Load roles for the selector
  useEffect(() => {
    roleViewSet.list({}).then((res: any) => {
      const results = res?.results ?? res ?? [];
      setRoles(
        results.map((r: any) => ({ label: r.role_name, value: r.id })),
      );
    }).catch(() => {});
  }, [roleViewSet]);

  useEffect(() => {
    if (prevOpenRef.current && !isOpen) {
      form.resetFields();
    }
    prevOpenRef.current = isOpen;
  }, [isOpen, form]);

  // Hide the nested role object; show role_id as a Select; hide password when editing (keep optional)
  const config = useMemo(
    () => ({
      role: { hidden: true },
      role_id: {
        render: () => (
          <Form.Item
            name="role_id"
            label={i18n.t("Role")}
          >
            <Select
              allowClear
              options={roles}
              placeholder={i18n.t("Select")}
            />
          </Form.Item>
        ),
        fullWidth: false,
      },
      password: isEdit
        ? {
            extra: i18n.t("Leave blank to keep current password"),
          }
        : {},
    }),
    [roles, isEdit],
  );

  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      // Remove empty password on edit so backend doesn't set blank password
      if (isEdit && !values.password) {
        delete values.password;
      }

      messageApi.open({
        key: "save",
        type: "loading",
        content: i18n.t("saving"),
        duration: 0,
      });

      const res = isEdit
        ? await userViewSet.update({ id: data.id!, body: values })
        : await userViewSet.create({ body: values });

      messageApi.open({
        key: "save",
        type: "success",
        content: i18n.t("save successfully"),
      });

      isEdit ? onUpdate?.(res) : onCreate?.(res);
      onClose(res);
    } catch (err: any) {
      devError("User save failed:", err);
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
      title={isEdit ? i18n.t("Edit User") : i18n.t("Create User")}
      footer={
        <InputFooter loading={loading} onSave={handleSave} onCancel={onClose} />
      }
    >
      {contextHolder}
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <InputForm
          table="adminUser"
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
