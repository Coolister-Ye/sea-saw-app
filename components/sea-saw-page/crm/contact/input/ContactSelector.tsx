import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { View, Pressable } from "react-native";
import { Form } from "antd";
import {
  XMarkIcon,
  CheckIcon,
  UsersIcon,
} from "react-native-heroicons/outline";
import { EnvelopeIcon } from "@heroicons/react/20/solid";

import {
  SelectorModal,
  SelectorModalHeader,
  SelectorModalFooter,
} from "@/components/sea-saw-page/base/selector-modal";
import { SelectorTrigger } from "@/components/sea-saw-page/base/SelectorTrigger";
import { Text } from "@/components/sea-saw-design/text";
import UserSelector from "@/components/sea-saw-design/transfer/UserTransfer";
import useDataService from "@/hooks/useDataService";
import type { FormDef } from "@/hooks/useFormDefs";
import { cn } from "@/lib/utils";
import i18n from "@/locale/i18n";

/* Constants */
const PAGE_SIZE = 20;

const AVATAR_COLORS = [
  "bg-gradient-to-br from-blue-400 to-blue-600",
  "bg-gradient-to-br from-purple-400 to-purple-600",
  "bg-gradient-to-br from-pink-400 to-pink-600",
  "bg-gradient-to-br from-emerald-400 to-emerald-600",
  "bg-gradient-to-br from-teal-400 to-teal-600",
  "bg-gradient-to-br from-cyan-400 to-cyan-600",
  "bg-gradient-to-br from-amber-400 to-amber-600",
  "bg-gradient-to-br from-rose-400 to-rose-600",
] as const;

/* Types */
interface Contact {
  id: string | number;
  name: string;
  email?: string;
}

interface ContactSelectorProps {
  def?: FormDef;
  value?: Contact | Contact[];
  onChange?: (v: Contact[]) => void;
  multiple?: boolean;
  /** Controlled mode: external control of modal open state */
  open?: boolean;
  /** Controlled mode: callback when modal should open/close */
  onOpenChange?: (open: boolean) => void;
  /** Hide the trigger input (useful when using external trigger) */
  hideTrigger?: boolean;
  /** IDs of contacts that should be disabled (already selected elsewhere) */
  disabledIds?: (string | number)[];
}

/* Utils */
const normalizeContacts = (value?: Contact | Contact[]): Contact[] => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

const getAvatarColor = (name: string): string =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const getInitials = (name: string): string =>
  name?.slice(0, 1).toUpperCase() || "?";

/* Sub-components */
interface AvatarProps {
  name: string;
  size?: "small" | "large";
}

const Avatar = memo(({ name, size = "large" }: AvatarProps) => {
  const isSmall = size === "small";

  return (
    <View
      className={cn(
        "rounded-full items-center justify-center shadow-sm",
        isSmall ? "w-5 h-5" : "w-9 h-9",
        getAvatarColor(name)
      )}
    >
      <Text
        className={cn(
          "text-white font-semibold",
          isSmall ? "text-[10px]" : "text-sm"
        )}
      >
        {getInitials(name)}
      </Text>
    </View>
  );
});
Avatar.displayName = "Avatar";

interface ContactTagProps {
  contact: Contact;
  onRemove?: (id: string | number) => void;
  readOnly?: boolean;
}

const ContactTag = memo(({ contact, onRemove, readOnly }: ContactTagProps) => (
  <View className="flex-row items-center bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1">
    <Avatar name={contact.name} size="small" />
    <Text className="text-sm text-blue-800 font-medium ml-1.5">
      {contact.name}
    </Text>
    {!readOnly && onRemove && (
      <Pressable
        onPress={() => onRemove(contact.id)}
        className="ml-1.5 p-0.5 rounded-full hover:bg-blue-100 active:bg-blue-200"
      >
        <XMarkIcon size={14} className="text-blue-400" />
      </Pressable>
    )}
  </View>
));
ContactTag.displayName = "ContactTag";

interface ContactItemProps {
  contact: Contact;
}

const ContactItem = memo(({ contact }: ContactItemProps) => (
  <View className="flex-row items-center">
    <Avatar name={contact.name} />
    <View className="flex-1 ml-3">
      <Text className="text-sm font-medium text-gray-800">{contact.name}</Text>
      {contact.email && (
        <View className="flex-row items-center mt-0.5">
          <EnvelopeIcon className="w-3 h-3 text-gray-400 mr-1" />
          <Text className="text-xs text-gray-500">{contact.email}</Text>
        </View>
      )}
    </View>
  </View>
));
ContactItem.displayName = "ContactItem";

/* Main Component */
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

  /** Update form values - extracted to reduce duplication */
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
          {/* Selector */}
          <View className="px-5 py-4">
            <UserSelector
              idName="id"
              dataSource={options}
              value={selected}
              multiple={multiple}
              loading={loading}
              onSearch={fetchContacts}
              onChange={handleSelectChange}
              renderItem={(item, isSelected, onToggle) => {
                const isDisabled = disabledIds.includes(item.id);
                return (
                  <Pressable
                    onPress={isDisabled ? undefined : onToggle}
                    disabled={isDisabled}
                    className={cn(
                      "flex-row items-center px-3 py-2.5 rounded-xl mb-1 border",
                      isDisabled
                        ? "bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed"
                        : isSelected
                          ? "bg-blue-50 border-blue-200"
                          : "hover:bg-gray-50 border-transparent"
                    )}
                  >
                    <View
                      className={cn(
                        "w-5 h-5 mr-3 rounded-full border-2 items-center justify-center",
                        isDisabled
                          ? "border-gray-300 bg-gray-300"
                          : isSelected
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-300"
                      )}
                    >
                      {(isSelected || isDisabled) && (
                        <CheckIcon size={12} className="text-white" />
                      )}
                    </View>
                    <ContactItem contact={item} />
                    {isDisabled && (
                      <Text className="text-xs text-gray-400 ml-auto">
                        {i18n.t("Already added")}
                      </Text>
                    )}
                  </Pressable>
                );
              }}
              renderSelectedItem={(item, onRemove) => (
                <View className="flex-row justify-between items-center p-3 bg-gray-50 rounded-xl mb-1.5 border border-gray-100">
                  <ContactItem contact={item} />
                  <Pressable
                    onPress={onRemove}
                    className="p-1.5 rounded-full hover:bg-gray-200 active:bg-gray-300 transition-colors"
                  >
                    <XMarkIcon size={16} className="text-gray-400" />
                  </Pressable>
                </View>
              )}
            />
          </View>
        </SelectorModal>
      )}
    </View>
  );
}

export { ContactSelector };
