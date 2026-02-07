import { useCallback, useEffect, useState } from "react";
import i18n from '@/locale/i18n';
import { ScrollView, View } from "react-native";
import { Form } from "antd";

import { FormDef } from "@/hooks/useFormDefs";
import { devError } from "@/utils/logger";
import Drawer from "../../../../base/Drawer.web";
import InputFooter from "../../../../base/InputFooter";
import InputForm from "@/components/sea-saw-design/form/InputForm";
import ProductionItemsViewToggle from "@/components/sea-saw-page/crm/from/display/production/items/ProductionItemsViewToggle";
import ActionDropdown from "@/components/sea-saw-design/action-dropdown";

interface ProductionOrderItemsInputProps {
  def: FormDef;
  value?: any[];
  onChange?: (v: any[]) => void;
  showToolbar?: boolean;
  readOnly?: boolean;
}

function ProductionOrderItemsInput({
  def,
  value = [],
  onChange,
  showToolbar = true,
  readOnly = false,
}: ProductionOrderItemsInputProps) {
  const [form] = Form.useForm();

  const [list, setList] = useState<any[]>(value);
  const [gridApi, setGridApi] = useState<any>(null);
  const [hasSelection, setHasSelection] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Sync list with value prop changes
  useEffect(() => {
    setList(value);
  }, [value]);

  // Populate form when drawer opens
  useEffect(() => {
    if (!isOpen) return;
    form.resetFields();
    if (editingIndex !== null && list[editingIndex]) {
      form.setFieldsValue(list[editingIndex]);
    }
  }, [isOpen, editingIndex, list, form]);

  const getSelectedIndex = useCallback(() => {
    return gridApi?.getSelectedNodes?.()?.[0]?.rowIndex ?? null;
  }, [gridApi]);

  const updateList = useCallback(
    (updatedList: any[]) => {
      setList(updatedList);
      onChange?.(updatedList);
    },
    [onChange],
  );

  const openDrawer = useCallback((index: number | null = null) => {
    setEditingIndex(index);
    setIsOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    form.resetFields();
    setEditingIndex(null);
    setIsOpen(false);
  }, [form]);

  const handleAdd = useCallback(() => openDrawer(null), [openDrawer]);

  const handleEdit = useCallback(
    (index: number | null) => {
      if (index !== null && !readOnly) openDrawer(index);
    },
    [openDrawer, readOnly],
  );

  const handleCopy = useCallback(() => {
    const index = getSelectedIndex();
    if (index === null) return;

    const selectedItem = list[index];
    if (!selectedItem) return;

    const { id, ...copiedData } = selectedItem;
    setEditingIndex(null);
    setIsOpen(true);
    setTimeout(() => form.setFieldsValue(copiedData), 0);
  }, [getSelectedIndex, list, form]);

  const handleDelete = useCallback(() => {
    const index = getSelectedIndex();
    if (index === null) return;
    updateList(list.filter((_, i) => i !== index));
  }, [getSelectedIndex, list, updateList]);

  const handleSave = useCallback(async () => {
    try {
      const values = await form.validateFields();
      const updatedList =
        editingIndex === null
          ? [...list, values]
          : list.map((item, i) => (i === editingIndex ? values : item));
      updateList(updatedList);
      closeDrawer();
    } catch (error) {
      devError("Validation failed:", error);
    }
  }, [form, list, editingIndex, updateList, closeDrawer]);

  const handleSelectionChanged = useCallback((e: any) => {
    setHasSelection(e.api.getSelectedNodes().length > 0);
  }, []);

  const handleRowClicked = useCallback(
    (e: { rowIndex: number | null }) => handleEdit(e.rowIndex),
    [handleEdit],
  );

  const handleGridReady = useCallback((params: any) => {
    setGridApi(params.api);
  }, []);

  return (
    <View className="gap-3">
      {showToolbar && !readOnly && (
        <View className="flex-row items-center justify-end">
          <ActionDropdown
            onPrimaryAction={handleAdd}
            primaryLabel={i18n.t("Add")}
            onCopy={handleCopy}
            onDelete={handleDelete}
            copyDisabled={!hasSelection}
            deleteDisabled={!hasSelection}
          />
        </View>
      )}

      <ProductionItemsViewToggle
        def={def}
        value={list}
        onItemClick={readOnly ? undefined : handleEdit}
        agGridReactProps={{
          onGridReady: handleGridReady,
          onRowClicked: handleRowClicked,
          onSelectionChanged: handleSelectionChanged,
          rowSelection: readOnly ? undefined : { mode: "singleRow" },
        }}
      />

      <Drawer
        open={isOpen}
        onClose={closeDrawer}
        title={i18n.t("Production Item")}
        footer={<InputFooter onSave={handleSave} onCancel={closeDrawer} />}
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
