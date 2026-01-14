import {
  View,
  Text,
  TouchableWithoutFeedback,
  Pressable,
  Modal,
} from "react-native";
import { AgGridReact } from "ag-grid-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "@/context/Locale";
import { RowSelectionOptions } from "ag-grid-community";
import { ForeignKeyInputProps } from "./interface";
import { Button } from "../button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../accordion";
import Table from "../table";
import { myTableTheme } from "../table/theme";
import { PlusIcon, XMarkIcon } from "@heroicons/react/20/solid";

function ForeignKeyInput({
  dataType,
  value,
  field,
  onChange,
}: ForeignKeyInputProps) {
  const { i18n } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const gridRef = useRef<AgGridReact>(null);

  const rowSelection = useMemo<RowSelectionOptions | undefined>(() => {
    switch (dataType.type) {
      case "field":
        return { mode: "multiRow" };
      case "nested object":
        return { mode: "singleRow" };
      default:
        return undefined;
    }
  }, [dataType.type]);

  const dataTypeDef = useMemo(() => {
    console.log("dataType", dataType);
    if (dataType.type === "field") {
      return dataType.child?.children ?? {};
    } else {
      return dataType.children ?? {};
    }
  }, [dataType]);

  const handleConfirm = () => {
    const selectedRows = gridRef.current?.api?.getSelectedRows?.() || [];
    if (dataType.type === "field") {
      onChange(selectedRows);
    } else if (dataType.type === "nested object") {
      onChange(selectedRows[0]);
    }
    setIsOpen(false);
  };

  const handleDeselected = (i: number) => {
    const oldValue = Array.isArray(value) ? value : [value];
    const newValue = oldValue.filter((_: any, index: number) => index !== i);
    onChange(newValue.length > 0 ? newValue : undefined);
  };

  const renderSelectedValue = () => {
    if (!value || !dataTypeDef) return null;

    const values = Array.isArray(value) ? value : [value];

    return (
      <Accordion type="single" collapsible defaultValue="selected">
        <AccordionItem value="selected" className="border-0">
          <AccordionTrigger className="bg-white p-1 pl-3 pr-2 rounded-md border border-gray-300">
            Selected
          </AccordionTrigger>
          <AccordionContent className="bg-white p-1 pl-3 pr-2 mt-2 rounded-md border border-gray-300">
            {values.map((item, i) => (
              <View key={i} className="relative">
                <View>
                  {Object.entries(dataTypeDef).map(([key, meta]) => (
                    <View key={key} className="flex-row py-1">
                      <Text className="mr-1 min-w-[100px]">{meta.label}:</Text>
                      <Text>{item?.[key]}</Text>
                    </View>
                  ))}
                </View>
                <Button
                  variant="ghost"
                  className="absolute top-0 right-0 p-0 h-fit"
                  onPress={() => handleDeselected(i)}
                >
                  <XMarkIcon className="text-gray-400 h-5" />
                </Button>
              </View>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  };

  if (!dataType?.type) return null;

  return (
    <View className="flex-1 h-full justify-center">
      {value === undefined && (
        <Button
          className="flex-row border-dashed border-gray-400 bg-white h-8"
          variant="outline"
          onPress={() => setIsOpen(true)}
        >
          <PlusIcon className="mr-1 h-5 h-5" />
          <Text>{`${i18n.t("add")} ${dataType.label}`}</Text>
        </Button>
      )}
      {value && renderSelectedValue()}

      <Modal visible={isOpen} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
          <View className="absolute inset-0 bg-black/50 justify-center items-center px-6 py-10" />
        </TouchableWithoutFeedback>

        <View className="absolute inset-10 bg-white rounded-lg shadow-xl overflow-hidden">
          <View className="flex-1 p-3">
            <Table
              table={field}
              ref={gridRef}
              rowSelection={rowSelection}
              theme={myTableTheme}
              headerMeta={dataType}
              suppressUpdate
              suppressDelete
            />

            <View className="flex-row mt-4 space-x-2">
              <Pressable
                className="bg-blue-500 rounded-md py-2 px-6 flex-1 items-center"
                onPress={handleConfirm}
              >
                <Text className="text-white font-bold text-base">
                  {i18n.t("apply")}
                </Text>
              </Pressable>
              <Pressable
                className="bg-gray-300 rounded-md py-2 px-6 flex-1 items-center"
                onPress={() => setIsOpen(false)}
              >
                <Text className="text-black font-bold text-base">
                  {i18n.t("Cancel")}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default ForeignKeyInput;
