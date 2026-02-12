import React from "react";
import i18n from "@/locale/i18n";
import { ScrollView, View } from "react-native";

import { Button } from "@/components/sea-saw-design/button";
import { Text } from "@/components/sea-saw-design/text";
import InputForm from "@/components/sea-saw-design/form/InputForm";
import { FormDef } from "@/hooks/useFormDefs";
import { useOrderItemsManager } from "@/hooks/useOrderItemsManager";
import PurchaseItemsViewToggle from "@/components/sea-saw-page/procurement/purchase-order/display/items/PurchaseItemsViewToggle";
import { Drawer, InputFooter } from "@/components/sea-saw-page/base";

interface PurchaseOrderItemsInputProps {
  def: FormDef;
  value?: any[];
  onChange?: (v: any[]) => void;
  /** Whether to show Add/Copy/Delete toolbar buttons */
  showToolbar?: boolean;
  /** If true, disables editing and hides toolbar */
  readOnly?: boolean;
}

function PurchaseOrderItemsInput({
  def,
  value = [],
  onChange,
  showToolbar = true,
  readOnly = false,
}: PurchaseOrderItemsInputProps) {
  const {
    form,
    list,
    hasSelection,
    isOpen,
    editingIndex,
    openDrawer,
    closeDrawer,
    handleAdd,
    handleCopy,
    handleDelete,
    handleSave,
    handleSelectionChanged,
    handleGridReady,
  } = useOrderItemsManager({ value, onChange, readOnly });

  return (
    <View style={{ gap: 8 }}>
      {/* Toolbar */}
      {showToolbar && !readOnly && (
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
          <Button onPress={handleAdd}>
            <Text>{i18n.t("Add")}</Text>
          </Button>
          <Button onPress={handleCopy} disabled={!hasSelection}>
            <Text>{i18n.t("Copy")}</Text>
          </Button>
          <Button
            onPress={() => openDrawer(null)}
            disabled={!hasSelection}
          >
            <Text>{i18n.t("Edit")}</Text>
          </Button>
          <Button onPress={handleDelete} disabled={!hasSelection}>
            <Text>{i18n.t("Delete")}</Text>
          </Button>
        </View>
      )}

      {/* Items View */}
      <PurchaseItemsViewToggle
        value={list}
        def={def}
        agGridReactProps={{
          onGridReady: handleGridReady,
          onSelectionChanged: handleSelectionChanged,
          onRowClicked: (row: any) => {
            if (!readOnly && row.rowIndex !== null)
              openDrawer(row.rowIndex);
          },
          rowSelection: readOnly ? undefined : { mode: "singleRow" },
        }}
        onItemClick={(index: number) => {
          if (!readOnly) openDrawer(index);
        }}
      />

      {/* Edit Drawer */}
      <Drawer
        open={isOpen}
        onClose={closeDrawer}
        title={
          editingIndex !== null
            ? i18n.t("Edit Purchase Item")
            : i18n.t("Add Purchase Item")
        }
        footer={
          <InputFooter loading={false} onSave={handleSave} onCancel={closeDrawer} />
        }
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          <InputForm
            table="purchase_item"
            form={form}
            def={def as any}
            data={editingIndex !== null ? list[editingIndex] : {}}
          />
        </ScrollView>
      </Drawer>
    </View>
  );
}

export default PurchaseOrderItemsInput;
