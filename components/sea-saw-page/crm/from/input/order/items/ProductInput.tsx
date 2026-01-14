import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { Form, Input } from "antd";

import { useLocale } from "@/context/Locale";
import Drawer from "../../../base/Drawer.web";
import InputFooter from "../../../base/InputFooter";
import InputForm from "@/components/sea-saw-design/form/InputForm";
import { FormDef } from "@/hooks/useFormDefs";
import { ProductItemsTable } from "@/components/sea-saw-page/crm/from/display/shared/items";
import TableToolbar from "../../shared/TableToolbar";

const { TextArea } = Input;

interface ProductProps {
  def: FormDef;
  value?: any[];
  onChange?: (v: any[]) => void;
  onTotalsChange?: (totals: { total_amount: number }) => void;
}

function Product({ def, value = [], onChange, onTotalsChange }: ProductProps) {
  const { i18n } = useLocale();
  const [form] = Form.useForm();

  /* ========================
   * State Management
   * ======================== */
  const [list, setList] = useState<any[]>(value);
  const [gridApi, setGridApi] = useState<any>(null);
  const [hasSelection, setHasSelection] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  /* ========================
   * Form Synchronization
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
    const node = gridApi?.getSelectedNodes?.()?.[0];
    return node?.rowIndex ?? null;
  }, [gridApi]);

  /* ========================
   * Calculate Total Amount
   * ======================== */
  const calculateTotals = useCallback((items: any[]) => {
    const total_amount = items.reduce((acc, item) => {
      // Calculate total_price for each item (order_qty * unit_price)
      const total_price =
        (parseFloat(item.order_qty) || 0) * (parseFloat(item.unit_price) || 0);
      return acc + total_price;
    }, 0);

    // Round to 2 decimal places using toFixed for precision
    return { total_amount: parseFloat(total_amount.toFixed(2)) };
  }, []);

  const updateList = useCallback(
    (updatedList: any[]) => {
      setList(updatedList);
      onChange?.(updatedList);

      // Calculate and notify totals
      if (onTotalsChange) {
        const totals = calculateTotals(updatedList);
        onTotalsChange(totals);
      }
    },
    [onChange, onTotalsChange, calculateTotals]
  );

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
   * Auto-calculate amount on form value change
   * ======================== */
  const handleFormValuesChange = useCallback(
    (_changedValues: any, allValues: any) => {
      const updates: Record<string, number> = {};

      // Helper function to round to 2 decimal places
      const round2 = (num: number) => Math.round(num * 100) / 100;

      // Parse numeric values
      const glazing = parseFloat(allValues.glazing) || 0;
      const gross_weight = parseFloat(allValues.gross_weight) || 0;
      const order_qty = parseFloat(allValues.order_qty) || 0;
      const unit_price = parseFloat(allValues.unit_price) || 0;

      // Calculate net_weight: glazing and gross_weight → net_weight
      if (glazing && gross_weight) {
        updates.net_weight = round2(gross_weight * (1 - glazing));
      }

      // Get net_weight (either newly calculated or existing)
      const net_weight =
        updates.net_weight ?? (parseFloat(allValues.net_weight) || 0);

      // Calculate total_net_weight: net_weight and order_qty → total_net_weight
      if (net_weight && order_qty) {
        updates.total_net_weight = round2(net_weight * order_qty);
      }

      // Calculate total_gross_weight: gross_weight and order_qty → total_gross_weight
      if (gross_weight && order_qty) {
        updates.total_gross_weight = round2(gross_weight * order_qty);
      }

      // Get total_gross_weight (either newly calculated or existing)
      const total_gross_weight =
        updates.total_gross_weight ??
        (parseFloat(allValues.total_gross_weight) || 0);

      // Calculate total_price: unit_price and total_gross_weight → total_price
      if (unit_price && total_gross_weight) {
        updates.total_price = round2(unit_price * total_gross_weight);
      }

      // Apply all updates at once
      if (Object.keys(updates).length > 0) {
        form.setFieldsValue(updates);
      }
    },
    [form]
  );

  /* ========================
   * CRUD Operations
   * ======================== */
  const handleAdd = useCallback(() => {
    openDrawer(null);
  }, [openDrawer]);

  const handleEdit = useCallback(
    (index: number | null) => {
      if (index === null) return;
      openDrawer(index);
    },
    [openDrawer]
  );

  const handleCopy = useCallback(() => {
    const index = getSelectedIndex();
    if (index === null) return;

    const selectedItem = list[index];
    if (!selectedItem) return;

    // Copy selected item data (excluding id)
    const { id, ...copiedData } = selectedItem;

    // Open drawer with copied data
    setEditingIndex(null);
    setIsOpen(true);

    // Set form values after drawer opens
    setTimeout(() => {
      form.setFieldsValue(copiedData);
    }, 0);
  }, [getSelectedIndex, list, form]);

  const handleDelete = useCallback(() => {
    const index = getSelectedIndex();
    if (index === null) return;

    const updatedList = list.filter((_, i) => i !== index);
    updateList(updatedList);
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
      console.error("Validation failed:", error);
    }
  }, [form, list, editingIndex, updateList, closeDrawer]);

  /* ========================
   * Event Handlers
   * ======================== */
  const handleSelectionChanged = useCallback((e: any) => {
    const selected = e.api.getSelectedNodes();
    setHasSelection(selected.length > 0);
  }, []);

  const handleRowClicked = useCallback(
    (e: { rowIndex: number | null }) => {
      handleEdit(e.rowIndex);
    },
    [handleEdit]
  );

  const handleGridReady = useCallback((params: any) => {
    setGridApi(params.api);
  }, []);

  /* ========================
   * Render
   * ======================== */
  const footer = <InputFooter onSave={handleSave} onCancel={closeDrawer} />;

  const config = useMemo(
    () => ({
      specification: {
        render: (col: FormDef) => (
          <TextArea rows={3} disabled={col.read_only} />
        ),
      },
    }),
    [i18n]
  );

  return (
    <View className="gap-3">
      <TableToolbar
        hasSelection={hasSelection}
        onAdd={handleAdd}
        onCopy={handleCopy}
        onDelete={handleDelete}
      />

      <ProductItemsTable
        def={def}
        value={list}
        agGridReactProps={{
          onGridReady: handleGridReady,
          onRowClicked: handleRowClicked,
          onSelectionChanged: handleSelectionChanged,
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

export default Product;
export { Product };
