import { useState, useMemo } from "react";
import i18n from '@/locale/i18n';
import { ScrollView } from "react-native";
import { Form } from "antd";
import useDataService from "@/hooks/useDataService";

import Drawer from "./base/Drawer.web";
import InputFooter from "./base/InputFooter.web";
import InputForm from "@/components/sea-saw-design/form/InputForm";

import Order from "./Order.web";
import Contact from "./Contact";
import { message } from "antd";

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
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { getViewSet } = useDataService();
  const contractViewSet = useMemo(() => getViewSet("contract"), [getViewSet]);
  const [messageApi, contextHolder] = message.useMessage();

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

      messageApi.open({
        key: "save",
        type: "loading",
        content: `${i18n.t("saving")} ...`,
      });

      let res;
      if (id) {
        res = await contractViewSet.update({ id, body: payload });
        onUpdate?.(res);
      } else {
        res = await contractViewSet.create({ body: payload });
        onCreate?.(res);
      }

      messageApi.open({
        key: "save",
        type: "success",
        content: i18n.t("save successfully"),
      });

      onClose(res);
    } catch (err: any) {
      console.error("表单提交失败:", err);

      const errorMsg =
        err?.message ||
        err?.response?.data?.message ||
        i18n.t("Save failed, please try again");

      messageApi.open({
        key: "save",
        type: "error",
        content: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <InputFooter onSave={handleSave} onCancel={onClose} loading={loading} />
  );

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title={i18n.t("contract")}
      footer={footer}
    >
      {contextHolder}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <InputForm
          data={data}
          form={form}
          table="contract"
          def={def}
          config={config}
        />
      </ScrollView>
    </Drawer>
  );
}
