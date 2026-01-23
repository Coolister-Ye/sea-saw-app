import { useState, useCallback, useEffect } from "react";
import i18n from '@/locale/i18n';
import { View, FlatList, ScrollView } from "react-native";
import { Button } from "@/components/ui/button";
import Drawer from "./Drawer";
import { Form } from "antd";
import { Text } from "@/components/ui/text";
import InputHeader from "./InputHeader";
import InputFooter from "./InputFooter";

interface ModalFormProps<T> {
  entityName: string;
  def: any;
  value?: T[];
  onChange?: (list: T[]) => void;
  renderItem?: (
    data: T,
    onEdit: () => void,
    onDelete: () => void
  ) => React.ReactNode;
  renderForm: (form: any, def: any) => React.ReactNode;
}

function ModalForm<T>({
  entityName,
  def,
  renderForm,
  renderItem,
  value = [],
  onChange,
}: ModalFormProps<T>) {
  const [form] = Form.useForm();

  const [list, setList] = useState<T[]>(value);
  const [isOpen, setIsOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  /** 当外部 value 更新时同步内部 list */
  useEffect(() => {
    setList(value);
  }, [value]);

  /** 公用关闭逻辑 */
  const closeDrawer = useCallback(() => {
    setIsOpen(false);
    setEditingIndex(null);
    form.resetFields();
  }, [form]);

  /** 打开新增 */
  const openAdd = useCallback(() => {
    setEditingIndex(null);
    form.resetFields();
    setIsOpen(true);
  }, [form]);

  /** 打开编辑 */
  const handleEdit = useCallback(
    (item: T, index: number) => {
      setEditingIndex(index);
      form.setFieldsValue(item);
      setIsOpen(true);
    },
    [form]
  );

  /** 保存（新增或编辑） */
  const handleSave = useCallback(async () => {
    try {
      const values = await form.validateFields();

      const updatedList =
        editingIndex === null
          ? [...list, values]
          : list.map((item, i) => (i === editingIndex ? values : item));

      setList(updatedList);
      onChange?.(updatedList);
      closeDrawer();
    } catch (e) {
      console.warn("Validation failed:", e);
    }
  }, [editingIndex, list, form, onChange, closeDrawer]);

  /** 删除 */
  const handleDelete = useCallback(
    (index: number) => {
      const updated = list.filter((_, i) => i !== index);
      setList(updated);
      onChange?.(updated);
    },
    [list, onChange]
  );

  /** 单条项目展示组件 */
  const ItemView = ({ item, index }: { item: T; index: number }) => (
    <View key={index}>
      {renderItem
        ? renderItem(
            item,
            () => handleEdit(item, index),
            () => handleDelete(index)
          )
        : Object.entries(item as Record<string, any>).map(([k, v]) => (
            <Text key={k} className="text-sm text-gray-600">
              {k}: {String(v)}
            </Text>
          ))}
    </View>
  );

  return (
    <View className="gap-1">
      {/* Add 按钮 */}
      <View className="flex flex-row justify-end">
        <Button
          variant="outline"
          className="py-1 px-3 bg-white"
          onPress={openAdd}
        >
          <Text>{i18n.t("add")}</Text>
        </Button>
      </View>

      {/* 列表 */}
      <FlatList
        data={list}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{ gap: 10 }}
        renderItem={({ item, index }) => <ItemView item={item} index={index} />}
      />

      {/* 弹出抽屉 */}
      <Drawer isOpen={isOpen} onClose={closeDrawer}>
        <InputHeader
          title={
            editingIndex === null
              ? `${i18n.t("add")} ${i18n.t(entityName)}`
              : `${i18n.t("Edit")} ${i18n.t(entityName)}`
          }
        />

        {/* 表单区域 */}
        <ScrollView className="bg-white p-5 rounded">
          {renderForm(form, def)}
        </ScrollView>

        {/* 底部按钮 */}
        <InputFooter onSave={handleSave} onCancel={closeDrawer} />
      </Drawer>
    </View>
  );
}

export default ModalForm;
export { ModalForm };
