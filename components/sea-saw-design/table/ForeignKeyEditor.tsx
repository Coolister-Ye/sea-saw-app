import {
  View,
  Text,
  TouchableWithoutFeedback,
  Pressable,
  Modal,
} from "react-native";
import { AgGridReact } from "ag-grid-react";
import Table from ".";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "@/context/Locale";
import { RowSelectionOptions } from "ag-grid-community";
import { myTableTheme } from "./tableTheme";
import { ForeignKeyEitorProps } from "./interface";
import ForeignKeyCell from "./ForeignKeyCell";

function ForeignKeyEitor({
  value,
  onValueChange,
  colDef,
  dataType,
  cellStartedEdit,
  stopEditing,
}: ForeignKeyEitorProps) {
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

  if (!field) {
    return null;
  }

  const handleConfirm = () => {
    const gridApi = gridRef.current?.api;
    if (!gridApi) return;

    const selectedRows = gridApi.getSelectedRows() || [];

    if (dataType.type === "field") {
      onValueChange(selectedRows);
    } else if (dataType.type === "nested object") {
      onValueChange(selectedRows[0]);
    }
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (value && cellStartedEdit) {
      setIsOpen(true);
    }
  }, [value]);

  return (
    <View className="flex-1 px-1 h-full justify-center">
      <Pressable onPress={() => setIsOpen(true)}>
        <ForeignKeyCell data={value} dataType={dataType} usePopover />
      </Pressable>
      <Modal visible={isOpen} transparent>
        <View
          className="relative"
          style={{ display: isOpen ? "flex" : "none" }}
        >
          <TouchableWithoutFeedback onPress={handleCancel}>
            <View className="fixed top-0 bottom-0 left-0 bg-black/50 justify-center items-center h-screen w-screen p-10">
              <Pressable className="flex-1 bg-white w-full rounded-lg">
                <View className="flex-1 rounded-lg shadow-xl p-3">
                  <Table
                    table={field}
                    ref={gridRef}
                    rowSelection={rowSelection}
                    theme={myTableTheme}
                    headerMeta={dataType}
                    suppressUpdate
                    suppressDelete
                  />
                  <View className="py-1 flex-row">
                    <Pressable
                      className="bg-blue-500 rounded-md py-2 px-6 mt-4 items-center flex-1 mx-1"
                      onPress={handleConfirm}
                    >
                      <Text className="text-white font-bold text-base">
                        {i18n.t("apply")}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </Modal>
    </View>
  );
}

export default ForeignKeyEitor;
