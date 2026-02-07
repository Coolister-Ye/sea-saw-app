import { useState, useCallback, useEffect, useMemo } from "react";
import i18n from "@/locale/i18n";
import { View, FlatList, ScrollView } from "react-native";
import { Checkbox } from "antd";
import { Button } from "@/components/sea-saw-design/button";
import Drawer from "./Drawer";
import { Form } from "antd";
import { Text } from "@/components/sea-saw-design/text";
import InputFooter from "./InputFooter";
import EmptySlot from "./EmptySlot";

interface ModalFormProps<T> {
  entityName: string;
  def: any;
  value?: T[];
  onChange?: (list: T[]) => void;
  renderItem?: (
    data: T,
    onEdit: () => void,
    onDelete: () => void,
    onCopy: () => void,
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
  const [open, setOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [pendingCopyItem, setPendingCopyItem] = useState<T | null>(null); // 待复制的数据

  /** 外部 value 变化 → 内部同步 */
  useEffect(() => {
    setList(value);
  }, [value]);

  /** 关闭抽屉 */
  const closeDrawer = useCallback(() => {
    setOpen(false);
    setEditingIndex(null);
    setPendingCopyItem(null);
    form.resetFields();
  }, [form]);

  /** 新增 */
  const openAdd = useCallback(() => {
    setEditingIndex(null);
    setPendingCopyItem(null);
    form.resetFields();
    setOpen(true);
  }, [form]);

  /** 编辑 */
  const handleEdit = useCallback(
    (item: T, index: number) => {
      setEditingIndex(index);
      setPendingCopyItem(null);
      form.setFieldsValue(item);
      setOpen(true);
    },
    [form],
  );

  /** 点击复制 → 填充 form，但不直接加入 list */
  const handleCopy = useCallback(
    (item: T) => {
      const cloned = JSON.parse(JSON.stringify(item));

      const removeId = (obj: any) => {
        if (!obj || typeof obj !== "object") return;
        if (Array.isArray(obj)) {
          obj.forEach(removeId);
          return;
        }
        delete obj.id;
        delete obj.pk;
        delete obj._id;
        Object.values(obj).forEach(removeId);
      };
      removeId(cloned);

      setPendingCopyItem(cloned);
      setEditingIndex(null); // 复制不是编辑已有条目
      form.setFieldsValue(cloned);
      setOpen(true);
    },
    [form],
  );

  /** 保存（新增/编辑/复制） */
  const handleSave = useCallback(async () => {
    try {
      const values = await form.validateFields();

      let updatedList: T[];
      if (editingIndex !== null) {
        // 编辑
        updatedList = list.map((item, i) =>
          i === editingIndex ? values : item,
        );
      } else if (pendingCopyItem) {
        // 复制确认
        updatedList = [...list, values];
      } else {
        // 新增
        updatedList = [...list, values];
      }

      setList(updatedList);
      onChange?.(updatedList);
      closeDrawer();
    } catch (e) {
      console.warn("Validation failed:", e);
    }
  }, [editingIndex, pendingCopyItem, list, form, onChange, closeDrawer]);

  /** 删除 */
  const handleDelete = useCallback(
    (index: number) => {
      const updated = list.filter((_, i) => i !== index);
      setList(updated);
      onChange?.(updated);
      if (selectedIndex === index) setSelectedIndex(null);
    },
    [list, onChange, selectedIndex],
  );

  /** ItemView 使用 React.memo 避免不必要的重渲染 */
  const ItemView = useMemo(() => {
    return ({ item, index }: { item: T; index: number }) => (
      <View key={index} className="relative mb-2">
        <View>
          {renderItem
            ? renderItem(
                item,
                () => handleEdit(item, index),
                () => handleDelete(index),
                () => handleCopy(item),
              )
            : Object.entries(item as any).map(([k, v]) => (
                <Text key={k}>
                  {k}: {String(v)}
                </Text>
              ))}
        </View>

        {/* 右上角单选 Checkbox */}
        <View className="absolute top-1 right-2">
          <Checkbox
            checked={selectedIndex === index}
            onChange={() =>
              setSelectedIndex(selectedIndex === index ? null : index)
            }
          />
        </View>
      </View>
    );
  }, [selectedIndex, handleEdit, handleDelete, handleCopy]);

  /** 抽屉 footer */
  const footer = <InputFooter onSave={handleSave} onCancel={closeDrawer} />;

  return (
    <View className="gap-2">
      {/* Add / Copy / Delete 按钮 */}
      <View className="flex flex-row justify-end gap-1">
        <Button type="primary" size="small" onPress={openAdd}>
          <Text>{i18n.t("add")}</Text>
        </Button>
        <Button
          size="small"
          onPress={() => {
            if (selectedIndex !== null) handleCopy(list[selectedIndex]);
          }}
          disabled={selectedIndex === null}
        >
          <Text>{i18n.t("copy")}</Text>
        </Button>
        <Button
          size="small"
          onPress={() => {
            if (selectedIndex !== null) handleDelete(selectedIndex);
          }}
          disabled={selectedIndex === null}
        >
          <Text>{i18n.t("Delete")}</Text>
        </Button>
      </View>

      {/* 列表 */}
      <FlatList
        data={list}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 10 }}
        renderItem={ItemView}
        ListEmptyComponent={<EmptySlot message={i18n.t("noData")} />}
      />

      {/* 抽屉 + 表单 */}
      <Drawer
        open={open}
        onClose={closeDrawer}
        title={i18n.t(entityName)}
        footer={footer}
      >
        <ScrollView>{renderForm(form, def)}</ScrollView>
      </Drawer>
    </View>
  );
}

export default ModalForm;
export { ModalForm };
