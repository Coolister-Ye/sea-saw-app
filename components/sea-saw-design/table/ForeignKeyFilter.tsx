import { useCallback, useMemo, useRef, useState } from "react";
import { Pressable, Text, View, TouchableWithoutFeedback } from "react-native";
import { Portal } from "@gorhom/portal";
import {
  IAfterGuiAttachedParams,
  IDoesFilterPassParams,
  RowSelectionOptions,
} from "ag-grid-community";
import { useGridFilter, AgGridReact, CustomFilterProps } from "ag-grid-react";

import { useLocale } from "@/context/Locale";
import Table from "./index";
import { seaSawTableTheme } from "./theme";

/* ═══════════════════════════════════════════════════════════════════════════
   FOREIGN KEY FILTER
   Custom AG Grid filter for selecting related records
   ═══════════════════════════════════════════════════════════════════════════ */

type ForeignKeyFilterProps = CustomFilterProps & {
  table?: string;
};

function ForeignKeyFilter({
  model,
  onModelChange,
  getValue,
  table = "company",
}: ForeignKeyFilterProps) {
  const gridRef = useRef<AgGridReact>(null);
  const { i18n } = useLocale();
  const [isOpen, setIsOpen] = useState(true);

  const rowSelection = useMemo<RowSelectionOptions>(
    () => ({ mode: "multiRow" }),
    []
  );

  const doesFilterPass = useCallback(
    (params: IDoesFilterPassParams) => {
      const { node } = params;
      const filterText = model?.toLowerCase() ?? "";
      const value = getValue(node).map(
        ({ pk, id }: { pk?: string; id?: string }) => pk || id
      );
      return filterText
        .split(" ")
        .every((word: string) => value.includes(word));
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

    const selectedRows = gridApi.getSelectedRows() ?? [];
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
    if (gridApi) {
      gridApi.deselectAll();
    }
    onModelChange(null);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <View className="flex-1 p-4">
      <Text className="text-lg font-semibold mb-4 text-gray-900">
        {i18n.t("Filter")}
      </Text>

      <Portal>
        {isOpen && (
          <TouchableWithoutFeedback onPress={handleCancel}>
            <View className="absolute inset-0 bg-black/50 justify-center items-center p-6">
              <TouchableWithoutFeedback>
                <View className="flex-1 bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden max-h-[80vh]">
                  {/* Header */}
                  <View className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <Text className="text-lg font-semibold text-gray-900">
                      {i18n.t("Select Records")}
                    </Text>
                  </View>

                  {/* Table */}
                  <View className="flex-1 p-4">
                    <Table
                      table={table}
                      ref={gridRef}
                      rowSelection={rowSelection}
                      theme={seaSawTableTheme}
                    />
                  </View>

                  {/* Footer */}
                  <View className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex-row justify-end gap-3">
                    <Pressable
                      className="px-5 py-2.5 rounded-lg bg-gray-200 hover:bg-gray-300 active:bg-gray-400"
                      onPress={handleReset}
                    >
                      <Text className="font-medium text-gray-700">
                        {i18n.t("Reset")}
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
        )}
      </Portal>
    </View>
  );
}

export { ForeignKeyFilter };
export type { ForeignKeyFilterProps };
