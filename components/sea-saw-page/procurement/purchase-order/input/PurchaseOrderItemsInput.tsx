import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import i18n from "@/locale/i18n";
import { ScrollView, View } from "react-native";
import { Form, Input } from "antd";

import { FormDef } from "@/hooks/useFormDefs";
import { HeaderMetaProps } from "@/components/sea-saw-design/form/interface";
import { devError } from "@/utils/logger";
import { round2, toNum } from "@/utils/number";
import InputForm from "@/components/sea-saw-design/form/InputForm";
import ActionDropdown from "@/components/sea-saw-design/action-dropdown";
import PurchaseItemsViewToggle from "@/components/sea-saw-page/procurement/purchase-order/display/items/PurchaseItemsViewToggle";
import { Drawer, InputFooter } from "@/components/sea-saw-page/base";

const { TextArea } = Input;

interface PurchaseOrderItemsInputProps {
  def: FormDef;
  value?: any[];
  onChange?: (v: any[]) => void;
  showToolbar?: boolean;
}

function PurchaseOrderItemsInput({
  def,
  value = [],
  onChange,
  showToolbar = true,
}: PurchaseOrderItemsInputProps) {
  const gridApiRef = useRef<any>(null);
  const pendingCopyRef = useRef<any | null>(null);

  const [hasSelection, setHasSelection] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form] = Form.useForm();

  // Extract children definitions for table display
  const tableDef = useMemo<Record<string, HeaderMetaProps> | undefined>(() => {
    if (!def) return undefined;
    // Extract from nested structure: def.children or def.child.children
    return (def as any).children || (def as any).child?.children;
  }, [def]);

  // Watch source fields for auto-calculation
  const glazing = Form.useWatch("glazing", form);
  const grossWeight = Form.useWatch("gross_weight", form);
  const orderQty = Form.useWatch("order_qty", form);
  const unitPrice = Form.useWatch("unit_price", form);

  // Populate form when drawer opens
  useEffect(() => {
    if (!isOpen) return;

    if (pendingCopyRef.current) {
      form.setFieldsValue(pendingCopyRef.current);
      pendingCopyRef.current = null;
      return;
    }

    if (editingIndex !== null && value[editingIndex]) {
      form.setFieldsValue(value[editingIndex]);
      return;
    }

    form.resetFields();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editingIndex, form]);

  // Auto-calculate derived fields (only when drawer is open)
  useEffect(() => {
    if (!isOpen) return;

    const g = toNum(glazing);
    const gw = toNum(grossWeight);
    const qty = toNum(orderQty);
    const up = toNum(unitPrice);

    const netWeight = round2(gw * (1 - g));
    const totalGrossWeight = round2(gw * qty);

    form.setFieldsValue({
      net_weight: netWeight,
      total_net_weight: round2(netWeight * qty),
      total_gross_weight: totalGrossWeight,
      total_price: round2(up * totalGrossWeight),
    });
  }, [isOpen, glazing, grossWeight, orderQty, unitPrice, form]);

  const getSelectedIndex = () =>
    gridApiRef.current?.getSelectedNodes?.()?.[0]?.rowIndex ?? null;

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
      if (index !== null) openDrawer(index);
    },
    [openDrawer],
  );

  const handleCopy = useCallback(() => {
    const index = getSelectedIndex();
    if (index === null) return;

    const selectedItem = value[index];
    if (!selectedItem) return;

    const { id, ...copiedData } = selectedItem;
    pendingCopyRef.current = copiedData;
    setEditingIndex(null);
    setIsOpen(true);
  }, [value]);

  const handleDelete = useCallback(() => {
    const index = getSelectedIndex();
    if (index === null) return;
    onChange?.(value.filter((_, i) => i !== index));
  }, [value, onChange]);

  const handleSave = useCallback(async () => {
    try {
      const values = await form.validateFields();
      const updatedList =
        editingIndex === null
          ? [...value, values]
          : value.map((item, i) => (i === editingIndex ? values : item));
      onChange?.(updatedList);
      closeDrawer();
    } catch (error) {
      devError("Validation failed:", error);
    }
  }, [form, value, editingIndex, onChange, closeDrawer]);

  const handleSelectionChanged = useCallback((e: any) => {
    setHasSelection(e.api.getSelectedNodes().length > 0);
  }, []);

  const handleRowClicked = useCallback(
    (e: { rowIndex: number | null }) => handleEdit(e.rowIndex),
    [handleEdit],
  );

  const handleGridReady = useCallback((params: any) => {
    gridApiRef.current = params.api;
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

      <PurchaseItemsViewToggle
        def={tableDef}
        value={value}
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
        title={i18n.t("Purchase Item")}
        footer={<InputFooter onSave={handleSave} onCancel={closeDrawer} />}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <InputForm
            table="purchase_item"
            def={def}
            form={form}
            config={config}
            hideReadOnly
          />
        </ScrollView>
      </Drawer>
    </View>
  );
}

export default PurchaseOrderItemsInput;
