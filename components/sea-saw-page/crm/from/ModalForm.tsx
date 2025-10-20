import { useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { Button } from "@/components/sea-saw-design/button";
import Drawer from "./Drawer";
import { Form } from "antd";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocale } from "@/context/Locale";

type ModalFormProps<T> = {
  entityName: string; // 实体名（order / product）
  def: any; // 表单定义
  renderForm: (form: any, def: any) => React.ReactNode; // 渲染表单
  renderItem?: (data: any) => React.ReactNode; // 渲染列表
  onChange?: (list: T[]) => void; // 外部同步
  value?: T[];
};

function ModalForm<T>({
  entityName,
  def,
  renderForm,
  renderItem,
  onChange,
  value = [],
}: ModalFormProps<T>) {
  const { i18n } = useLocale();
  const [form] = Form.useForm();
  const [list, setList] = useState<T[]>(value);
  const [isOpen, setIsOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      let updated: T[];
      if (editingIndex !== null) {
        updated = [...list];
        updated[editingIndex] = values;
      } else {
        updated = [...list, values];
      }
      setList(updated);
      onChange?.(updated);

      form.resetFields();
      setEditingIndex(null);
      setIsOpen(false);
    } catch (err) {
      console.log("表单校验失败", err);
    }
  };

  const handleEdit = (item: T, index: number) => {
    form.setFieldsValue(item);
    setEditingIndex(index);
    setIsOpen(true);
  };

  const handleAddNew = () => {
    form.resetFields();
    setEditingIndex(null);
    setIsOpen(true);
  };

  const handleDelete = (index: number) => {
    const updated = list.filter((_, i) => i !== index);
    setList(updated);
    onChange?.(updated);

    if (editingIndex === index) {
      setIsOpen(false);
      setEditingIndex(null);
    }
  };

  return (
    <View>
      <View>
        <Button
          variant="outline"
          className="w-fit h-fit py-1 px-3 bg-white"
          onPress={handleAddNew}
        >
          {i18n.t("add")}
        </Button>
      </View>

      <FlatList
        data={list}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleEdit(item, index)}
          >
            <View className="bg-white p-3 my-2 rounded border border-gray-200 relative">
              <Text className="font-semibold">
                {`${i18n.t(entityName)} ${index + 1}`}
              </Text>

              <TouchableOpacity
                onPress={() => handleDelete(index)}
                style={{ position: "absolute", right: 8, top: 8 }}
              >
                <MaterialIcons name="delete" size={20} color="red" />
              </TouchableOpacity>

              {renderItem
                ? renderItem(item)
                : Object.entries(item as any).map(([field, value]) => (
                    <Text key={field} className="text-sm text-gray-600">
                      {field}: {String(value)}
                    </Text>
                  ))}
            </View>
          </TouchableOpacity>
        )}
      />

      <Drawer
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setEditingIndex(null);
        }}
        title={
          editingIndex !== null
            ? i18n.t("edit") + i18n.t(entityName)
            : i18n.t("add") + i18n.t(entityName)
        }
        footer={
          <>
            <Button className="w-fit h-fit py-1" onPress={handleSave}>
              {i18n.t("Save")}
            </Button>
            <Button
              variant="outline"
              className="w-fit h-fit py-1 bg-white"
              onPress={() => {
                setIsOpen(false);
                setEditingIndex(null);
              }}
            >
              {i18n.t("Cancel")}
            </Button>
          </>
        }
      >
        <View className="bg-white p-5 rounded">{renderForm(form, def)}</View>
      </Drawer>
    </View>
  );
}

export default ModalForm;
