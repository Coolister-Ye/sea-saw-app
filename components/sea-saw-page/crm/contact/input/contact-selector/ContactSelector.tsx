import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View } from "react-native";
import { Form } from "antd";
import { UsersIcon } from "react-native-heroicons/outline";

import {
  SelectorModal,
  SelectorModalHeader,
  SelectorModalFooter,
} from "@/components/sea-saw-page/base/selector-modal";
import { SelectorTrigger } from "@/components/sea-saw-page/base/SelectorTrigger";
import UserSelector from "@/components/sea-saw-design/transfer/UserTransfer";
import useDataService from "@/hooks/useDataService";
import type { FormDef } from "@/hooks/useFormDefs";
import i18n from "@/locale/i18n";

import ContactTag from "./ContactTag";
import {
  SelectableContactItem,
  SelectedContactItem,
} from "./ContactSelectorItem";
import type { Contact } from "./types";

const PAGE_SIZE = 20;

const normalizeContacts = (value?: Contact | Contact[]): Contact[] => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

interface ContactSelectorProps {
  def?: FormDef;
  value?: Contact | Contact[];
  onChange?: (v: Contact[]) => void;
  multiple?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
  disabledIds?: (string | number)[];
}

export default function ContactSelector({
  def,
  value,
  onChange,
  multiple = false,
  open: controlledOpen,
  onOpenChange,
  hideTrigger = false,
  disabledIds = [],
}: ContactSelectorProps) {
  const { getViewSet } = useDataService();
  const contactViewSet = useMemo(() => getViewSet("contact"), [getViewSet]);
  const form = Form.useFormInstance();

  const readOnly = def?.read_only === true;

  // Support both controlled and uncontrolled mode
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = useCallback(
    (open: boolean) => {
      onOpenChange ? onOpenChange(open) : setInternalOpen(open);
    },
    [onOpenChange]
  );

  const [options, setOptions] = useState<Contact[]>([]);
  const [selected, setSelected] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);

  /** Sync external value to internal state */
  useEffect(() => {
    setSelected(normalizeContacts(value));
  }, [value]);

  /** Update form values */
  const updateFormValues = useCallback(
    (contacts: Contact[]) => {
      if (!form) return;

      if (multiple) {
        form.setFieldsValue({
          contact: contacts,
          contact_id: contacts.map((c) => c.id),
        });
      } else {
        const singleContact = contacts[0] || null;
        form.setFieldsValue({
          contact: singleContact,
          contact_id: singleContact?.id || null,
        });
      }
    },
    [form, multiple]
  );

  /** Fetch contacts from API */
  const fetchContacts = useCallback(
    async (keyword = "") => {
      setLoading(true);
      try {
        const res = await contactViewSet.list({
          params: { page: 1, page_size: PAGE_SIZE, search: keyword },
        });
        setOptions(res.results || []);
      } finally {
        setLoading(false);
      }
    },
    [contactViewSet]
  );

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  /* Handlers */
  const closeModal = useCallback(() => setIsOpen(false), [setIsOpen]);

  const handleConfirm = useCallback(() => {
    updateFormValues(selected);
    onChange?.(selected);
    closeModal();
  }, [selected, onChange, updateFormValues, closeModal]);

  const handleRemove = useCallback(
    (id: string | number) => {
      if (readOnly) return;

      const nextContacts = selected.filter((c) => c.id !== id);
      setSelected(nextContacts);
      updateFormValues(nextContacts);
      onChange?.(nextContacts);
    },
    [readOnly, selected, updateFormValues, onChange]
  );

  const handleSelectChange = useCallback(
    (items: Contact[]) => {
      setSelected(multiple ? items : items.slice(-1));
    },
    [multiple]
  );

  const handleClear = useCallback(() => {
    setSelected([]);
  }, []);

  return (
    <View className="w-full">
      {/* Trigger Input */}
      {!hideTrigger && (
        <SelectorTrigger
          disabled={readOnly}
          onPress={() => setIsOpen(true)}
          placeholder={i18n.t("Select Contact")}
          placeholderIcon={<UsersIcon size={16} className="text-gray-400 mr-2" />}
          hasSelection={selected.length > 0}
          horizontalScroll={false}
          renderSelected={() =>
            selected.map((contact) => (
              <ContactTag
                key={contact.id}
                contact={contact}
                onRemove={handleRemove}
                readOnly={readOnly}
              />
            ))
          }
        />
      )}

      {/* Modal */}
      {!readOnly && (
        <SelectorModal
          visible={isOpen}
          onClose={closeModal}
          header={
            <SelectorModalHeader
              icon={<UsersIcon size={20} className="text-white" />}
              title={i18n.t("Select Contact")}
              subtitle={
                multiple
                  ? i18n.t("Select one or more contacts")
                  : i18n.t("Select a contact")
              }
              onClose={closeModal}
            />
          }
          footer={
            <SelectorModalFooter
              selected={selected}
              multiple={multiple}
              loading={loading}
              displayField="name"
              emptyText={i18n.t("No contact selected")}
              onClear={handleClear}
              onCancel={closeModal}
              onConfirm={handleConfirm}
            />
          }
        >
          <View className="px-5 py-4">
            <UserSelector
              idName="id"
              dataSource={options}
              value={selected}
              multiple={multiple}
              loading={loading}
              onSearch={fetchContacts}
              onChange={handleSelectChange}
              renderItem={(item, isSelected, onToggle) => (
                <SelectableContactItem
                  item={item}
                  isSelected={isSelected}
                  isDisabled={disabledIds.includes(item.id)}
                  onToggle={onToggle}
                />
              )}
              renderSelectedItem={(item, onRemove) => (
                <SelectedContactItem item={item} onRemove={onRemove} />
              )}
            />
          </View>
        </SelectorModal>
      )}
    </View>
  );
}

export { ContactSelector };
