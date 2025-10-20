import { useState, useMemo } from "react";
import { View, Text, ScrollView } from "react-native";
import { Form } from "antd";
import InputForm from "@/components/sea-saw-design/form/InputForm";
import Order from "./Order";
import Contact from "./Contact";
import { useLocale } from "@/context/Locale";
import { Button } from "@/components/sea-saw-design/button";
import useDataService from "@/hooks/useDataService";

interface ContractProps {
  onClose?: () => void;
  def?: any;
}

export default function Contract({ onClose, def }: ContractProps) {
  const { i18n } = useLocale();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { create } = useDataService();

  /** 模块渲染配置 */
  const config = useMemo(
    () => ({
      orders: { render: (def: any) => <Order def={def} /> },
      contact: { render: (def: any) => <Contact def={def} /> },
    }),
    []
  );

  /** 保存逻辑 */
  const onSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      // contact 取第一个元素
      if (Array.isArray(values.contact)) {
        values.contact = values.contact[0];
      }

      console.log("Contract 提交数据:", values);

      await create({
        contentType: "contract",
        body: values,
      });

      onClose && onClose();
    } catch (err) {
      console.error("表单验证或提交失败:", err);
    } finally {
      setLoading(false);
    }
  };

  /** 取消逻辑 */
  const onCancel = () => {
    form.resetFields();
    onClose && onClose();
  };

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="flex flex-row justify-between items-center p-5 border-b border-gray-200 bg-white">
        <Text className="text-lg font-semibold">{i18n.t("contract")}</Text>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 p-4"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <InputForm
          form={form}
          table="contract"
          def={def}
          config={config}
          className="bg-white p-4 rounded"
        />
      </ScrollView>

      {/* Footer */}
      <View className="flex flex-row gap-3 p-5 border-t border-gray-200 bg-white">
        <Button
          className="w-fit h-fit py-1"
          onPress={onSave}
          disabled={loading}
        >
          {i18n.t("Save")}
        </Button>
        <Button
          variant="outline"
          className="w-fit h-fit py-1 bg-white"
          onPress={onCancel}
        >
          {i18n.t("Cancel")}
        </Button>
      </View>
    </View>
  );
}
