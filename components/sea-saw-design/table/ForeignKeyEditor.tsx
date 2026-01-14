import { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { AgGridReact } from "ag-grid-react";
import { RowSelectionOptions } from "ag-grid-community";

import { useLocale } from "@/context/Locale";
import Table from "./index";
import { seaSawTableTheme } from "./theme";
import ForeignKeyCell from "./ForeignKeyCell";
import type { ForeignKeyEditorProps } from "./interface";

/* ═══════════════════════════════════════════════════════════════════════════
   FOREIGN KEY EDITOR
   Modal-based editor for selecting related records
   ═══════════════════════════════════════════════════════════════════════════ */

function ForeignKeyEditor({
  value,
  onValueChange,
  colDef,
  dataType,
  cellStartedEdit,
}: ForeignKeyEditorProps) {
  const { field } = colDef;
  const { i18n } = useLocale();
  const gridRef = useRef<AgGridReact>(null);
  const [isOpen, setIsOpen] = useState(false);

  const rowSelection = useMemo<RowSelectionOptions | undefined>(() => {
    if (dataType.type === "field") {
      return { mode: "multiRow" };
    }
    if (dataType.type === "nested object") {
      return { mode: "singleRow" };
    }
    return undefined;
  }, [dataType.type]);

  useEffect(() => {
    if (value && cellStartedEdit) {
      setIsOpen(true);
    }
  }, [value, cellStartedEdit]);

  if (!field) {
    return null;
  }

  const handleConfirm = () => {
    const gridApi = gridRef.current?.api;
    if (!gridApi) return;

    const selectedRows = gridApi.getSelectedRows() ?? [];

    if (dataType.type === "field") {
      onValueChange(selectedRows);
    } else if (dataType.type === "nested object") {
      onValueChange(selectedRows[0] ?? null);
    }

    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <View className="flex-1 px-2 h-full justify-center">
      <Pressable onPress={() => setIsOpen(true)}>
        <ForeignKeyCell data={value} dataType={dataType} usePopover />
      </Pressable>

      <Modal visible={isOpen} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={handleCancel}>
          <View className="flex-1 bg-black/50 justify-center items-center p-6">
            <TouchableWithoutFeedback>
              <View className="flex-1 bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden max-h-[80vh]">
                {/* Header */}
                <View className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <Text className="text-lg font-semibold text-gray-900">
                    {i18n.t("Select")} {dataType.label || field}
                  </Text>
                </View>

                {/* Table */}
                <View className="flex-1 p-4">
                  <Table
                    table={field}
                    ref={gridRef}
                    rowSelection={rowSelection}
                    theme={seaSawTableTheme}
                    headerMeta={dataType}
                    suppressUpdate
                    suppressDelete
                  />
                </View>

                {/* Footer */}
                <View className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex-row justify-end gap-3">
                  <Pressable
                    className="px-5 py-2.5 rounded-lg bg-gray-200 hover:bg-gray-300 active:bg-gray-400"
                    onPress={handleCancel}
                  >
                    <Text className="font-medium text-gray-700">
                      {i18n.t("Cancel")}
                    </Text>
                  </Pressable>
                  <Pressable
                    className="px-5 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700"
                    onPress={handleConfirm}
                  >
                    <Text className="font-medium text-white">
                      {i18n.t("Apply")}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

export default ForeignKeyEditor;
export { ForeignKeyEditor };
