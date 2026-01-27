import { useCallback, useEffect, useRef, useState } from "react";
import i18n from "@/locale/i18n";
import { ScrollView, View } from "react-native";
import { Form } from "antd";

import { Button } from "@/components/sea-saw-design/button";
import { Text } from "@/components/sea-saw-design/text";
import Drawer from "./base/Drawer.web";
import InputFooter from "./base/InputFooter";
import InputForm from "@/components/sea-saw-design/form/InputForm";
import ProductDisplay from "./ProductDisplay";
import { FormDef } from "@/hooks/useFormDefs";

interface ProductProps {
  def: FormDef;
  value?: any[];
  onChange?: (v: any[]) => void;
}

function Product({ def, value = [], onChange }: ProductProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [list, setList] = useState<any[]>(value);
  const [gridApi, setGridApi] = useState<any>(null);
  const prevValueRef = useRef<any[]>([]);
  const [form] = Form.useForm();

  /** 当外部 value 更新时同步内部 list */
  useEffect(() => {
    // 如果 value 内容相同，不更新
    if (JSON.stringify(prevValueRef.current) === JSON.stringify(value)) return;

    prevValueRef.current = value;
    setList(value);
  }, [value]);

  /** 工具：获取当前选中行 index */
  const getSelectedIndex = useCallback(() => {
    const node = gridApi?.getSelectedNodes?.()[0];
    return node ? node.rowIndex : null;
  }, [gridApi]);

  /** 通用打开 Drawer：用于新增或编辑 */
  const openDrawer = useCallback(
    (index: number | null = null, data: any = null) => {
      setEditingIndex(index);
      form.resetFields();
      if (data) form.setFieldsValue(data);
      setIsOpen(true);
    },
    [form],
  );

  const closeDrawer = useCallback(() => {
    form.resetFields();
    setEditingIndex(null);
    setIsOpen(false);
  }, [form]);

  /** 新增 */
  const openAdd = useCallback(() => {
    openDrawer(null);
  }, [openDrawer]);

  /** 点击行进行编辑 */
  const onEdit = useCallback(
    (index: number | null) => {
      if (index === null) return;
      openDrawer(index, list[index]);
    },
    [list, openDrawer],
  );

  /** 删除选中行 */
  const onDelete = useCallback(() => {
    const index = getSelectedIndex();
    if (index === null) return;

    const updated = list.filter((_, i) => i !== index);
    setList(updated);
    onChange?.(updated);
  }, [getSelectedIndex, list, onChange]);

  /** 复制选中行 */
  const onCopy = useCallback(() => {
    const index = getSelectedIndex();
    if (index === null) return;

    const { id, pk, ...data } = list[index]; // 移除主键
    openDrawer(null, data);
  }, [getSelectedIndex, list, openDrawer]);

  /** 保存（新增或编辑） */
  const handleSave = useCallback(async () => {
    try {
      const values = await form.validateFields();

      const updated =
        editingIndex === null
          ? [...list, values]
          : list.map((item, i) => (i === editingIndex ? values : item));

      setList(updated);
      onChange?.(updated);
      closeDrawer();
    } catch {
      console.log("Validation failed");
    }
  }, [form, list, editingIndex, closeDrawer, onChange]);

  const footer = <InputFooter onSave={handleSave} onCancel={closeDrawer} />;

  return (
    <View className="gap-3">
      {/* 操作按钮 */}
      <View className="flex flex-row justify-end gap-1">
        <Button variant="outline" className="w-fit" onPress={onDelete}>
          <Text>{i18n.t("Delete")}</Text>
        </Button>
        <Button variant="outline" className="w-fit" onPress={onCopy}>
          <Text>{i18n.t("copy")}</Text>
        </Button>
        <Button variant="outline" className="w-fit" onPress={openAdd}>
          <Text>{i18n.t("add")}</Text>
        </Button>
      </View>

      {/* 表格 */}
      <ProductDisplay
        def={def}
        value={list}
        agGridReactProps={{
          onGridReady: (params) => setGridApi(params.api),
          onRowClicked: (e: { rowIndex: number | null }) => onEdit(e.rowIndex),
          autoSizeStrategy: { type: "fitCellContents" },
          rowSelection: { mode: "singleRow" },
        }}
      />

      {/* Drawer */}
      <Drawer
        open={isOpen}
        onClose={closeDrawer}
        title={i18n.t("contract")}
        footer={footer}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <InputForm table="product" def={def as any} form={form} />
        </ScrollView>
      </Drawer>
    </View>
  );
}

export default Product;
export { Product };
