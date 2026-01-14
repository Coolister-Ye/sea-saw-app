import { useState, useMemo } from "react";
import { Pressable, ScrollView, Text } from "react-native";
import { Form } from "antd";
import { useLocale } from "@/context/Locale";
import useDataService from "@/hooks/useDataService";

import Drawer from "./base/Drawer";
import InputHeader from "./base/InputHeader";
import InputFooter from "./base/InputFooter";
import InputForm from "@/components/sea-saw-design/form/InputForm";

import Order from "./Order";
import Contact from "./Contact";
import { useToast } from "@/context/Toast";

interface ContractProps {
  isOpen: boolean;
  onClose: (res?: any) => void;
  onCreate?: (res?: any) => void;
  onUpdate?: (res?: any) => void;
  def?: any;
  data?: any;
}

export default function Contract({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  def,
  data,
}: ContractProps) {
  const { i18n } = useLocale();
  const { showToast } = useToast();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { getViewSet } = useDataService();
  const contractViewSet = useMemo(() => getViewSet("contract"), [getViewSet]);

  /** 配置模块渲染器 */
  const config = useMemo(
    () => ({
      orders: { render: (def: any) => <Order def={def} /> },
      contact: { render: (def: any) => <Contact def={def} /> },
    }),
    []
  );

  /** 保存数据 */
  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const id = values.pk;

      const payload = {
        ...values,
        contact: Array.isArray(values.contact)
          ? values.contact[0]
          : values.contact,
      };

      showToast({ message: `${i18n.t("saving")} ...` });

      let res;
      if (id) {
        res = await contractViewSet.update({ id, body: payload });
        onUpdate?.(res);
      } else {
        res = await contractViewSet.create({ body: payload });
        onCreate?.(res);
      }

      console.log("表单提交成功:", res);
      showToast({
        message: i18n.t("save successfully"),
        variant: "success",
      });

      onClose(res);
    } catch (err: any) {
      console.error("表单提交失败:", err);

      const errorMsg =
        err?.message ||
        err?.response?.data?.message ||
        i18n.t("Save failed, please try again");

      showToast({
        message: errorMsg,
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose}>
      <InputHeader title={i18n.t("contract")} />

      <ScrollView
        className="flex-1 p-4"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <InputForm
          data={data}
          form={form}
          table="contract"
          def={def}
          config={config}
          className="bg-white p-4 rounded"
        />
      </ScrollView>

      <InputFooter onSave={handleSave} onCancel={onClose} loading={loading} />
    </Drawer>
  );
}
