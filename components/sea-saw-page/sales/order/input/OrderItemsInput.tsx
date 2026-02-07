import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import i18n from "@/locale/i18n";
import { ScrollView, View } from "react-native";
import { Form, Input } from "antd";

import { FormDef } from "@/hooks/useFormDefs";
import { devError } from "@/utils/logger";
import InputForm from "@/components/sea-saw-design/form/InputForm";
import ActionDropdown from "@/components/sea-saw-design/action-dropdown";
import ProductItemsTable from "../display/items/ProductItemsTable";
import { Drawer } from "@/components/sea-saw-page/base";
import { InputFooter } from "@/components/sea-saw-page/base";

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
  // Controlled component: use parent's value directly
  const list = value;

  const [gridApi, setGridApi] = useState<any>(null);
  const [hasSelection, setHasSelection] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form] = Form.useForm();

  // Stable ref for copy mode (avoids setTimeout race conditions)
  const pendingCopyRef = useRef<any | null>(null);

  // Populate form when drawer opens
  useEffect(() => {
    if (!isOpen) return;

    // Priority 1: Copy mode (via ref)
    if (pendingCopyRef.current) {
      form.setFieldsValue(pendingCopyRef.current);
      pendingCopyRef.current = null; // Clear after use
      return;
    }

    // Priority 2: Edit mode
    if (editingIndex !== null && list[editingIndex]) {
      form.setFieldsValue(list[editingIndex]);
      return;
    }

    // Priority 3: Create mode (clean state)
    form.resetFields();

    // Don't include 'list' in dependencies to prevent infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editingIndex, form]);

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

  // Notify parent via onChange (controlled component pattern)
  const updateList = useCallback(
    (updatedList: any[]) => {
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
    form.resetFields(); // Clear form state (instance is stable, doesn't unmount)
    setEditingIndex(null);
    setIsOpen(false);
  }, [form]);

  // Auto-calculate derived fields on form value change
  const handleFormValuesChange = useCallback(
    (_: any, allValues: any) => {
      const updates: Record<string, number> = {};

      // Use Number() for proper 0 value handling (not parseFloat)
      const glazing = Number(allValues.glazing);
      const grossWeight = Number(allValues.gross_weight);
      const orderQty = Number(allValues.order_qty);
      const unitPrice = Number(allValues.unit_price);

      // net_weight = gross_weight * (1 - glazing)
      if (!Number.isNaN(glazing) && !Number.isNaN(grossWeight)) {
        updates.net_weight = round2(grossWeight * (1 - glazing));
      }

      const netWeight = updates.net_weight ?? Number(allValues.net_weight);

      // total_net_weight = net_weight * order_qty
      if (!Number.isNaN(netWeight) && !Number.isNaN(orderQty)) {
        updates.total_net_weight = round2(netWeight * orderQty);
      }

      // total_gross_weight = gross_weight * order_qty
      if (!Number.isNaN(grossWeight) && !Number.isNaN(orderQty)) {
        updates.total_gross_weight = round2(grossWeight * orderQty);
      }

      const totalGrossWeight =
        updates.total_gross_weight ?? Number(allValues.total_gross_weight);

      // total_price = unit_price * total_gross_weight
      if (!Number.isNaN(unitPrice) && !Number.isNaN(totalGrossWeight)) {
        updates.total_price = round2(unitPrice * totalGrossWeight);
      }

      if (Object.keys(updates).length) {
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

    // Store copy data in ref, useEffect will populate form
    const { id, ...copiedData } = selectedItem;
    pendingCopyRef.current = copiedData;
    setEditingIndex(null);
    setIsOpen(true);
  }, [getSelectedIndex, list]);

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
            hideReadOnly
          />
        </ScrollView>
      </Drawer>
    </View>
  );
}

export default OrderItemsInput;
export { OrderItemsInput };
