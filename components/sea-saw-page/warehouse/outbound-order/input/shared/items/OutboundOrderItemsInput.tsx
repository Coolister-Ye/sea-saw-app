import React, { useCallback } from "react";
import i18n from "@/locale/i18n";
import { ScrollView, View } from "react-native";

import { FormDef } from "@/hooks/useFormDefs";
import { useOrderItemsManager } from "@/hooks/useOrderItemsManager";
import InputForm from "@/components/sea-saw-design/form/InputForm";
import ActionDropdown from "@/components/sea-saw-design/action-dropdown";
import OutboundItemsViewToggle from "../../../display/items/OutboundItemsViewToggle";
import { Drawer, InputFooter } from "@/components/sea-saw-page/base";

interface OutboundOrderItemsInputProps {
  def: FormDef;
  value?: any[];
  onChange?: (v: any[]) => void;
  showToolbar?: boolean;
  readOnly?: boolean;
}

function OutboundOrderItemsInput({
  def,
  value = [],
  onChange,
  showToolbar = true,
  readOnly = false,
}: OutboundOrderItemsInputProps) {
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

  // Auto-calculate outbound weights when outbound_qty / weights change
  const handleFormValuesChange = useCallback(
    (_changedValues: any, allValues: any) => {
      const updates: Record<string, number> = {};
      const net_weight = parseFloat(allValues.net_weight) || 0;
      const gross_weight = parseFloat(allValues.gross_weight) || 0;
      const outbound_qty = parseFloat(allValues.outbound_qty) || 0;

      if (net_weight && outbound_qty) {
        updates.outbound_net_weight = net_weight * outbound_qty;
      }
      if (gross_weight && outbound_qty) {
        updates.outbound_gross_weight = gross_weight * outbound_qty;
      }
      if (Object.keys(updates).length > 0) {
        form.setFieldsValue(updates);
      }
    },
    [form],
  );

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

      <OutboundItemsViewToggle
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
        title={i18n.t("Outbound Item")}
        footer={<InputFooter onSave={handleSave} onCancel={closeDrawer} />}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <InputForm
            table="outbound_item"
            def={def as any}
            form={form}
            onValuesChange={handleFormValuesChange}
          />
        </ScrollView>
      </Drawer>
    </View>
  );
}

export default OutboundOrderItemsInput;
export { OutboundOrderItemsInput };
