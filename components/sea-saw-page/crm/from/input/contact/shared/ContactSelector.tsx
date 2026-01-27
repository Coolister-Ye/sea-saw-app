import React, { useState, useEffect, useCallback, useMemo } from "react";
import i18n from "@/locale/i18n";
import { View, Pressable, Modal, TouchableWithoutFeedback } from "react-native";
import {
  XMarkIcon,
  CheckIcon,
  ChevronDownIcon,
  UsersIcon,
} from "react-native-heroicons/outline";
import { EnvelopeIcon } from "@heroicons/react/20/solid";
import { Form } from "antd";

import UserSelector from "@/components/sea-saw-design/transfer/UserTransfer";
import useDataService from "@/hooks/useDataService";
import type { FormDef } from "@/hooks/useFormDefs";
import { Text } from "@/components/sea-saw-design/text";
import { Button } from "@/components/sea-saw-design/button";

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
}

/* Utils */
const normalizeContacts = (value?: Contact | Contact[]): Contact[] => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

const AVATAR_COLORS = [
  "bg-gradient-to-br from-blue-400 to-blue-600",
  "bg-gradient-to-br from-blue-400 to-blue-600",
  "bg-gradient-to-br from-purple-400 to-purple-600",
  "bg-gradient-to-br from-pink-400 to-pink-600",
  "bg-gradient-to-br from-emerald-400 to-emerald-600",
  "bg-gradient-to-br from-teal-400 to-teal-600",
  "bg-gradient-to-br from-cyan-400 to-cyan-600",
  "bg-gradient-to-br from-amber-400 to-amber-600",
];

const getAvatarColor = (name: string) =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const getInitials = (name: string) => name?.slice(0, 1).toUpperCase() || "?";

export default function ContactSelector({
  def,
  value,
  onChange,
  multiple = false,
}: ContactSelectorProps) {
  const { getViewSet } = useDataService();
  const contactViewSet = useMemo(() => getViewSet("contact"), [getViewSet]);
  const form = Form.useFormInstance();

  const readOnly = def?.read_only === true;

  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<Contact[]>([]);
  const [selected, setSelected] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);

  /** Sync external value to internal state */
  useEffect(() => {
    setSelected(normalizeContacts(value));
  }, [value]);

  /** Fetch contacts from API */
  const fetchContacts = useCallback(
    async (keyword = "") => {
      setLoading(true);
      try {
        const res = await contactViewSet.list({
          params: { page: 1, page_size: 20, search: keyword },
        });
        setOptions(res.results || []);
      } finally {
        setLoading(false);
      }
    },
    [contactViewSet],
  );

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  /* Handlers */
  const closeModal = useCallback(() => setIsOpen(false), []);

  const handleConfirm = useCallback(() => {
    if (form) {
      if (multiple) {
        form.setFieldsValue({
          contact: selected,
          contact_id: selected?.map((c) => c.id),
        });
      } else {
        const singleContact = selected[0];
        form.setFieldsValue({
          contact: singleContact,
          contact_id: singleContact?.id,
        });
      }
    }
    onChange?.(selected);
    setIsOpen(false);
  }, [form, multiple, selected, onChange]);

  const handleRemove = useCallback(
    (id: string | number) => {
      if (readOnly) return;
      const next = selected.filter((c) => c.id !== id);
      setSelected(next);

      if (form) {
        if (multiple) {
          form.setFieldsValue({
            contact: next,
            contact_id: next?.map((c) => c.id),
          });
        } else {
          form.setFieldsValue({
            contact: null,
            contact_id: null,
          });
        }
      }
      onChange?.(next);
    },
    [readOnly, selected, form, multiple, onChange],
  );

  const handleSelectChange = useCallback(
    (items: Contact[]) => {
      setSelected(multiple ? items : items.slice(-1));
    },
    [multiple],
  );

  /** Render user item */
  const renderUser = (item: Contact) => (
    <View className="flex-row items-center">
      <View
        className={`w-9 h-9 rounded-full mr-3 items-center justify-center shadow-sm ${getAvatarColor(
          item.name,
        )}`}
      >
        <Text className="text-white text-sm font-semibold">
          {getInitials(item.name)}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="text-sm font-medium text-gray-800">{item.name}</Text>
        {item.email && (
          <View className="flex-row items-center mt-0.5">
            <EnvelopeIcon className="w-3 h-3 text-gray-400 mr-1" />
            <Text className="text-xs text-gray-500">{item.email}</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View className="w-full">
      {/* Trigger Input */}
      <Pressable
        disabled={readOnly}
        onPress={() => !readOnly && setIsOpen(true)}
        className={`
          min-h-[36px] px-1.5 py-1 rounded-lg border
          flex-row flex-wrap items-center gap-1.5
          transition-all duration-200
          ${
            readOnly
              ? "bg-gray-50 border-gray-200 cursor-not-allowed"
              : "border-gray-300 bg-white hover:border-blue-400 hover:shadow-sm"
          }
        `}
      >
        {selected.length === 0 ? (
          <View className="flex-row items-center flex-1">
            <UsersIcon size={16} className="text-gray-400 mr-2" />
            <Text className="text-gray-400 text-sm">
              {i18n.t("Select Contact")}
            </Text>
          </View>
        ) : (
          <View className="flex-row flex-wrap items-center gap-1 flex-1">
            {selected.map((c) => (
              <View
                key={c.id}
                className="flex-row items-center bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1"
              >
                <View
                  className={`w-5 h-5 rounded-full mr-1.5 items-center justify-center ${getAvatarColor(
                    c.name,
                  )}`}
                >
                  <Text className="text-white text-[10px] font-semibold">
                    {getInitials(c.name)}
                  </Text>
                </View>
                <Text className="text-sm text-blue-800 font-medium">
                  {c.name}
                </Text>
                {!readOnly && (
                  <Pressable
                    onPress={() => handleRemove(c.id)}
                    className="ml-1.5 p-0.5 rounded-full hover:bg-blue-100 active:bg-blue-200"
                  >
                    <XMarkIcon size={14} className="text-blue-400" />
                  </Pressable>
                )}
              </View>
            ))}
          </View>
        )}
        {!readOnly && (
          <ChevronDownIcon size={18} className="text-gray-400 ml-2" />
        )}
      </Pressable>

      {/* Modal */}
      {!readOnly && (
        <Modal visible={isOpen} transparent animationType="fade">
          <View className="flex-1 justify-center items-center">
            <TouchableWithoutFeedback onPress={closeModal}>
              <View className="absolute inset-0 bg-black/60" />
            </TouchableWithoutFeedback>

            <View className="bg-white rounded-2xl w-[95%] md:w-[860px] overflow-hidden shadow-2xl border border-gray-100">
              {/* Header */}
              <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 items-center justify-center mr-3 shadow-sm">
                    <UsersIcon size={20} className="text-white" />
                  </View>
                  <View>
                    <Text className="text-lg font-semibold text-gray-800">
                      {i18n.t("Select Contact")}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      {multiple
                        ? i18n.t("Select one or more contacts")
                        : i18n.t("Select a contact")}
                    </Text>
                  </View>
                </View>
                <Pressable
                  onPress={closeModal}
                  className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
                >
                  <XMarkIcon size={20} className="text-gray-500" />
                </Pressable>
              </View>

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
                  renderItem={(item, isSelected, onToggle) => (
                    <Pressable
                      onPress={onToggle}
                      className={`
                        flex-row items-center px-3 py-2.5 rounded-xl mb-1
                        transition-all duration-150
                        ${
                          isSelected
                            ? "bg-blue-50 border border-blue-200"
                            : "hover:bg-gray-50 border border-transparent"
                        }
                      `}
                    >
                      <View
                        className={`
                          w-5 h-5 mr-3 rounded-full border-2 items-center justify-center
                          transition-all duration-150
                          ${
                            isSelected
                              ? "border-blue-500 bg-blue-500"
                              : "border-gray-300"
                          }
                        `}
                      >
                        {isSelected && (
                          <CheckIcon size={12} className="text-white" />
                        )}
                      </View>
                      {renderUser(item)}
                    </Pressable>
                  )}
                  renderSelectedItem={(item, onRemove) => (
                    <View className="flex-row justify-between items-center p-3 bg-gray-50 rounded-xl mb-1.5 border border-gray-100">
                      {renderUser(item)}
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

              {/* Footer */}
              <View className="flex-row max-sm:flex-col max-sm:gap-3 items-center justify-between px-5 py-3.5 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <View className="flex-row items-center">
                  {multiple && selected.length > 0 && (
                    <View className="flex-row items-center bg-blue-100 px-3 py-1.5 rounded-full">
                      <View className="w-5 h-5 rounded-full bg-blue-500 items-center justify-center mr-2">
                        <Text className="text-white text-xs font-bold">
                          {selected.length}
                        </Text>
                      </View>
                      <Text className="text-sm text-blue-700 font-medium">
                        {i18n.t("selected")}
                      </Text>
                    </View>
                  )}
                  {!multiple && selected.length > 0 && (
                    <View className="flex-row items-center bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                      <CheckIcon
                        size={14}
                        className="text-emerald-500 mr-1.5"
                      />
                      <Text className="text-sm text-emerald-700 font-medium">
                        {selected[0]?.name}
                      </Text>
                    </View>
                  )}
                  {selected.length === 0 && (
                    <Text className="text-sm text-gray-400 italic">
                      {i18n.t("No contact selected")}
                    </Text>
                  )}
                </View>

                <View className="flex-row items-center gap-2">
                  {selected.length > 0 && (
                    <Button
                      variant="ghost"
                      onPress={() => setSelected([])}
                      className="hover:bg-red-50"
                    >
                      <Text className="text-red-500 text-sm">
                        {i18n.t("Clear")}
                      </Text>
                    </Button>
                  )}
                  <Button variant="outline" onPress={closeModal}>
                    <Text className="text-gray-600">{i18n.t("Cancel")}</Text>
                  </Button>
                  <Button onPress={handleConfirm} disabled={loading}>
                    <Text className="text-white font-medium">
                      {i18n.t("Confirm")}
                    </Text>
                  </Button>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

export { ContactSelector };
