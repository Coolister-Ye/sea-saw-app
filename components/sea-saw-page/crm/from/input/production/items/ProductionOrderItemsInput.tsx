import { useCallback, useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { Form } from "antd";

import { useLocale } from "@/context/Locale";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import Drawer from "../../../base/Drawer.web";
import InputFooter from "../../../base/InputFooter";
import InputForm from "@/components/sea-saw-design/form/InputForm";
import { FormDef } from "@/hooks/useFormDefs";
import ProductionItemsViewToggle from "@/components/sea-saw-page/crm/from/display/production/items/ProductionItemsViewToggle";

interface ProductionOrderItemsInputProps {
  def: FormDef;
  value?: any[];
  onChange?: (v: any[]) => void;
  /** Whether to show Add/Copy/Delete toolbar buttons */
  showToolbar?: boolean;
  /** If true, disables editing and hides toolbar */
  readOnly?: boolean;
}

function ProductionOrderItemsInput({
  def,
  value = [],
  onChange,
  showToolbar = true,
  readOnly = false,
}: ProductionOrderItemsInputProps) {
  const { i18n } = useLocale();

  /* ========================
   * State Management
   * ======================== */
  const [isOpen, setIsOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [list, setList] = useState<any[]>(value);
  const [gridApi, setGridApi] = useState<any>(null);
  const [form] = Form.useForm();

  /* ========================
   * Sync External Value Changes
   * ======================== */
  useEffect(() => {
    if (!isOpen) return;

    form.resetFields();

    if (editingIndex !== null && list[editingIndex]) {
      form.setFieldsValue(list[editingIndex]);
    }
  }, [isOpen, editingIndex, list, form]);

  /* ========================
   * Helper Functions
   * ======================== */
  const getSelectedIndex = useCallback(() => {
    const node = gridApi?.getSelectedNodes?.()[0];
    return node ? node.rowIndex : null;
  }, [gridApi]);

  /* ========================
   * Drawer Management
   * ======================== */
  const openDrawer = useCallback((index: number | null = null) => {
    setEditingIndex(index);
    setIsOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    form.resetFields();
    setEditingIndex(null);
    setIsOpen(false);
  }, [form]);

  /* ========================
   * CRUD Operations
   * ======================== */
  const openAdd = useCallback(() => {
    openDrawer(null);
  }, [openDrawer]);

  const onEdit = useCallback(
    (index: number | null) => {
      if (index === null || readOnly) return;
      openDrawer(index);
    },
    [openDrawer, readOnly]
  );

  const onDelete = useCallback(() => {
    const index = getSelectedIndex();
    if (index === null) return;

    const updated = list.filter((_, i) => i !== index);
    setList(updated);
    onChange?.(updated);
  }, [getSelectedIndex, list, onChange]);

  const onCopy = useCallback(() => {
    const index = getSelectedIndex();
    if (index === null) return;

    openDrawer(null);
  }, [getSelectedIndex, openDrawer]);

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

  /* ========================
   * Render
   * ======================== */
  const footer = <InputFooter onSave={handleSave} onCancel={closeDrawer} />;

  return (
    <View className="gap-3">
      {/* Toolbar: Add/Copy/Delete buttons */}
      {showToolbar && !readOnly && (
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
      )}

      {/* Table/Card Display */}
      <ProductionItemsViewToggle
        def={def}
        value={list}
        onItemClick={readOnly ? undefined : onEdit}
        agGridReactProps={{
          onGridReady: (params) => setGridApi(params.api),
          onRowClicked: (e: { rowIndex: number | null }) => onEdit(e.rowIndex),
          autoSizeStrategy: { type: "fitCellContents" },
          rowSelection: readOnly ? undefined : { mode: "singleRow" },
        }}
      />

      {/* Drawer */}
      <Drawer
        open={isOpen}
        onClose={closeDrawer}
        title={i18n.t("Production Item")}
        footer={footer}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <InputForm table="production_item" def={def as any} form={form} />
        </ScrollView>
      </Drawer>
    </View>
  );
}

export default ProductionOrderItemsInput;
export { ProductionOrderItemsInput };
