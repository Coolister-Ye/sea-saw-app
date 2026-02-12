import { useCallback, useEffect, useRef, useState } from "react";
import { Form } from "antd";
import type { FormInstance } from "antd";
import { devError } from "@/utils/logger";

interface UseOrderItemsManagerOptions {
  value: any[];
  onChange?: (v: any[]) => void;
  readOnly?: boolean;
}

export interface OrderItemsManager {
  form: FormInstance;
  list: any[];
  hasSelection: boolean;
  isOpen: boolean;
  editingIndex: number | null;
  openDrawer: (index?: number | null) => void;
  closeDrawer: () => void;
  handleAdd: () => void;
  handleEdit: (index: number | null) => void;
  handleCopy: () => void;
  handleDelete: () => void;
  handleSave: () => Promise<void>;
  handleSelectionChanged: (e: any) => void;
  handleRowClicked: (e: { rowIndex: number | null }) => void;
  handleGridReady: (params: any) => void;
}

/**
 * Shared state and logic for order items CRUD editors (Purchase, Production, Outbound).
 * Centralizes: state, form population, drawer management, and all CRUD handlers.
 */
export function useOrderItemsManager({
  value,
  onChange,
  readOnly = false,
}: UseOrderItemsManagerOptions): OrderItemsManager {
  const [form] = Form.useForm();
  const [list, setList] = useState<any[]>(value);
  const [gridApi, setGridApi] = useState<any>(null);
  const [hasSelection, setHasSelection] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  // Holds copied data to be applied after the drawer opens and form resets
  const pendingCopyDataRef = useRef<any>(null);

  // Sync list with external value changes (deep comparison prevents unnecessary resets)
  useEffect(() => {
    setList((prev) => {
      if (JSON.stringify(prev) === JSON.stringify(value)) return prev;
      return value;
    });
  }, [value]);

  // Populate form when drawer opens
  useEffect(() => {
    if (!isOpen) return;
    form.resetFields();
    if (editingIndex !== null && list[editingIndex]) {
      form.setFieldsValue(list[editingIndex]);
    } else if (pendingCopyDataRef.current !== null) {
      form.setFieldsValue(pendingCopyDataRef.current);
      pendingCopyDataRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editingIndex, form]); // Don't include 'list' to avoid resetting form on external updates

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
    pendingCopyDataRef.current = copiedData;
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
          : list.map((item, i) =>
              i === editingIndex ? { ...item, ...values } : item,
            );
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

  return {
    form,
    list,
    hasSelection,
    isOpen,
    editingIndex,
    openDrawer,
    closeDrawer,
    handleAdd,
    handleEdit,
    handleCopy,
    handleDelete,
    handleSave,
    handleSelectionChanged,
    handleRowClicked,
    handleGridReady,
  };
}
