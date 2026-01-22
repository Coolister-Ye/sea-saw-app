import { useCallback, useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { Form } from "antd";

import { useLocale } from "@/context/Locale";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import Drawer from "../../../../base/Drawer.web";
import InputFooter from "../../../../base/InputFooter";
import InputForm from "@/components/sea-saw-design/form/InputForm";
import { FormDef } from "@/hooks/useFormDefs";
import PurchaseItemsViewToggle from "@/components/sea-saw-page/crm/from/display/purchase/items/PurchaseItemsViewToggle";

interface PurchaseOrderItemsInputProps {
  def: FormDef;
  value?: any[];
  onChange?: (v: any[]) => void;
  /** Whether to show Add/Copy/Delete toolbar buttons */
  showToolbar?: boolean;
  /** If true, disables editing and hides toolbar */
  readOnly?: boolean;
}

function PurchaseOrderItemsInput({
  def,
  value = [],
  onChange,
  showToolbar = true,
  readOnly = false,
}: PurchaseOrderItemsInputProps) {
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

  const openCopy = useCallback(() => {
    const index = getSelectedIndex();
    if (index !== null && list[index]) {
      const copiedItem = { ...list[index], id: undefined };
      form.setFieldsValue(copiedItem);
      openDrawer(null);
    }
  }, [getSelectedIndex, list, form, openDrawer]);

  const openEdit = useCallback(() => {
    const index = getSelectedIndex();
    if (index !== null) {
      openDrawer(index);
    }
  }, [getSelectedIndex, openDrawer]);

  const handleDelete = useCallback(() => {
    const index = getSelectedIndex();
    if (index !== null) {
      const newList = list.filter((_, i) => i !== index);
      setList(newList);
      onChange?.(newList);
    }
  }, [getSelectedIndex, list, onChange]);

  const handleSave = useCallback(async () => {
    try {
      const values = await form.validateFields();
      const newList = [...list];

      if (editingIndex !== null) {
        // Edit existing item
        newList[editingIndex] = { ...list[editingIndex], ...values };
      } else {
        // Add new item
        newList.push(values);
      }

      setList(newList);
      onChange?.(newList);
      closeDrawer();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  }, [form, editingIndex, list, onChange, closeDrawer]);

  /* ========================
   * Sync List with External Value
   * ======================== */
  useEffect(() => {
    setList(value);
  }, [value]);

  return (
    <View style={{ gap: 8 }}>
      {/* Toolbar */}
      {showToolbar && !readOnly && (
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            marginBottom: 8,
          }}
        >
          <Button onPress={openAdd}>
            <Text>{i18n.t("Add")}</Text>
          </Button>
          <Button onPress={openCopy} disabled={getSelectedIndex() === null}>
            <Text>{i18n.t("Copy")}</Text>
          </Button>
          <Button onPress={openEdit} disabled={getSelectedIndex() === null}>
            <Text>{i18n.t("Edit")}</Text>
          </Button>
          <Button
            onPress={handleDelete}
            disabled={getSelectedIndex() === null}
            variant="destructive"
          >
            <Text>{i18n.t("Delete")}</Text>
          </Button>
        </View>
      )}

      {/* Items View */}
      <PurchaseItemsViewToggle
        value={list}
        def={def}
        agGridReactProps={{
          onGridReady: (params: any) => setGridApi(params.api),
          onRowDoubleClicked: (row: any) => {
            if (!readOnly) {
              const index = list.findIndex((item) => item === row.data);
              openDrawer(index);
            }
          },
        }}
        onItemClick={(item: any) => {
          if (!readOnly) {
            const index = list.findIndex((i) => i === item);
            openDrawer(index);
          }
        }}
      />

      {/* Edit Drawer */}
      <Drawer
        open={isOpen}
        onClose={closeDrawer}
        title={
          editingIndex !== null
            ? i18n.t("Edit Purchase Item")
            : i18n.t("Add Purchase Item")
        }
        footer={
          <InputFooter
            loading={false}
            onSave={handleSave}
            onCancel={closeDrawer}
          />
        }
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          <InputForm
            table="purchase_item"
            form={form}
            def={def as any}
            data={editingIndex !== null ? list[editingIndex] : {}}
          />
        </ScrollView>
      </Drawer>
    </View>
  );
}

export default PurchaseOrderItemsInput;
