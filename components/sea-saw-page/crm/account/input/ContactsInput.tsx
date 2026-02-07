import { useCallback, useEffect, useState } from "react";
import i18n from "@/locale/i18n";
import { View } from "react-native";
import { Modal } from "antd";
import { FormDef } from "@/hooks/useFormDefs";
import ActionDropdown from "@/components/sea-saw-design/action-dropdown";
import ContactItemsTable from "../../contact/display/ContactItemsTable";
import ContactSelector from "../../contact/input/ContactSelector";

interface ContactsInputProps {
  def: FormDef;
  value?: any[];
  onChange?: (v: any[]) => void;
  showToolbar?: boolean;
}

/**
 * ContactsInput - Manages contact associations for an Account.
 *
 * Unlike OrderItemsInput which creates embedded objects, this component
 * manages relationships to existing Contact records.
 *
 * Backend expects:
 * - Read: `contacts` field (array of contact objects)
 * - Write: `contact_ids` field (array of contact IDs)
 */
function ContactsInput({
  def,
  value = [],
  onChange,
  showToolbar = true,
}: ContactsInputProps) {
  const [list, setList] = useState<any[]>(value);
  const [gridApi, setGridApi] = useState<any>(null);
  const [hasSelection, setHasSelection] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sync list with value prop changes
  useEffect(() => {
    setList(value);
  }, [value]);

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

  const handleAdd = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback(() => {
    const index = getSelectedIndex();
    if (index === null) return;

    Modal.confirm({
      title: i18n.t("Confirm Delete"),
      content: i18n.t(
        "Are you sure you want to remove this contact from the account?",
      ),
      okText: i18n.t("Delete"),
      cancelText: i18n.t("Cancel"),
      okButtonProps: { danger: true },
      onOk: () => {
        updateList(list.filter((_, i) => i !== index));
      },
    });
  }, [getSelectedIndex, list, updateList]);

  const handleContactSelect = useCallback(
    (selectedContacts: any[]) => {
      if (selectedContacts.length > 0) {
        updateList([...list, ...selectedContacts]);
        setIsModalOpen(false);
      }
    },
    [list, updateList],
  );

  const handleSelectionChanged = useCallback((e: any) => {
    setHasSelection(e.api.getSelectedNodes().length > 0);
  }, []);

  const handleGridReady = useCallback((params: any) => {
    setGridApi(params.api);
  }, []);

  return (
    <View className="gap-3">
      {showToolbar && (
        <View className="flex-row items-center justify-end">
          <ActionDropdown
            onPrimaryAction={handleAdd}
            primaryLabel={i18n.t("Add Contact")}
            onDelete={handleDelete}
            deleteDisabled={!hasSelection}
          />
        </View>
      )}

      <ContactItemsTable
        def={def}
        value={list}
        agGridReactProps={{
          onGridReady: handleGridReady,
          onSelectionChanged: handleSelectionChanged,
          rowSelection: { mode: "singleRow" },
        }}
      />

      {/* Use ContactSelector in controlled mode with hidden trigger */}
      <ContactSelector
        multiple={true}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        hideTrigger={true}
        onChange={handleContactSelect}
        disabledIds={list.map((c) => c.id)}
      />
    </View>
  );
}

export default ContactsInput;
export { ContactsInput };
