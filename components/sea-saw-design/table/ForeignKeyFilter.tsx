import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  type IAfterGuiAttachedParams,
  type IDoesFilterPassParams,
  type RowSelectionOptions,
} from "ag-grid-community";
import type { CustomFilterProps } from "ag-grid-react";
import { useGridFilter, AgGridReact } from "ag-grid-react";
import { Pressable, Text, View, TouchableWithoutFeedback } from "react-native";
import Table from ".";
import { Portal } from "@gorhom/portal";
import { useLocale } from "@/context/Locale";
import { myTableTheme } from "./tableTheme";

function ForeignKeyFilter({
  model,
  onModelChange,
  getValue,
}: CustomFilterProps) {
  const gridRef = useRef<AgGridReact>(null);
  const { i18n } = useLocale();
  const [isOpen, setIsOpen] = useState(true);

  const rowSelection = useMemo<RowSelectionOptions>(
    () => ({
      mode: "multiRow",
    }),
    []
  );

  const doesFilterPass = useCallback(
    (params: IDoesFilterPassParams) => {
      const { node } = params;
      const filterText = model?.toLowerCase() ?? "";
      const value = getValue(node).map(({ pk, id }: any) => pk || id);
      return filterText.split(" ").every((word: any) => value.includes(word));
    },
    [model, getValue]
  );

  const afterGuiAttached = useCallback((params?: IAfterGuiAttachedParams) => {
    if (!params?.suppressFocus) {
      setIsOpen(true);
    }
  }, []);

  useGridFilter({
    doesFilterPass,
    afterGuiAttached,
  });

  const handleConfirm = () => {
    const gridApi = gridRef.current?.api;
    if (!gridApi) return;

    const selectedRows = gridApi.getSelectedRows() || [];
    const selectedIds = selectedRows
      .map((row: Record<string, any>) => row.id ?? row.pk)
      .filter(Boolean);

    if (selectedIds.length === 0) {
      onModelChange(null);
    } else {
      onModelChange({
        values: selectedIds,
        filterType: "object",
        type: "within",
      });
    }

    setIsOpen(false);
  };

  const handleReset = () => {
    const gridApi = gridRef.current?.api;
    if (!gridApi) return;

    gridApi.deselectAll();
    onModelChange(null);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  const MemoizedTable = useMemo(() => {
    return (
      <Table
        table="company"
        ref={gridRef}
        rowSelection={rowSelection}
        theme={myTableTheme}
      />
    );
  }, []);

  return (
    <View className="flex-1 p-4">
      <Text className="text-xl font-semibold mb-4">Filter</Text>
      <Portal>
        <View
          className="relative"
          style={{ display: isOpen ? "flex" : "none" }}
        >
          <TouchableWithoutFeedback onPress={handleCancel}>
            <View className="fixed top-0 bottom-0 left-0 bg-black/50 justify-center items-center h-screen w-screen p-10">
              <Pressable className="flex-1 bg-white w-full rounded-lg">
                <View className="flex-1 rounded-lg shadow-xl p-3">
                  {MemoizedTable}
                  <View className="py-1 flex-row">
                    <Pressable
                      className="bg-blue-500 rounded-md py-2 px-6 mt-4 items-center flex-1 mx-1"
                      onPress={handleConfirm}
                    >
                      <Text className="text-white font-bold text-base">
                        {i18n.t("apply")}
                      </Text>
                    </Pressable>
                    <Pressable
                      className="bg-gray-300 rounded-md py-2 px-6 mt-4 items-center flex-1 mx-1"
                      onPress={handleReset}
                    >
                      <Text className="font-bold text-base">
                        {i18n.t("reset")}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </Portal>
    </View>
  );
}

export { ForeignKeyFilter };
