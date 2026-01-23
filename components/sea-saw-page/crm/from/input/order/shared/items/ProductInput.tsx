import { useCallback, useEffect, useMemo, useState } from "react";
import i18n from '@/locale/i18n';
import { ScrollView, View } from "react-native";
import { Form, Input } from "antd";

import { FormDef } from "@/hooks/useFormDefs";
import { devError } from "@/utils/logger";
import Drawer from "../../../../base/Drawer.web";
import InputFooter from "../../../../base/InputFooter";
import InputForm from "@/components/sea-saw-design/form/InputForm";
import { ProductItemsTable } from "@/components/sea-saw-page/crm/from/display/shared/items";
import ActionDropdown from "@/components/sea-saw-design/action-dropdown";

const { TextArea } = Input;

interface OrderItemsInputProps {
  def: FormDef;
  value?: any[];
  onChange?: (v: any[]) => void;
  onTotalsChange?: (totals: { total_amount: number }) => void;
  showToolbar?: boolean;
}

const round2 = (num: number) => Math.round(num * 100) / 100;

function OrderItemsInput({
  def,
  value = [],
  onChange,
  onTotalsChange,
  showToolbar = true,
}: OrderItemsInputProps) {
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

  const calculateTotals = useCallback((items: any[]) => {
    const total = items.reduce(
      (acc, item) => acc + (parseFloat(item.total_price) || 0),
      0,
    );
    return { total_amount: round2(total) };
  }, []);

  const updateList = useCallback(
    (updatedList: any[]) => {
      setList(updatedList);
      onChange?.(updatedList);
      onTotalsChange?.(calculateTotals(updatedList));
    },
    [onChange, onTotalsChange, calculateTotals],
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

  // Auto-calculate derived fields on form value change
  const handleFormValuesChange = useCallback(
    (_: any, allValues: any) => {
      const updates: Record<string, number> = {};

      const glazing = parseFloat(allValues.glazing) || 0;
      const grossWeight = parseFloat(allValues.gross_weight) || 0;
      const orderQty = parseFloat(allValues.order_qty) || 0;
      const unitPrice = parseFloat(allValues.unit_price) || 0;

      // net_weight = gross_weight * (1 - glazing)
      if (glazing && grossWeight) {
        updates.net_weight = round2(grossWeight * (1 - glazing));
      }

      const netWeight =
        updates.net_weight ?? (parseFloat(allValues.net_weight) || 0);

      // total_net_weight = net_weight * order_qty
      if (netWeight && orderQty) {
        updates.total_net_weight = round2(netWeight * orderQty);
      }

      // total_gross_weight = gross_weight * order_qty
      if (grossWeight && orderQty) {
        updates.total_gross_weight = round2(grossWeight * orderQty);
      }

      const totalGrossWeight =
        updates.total_gross_weight ??
        (parseFloat(allValues.total_gross_weight) || 0);

      // total_price = unit_price * total_gross_weight
      if (unitPrice && totalGrossWeight) {
        updates.total_price = round2(unitPrice * totalGrossWeight);
      }

      if (Object.keys(updates).length > 0) {
        form.setFieldsValue(updates);
      }
    },
    [form],
  );

  const handleAdd = useCallback(() => openDrawer(null), [openDrawer]);

  const handleEdit = useCallback(
    (index: number | null) => {
      if (index !== null) openDrawer(index);
    },
    [openDrawer],
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

  const config = useMemo(
    () => ({
      specification: {
        render: (col: FormDef) => (
          <TextArea rows={3} disabled={col.read_only} />
        ),
      },
    }),
    [],
  );

  return (
    <View className="gap-3">
      {showToolbar && (
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

      <ProductItemsTable
        def={def}
        value={list}
        agGridReactProps={{
          onGridReady: handleGridReady,
          onRowClicked: handleRowClicked,
          onSelectionChanged: handleSelectionChanged,
          rowSelection: { mode: "singleRow" },
        }}
      />

      <Drawer
        open={isOpen}
        onClose={closeDrawer}
        title={i18n.t("Order Item")}
        footer={<InputFooter onSave={handleSave} onCancel={closeDrawer} />}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <InputForm
            table="product"
            def={def as any}
            form={form}
            config={config}
            onValuesChange={handleFormValuesChange}
          />
        </ScrollView>
      </Drawer>
    </View>
  );
}

export default OrderItemsInput;
export { OrderItemsInput };
