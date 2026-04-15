import React from "react";
import {
  View,
  Modal,
  Pressable,
  TouchableWithoutFeedback,
} from "react-native";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, GridApi } from "ag-grid-community";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  CheckIcon,
  Squares2X2Icon,
} from "react-native-heroicons/outline";

import { Text } from "@/components/sea-saw-design/text";
import { Button } from "@/components/sea-saw-design/button";
import { Input } from "@/components/sea-saw-design/input";
import { theme } from "@/components/sea-saw-design/table/theme";
import i18n from "@/locale/i18n";

import type { EntityItem } from "./types";
import { DEFAULT_COL_DEF } from "./utils";

interface EntitySelectorModalProps<T extends EntityItem> {
  isOpen: boolean;
  closeModal: () => void;
  modalTitle: string;
  searchText: string;
  onSearchChange: (text: string) => void;
  options: T[];
  columnDefs: ColDef[];
  onGridReady: (params: { api: GridApi }) => void;
  onRowClicked: (event: { data: T }) => void;
  getRowClass: (params: any) => string;
  loading: boolean;
  multiple: boolean;
  selected: T[];
  displayField: string;
  onClear: () => void;
  onConfirm: () => void;
}

export function EntitySelectorModal<T extends EntityItem>({
  isOpen,
  closeModal,
  modalTitle,
  searchText,
  onSearchChange,
  options,
  columnDefs,
  onGridReady,
  onRowClicked,
  getRowClass,
  loading,
  multiple,
  selected,
  displayField,
  onClear,
  onConfirm,
}: EntitySelectorModalProps<T>) {
  return (
    <Modal visible={isOpen} transparent animationType="fade">
      <View className="flex-1 justify-center items-center">
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={closeModal}>
          <View className="absolute inset-0 bg-black/60" />
        </TouchableWithoutFeedback>

        {/* Modal Content */}
        <View className="animate-modal-slide-in bg-white rounded w-[95%] md:w-[900px] max-h-[85vh] overflow-hidden shadow-2xl">
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-lg bg-blue-50 items-center justify-center mr-2">
                <Squares2X2Icon size={18} className="text-blue-500" />
              </View>
              <Text className="text-base font-medium text-gray-800">
                {modalTitle}
              </Text>
            </View>
            <Pressable
              onPress={closeModal}
              className="p-1 rounded hover:bg-gray-100"
            >
              <XMarkIcon size={20} className="text-gray-400" />
            </Pressable>
          </View>

          {/* Search Bar */}
          <View className="px-5 py-3 border-b border-gray-100">
            <Input
              prefix={<MagnifyingGlassIcon size={18} className="text-gray-400" />}
              allowClear
              value={searchText}
              onChangeText={onSearchChange}
              placeholder={i18n.t("Search...")}
            />
          </View>

          {/* AG Grid Table */}
          <View className="entity-selector-grid h-[400px] max-sm:h-[300px] px-5 py-3">
            <AgGridReact
              rowData={options}
              columnDefs={columnDefs}
              theme={theme}
              onGridReady={onGridReady}
              onRowClicked={onRowClicked}
              getRowClass={getRowClass}
              loading={loading}
              rowSelection={multiple ? "multiple" : "single"}
              pagination={false}
              domLayout="normal"
              suppressCellFocus
              animateRows
              defaultColDef={{
                ...DEFAULT_COL_DEF,
                suppressHeaderMenuButton: true,
              }}
            />
          </View>

          {/* Footer */}
          <View className="flex-row max-sm:flex-col max-sm:gap-3 items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            {/* Selection Info */}
            <View className="flex-row items-center min-w-0 flex-1">
              {multiple && selected.length > 0 && (
                <>
                  <View className="w-6 h-6 rounded bg-blue-500 items-center justify-center mr-2 shrink-0">
                    <Text className="text-white text-xs font-bold">
                      {selected.length}
                    </Text>
                  </View>
                  <Text className="text-sm text-gray-600">
                    {i18n.t("selected")}
                  </Text>
                </>
              )}
              {!multiple && selected.length > 0 && (
                <View className="flex-row items-center bg-blue-50 px-3 py-1.5 rounded max-w-[180px] min-w-0">
                  <CheckIcon size={14} className="text-blue-500 mr-1.5 shrink-0" />
                  <Text className="text-sm text-blue-700 font-medium shrink" numberOfLines={1} ellipsizeMode="tail">
                    {selected[0]?.[displayField]}
                  </Text>
                </View>
              )}
            </View>

            {/* Actions */}
            <View className="flex-row items-center gap-1 shrink-0">
              {selected.length > 0 && (
                <Button onPress={onClear}>
                  <Text className="text-blue-500 underline">
                    {i18n.t("Clear")}
                  </Text>
                </Button>
              )}
              <Button onPress={closeModal}>
                <Text>{i18n.t("Cancel")}</Text>
              </Button>
              <Button type="primary" onPress={onConfirm} disabled={loading}>
                <Text className="text-white font-medium">
                  {i18n.t("Confirm")}
                </Text>
              </Button>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
