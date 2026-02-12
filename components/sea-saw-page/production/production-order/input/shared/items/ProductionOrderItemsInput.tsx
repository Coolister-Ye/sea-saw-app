import React from "react";
import i18n from "@/locale/i18n";
import { ScrollView, View } from "react-native";

import { FormDef } from "@/hooks/useFormDefs";
import { useOrderItemsManager } from "@/hooks/useOrderItemsManager";
import InputForm from "@/components/sea-saw-design/form/InputForm";
import ProductionItemsViewToggle from "@/components/sea-saw-page/production/production-order/display/items/ProductionItemsViewToggle";
import ActionDropdown from "@/components/sea-saw-design/action-dropdown";
import { Drawer, InputFooter } from "@/components/sea-saw-page/base";

interface ProductionOrderItemsInputProps {
  def: FormDef;
  value?: any[];
  onChange?: (v: any[]) => void;
  showToolbar?: boolean;
  readOnly?: boolean;
}

function ProductionOrderItemsInput({
  def,
  value = [],
  onChange,
  showToolbar = true,
  readOnly = false,
}: ProductionOrderItemsInputProps) {
  const {
    form,
    list,
    hasSelection,
    isOpen,
    closeDrawer,
    handleAdd,
    handleEdit,
    handleCopy,
    handleDelete,
    handleSave,
    handleSelectionChanged,
    handleRowClicked,
    handleGridReady,
  } = useOrderItemsManager({ value, onChange, readOnly });

  return (
    <View className="gap-3">
      {showToolbar && !readOnly && (
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

      <ProductionItemsViewToggle
        def={def}
        value={list}
        onItemClick={readOnly ? undefined : handleEdit}
        agGridReactProps={{
          onGridReady: handleGridReady,
          onRowClicked: handleRowClicked,
          onSelectionChanged: handleSelectionChanged,
          rowSelection: readOnly ? undefined : { mode: "singleRow" },
        }}
      />

      <Drawer
        open={isOpen}
        onClose={closeDrawer}
        title={i18n.t("Production Item")}
        footer={<InputFooter onSave={handleSave} onCancel={closeDrawer} />}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <InputForm table="production_item" def={def as any} form={form} />
        </ScrollView>
      </Drawer>
    </View>
  );
}

export default ProductionOrderItemsInput;
export { ProductionOrderItemsInput };
