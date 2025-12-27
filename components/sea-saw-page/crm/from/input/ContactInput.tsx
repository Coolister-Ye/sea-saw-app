import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, Pressable, Modal, TouchableWithoutFeedback } from "react-native";
import { UserIcon } from "react-native-heroicons/outline";
import { EnvelopeIcon } from "@heroicons/react/20/solid";

import UserSelector from "@/components/sea-saw-design/transfer/UserTransfer";
import { useLocale } from "@/context/Locale";
import useDataService from "@/hooks/useDataService";
import { FormDef } from "@/hooks/useFormDefs";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";

/* ========================
 * Types
 * ======================== */
interface Contact {
  id: string | number;
  name: string;
  email?: string;
}

interface ContactInputProps {
  def?: FormDef;
  value?: Contact | Contact[];
  onChange?: (v: Contact[]) => void;
  multiple?: boolean;
}

/* ========================
 * Utils
 * ======================== */
const normalizeContacts = (value?: Contact | Contact[]) => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

/* ========================
 * Component
 * ======================== */
export default function ContactInput({
  def,
  value,
  onChange,
  multiple = false,
}: ContactInputProps) {
  const { i18n } = useLocale();
  const { list } = useDataService();

  const readOnly = def?.read_only === true;

  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<Contact[]>([]);
  const [selected, setSelected] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);

  /* ========================
   * Sync value
   * ======================== */
  useEffect(() => {
    setSelected(normalizeContacts(value));
  }, [value]);

  /* ========================
   * Fetch contacts
   * ======================== */
  const fetchContacts = useCallback(
    async (keyword = "") => {
      setLoading(true);
      try {
        const res = await list({
          contentType: "contact",
          params: { page: 1, page_size: 20, search: keyword },
        });

        const results: Contact[] = res.data?.results?.map((item: any) => ({
          id: item.pk ?? item.id,
          name: item.name,
          email: item.email,
        }));

        setOptions(results);
      } finally {
        setLoading(false);
      }
    },
    [list]
  );

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  /* ========================
   * Handlers
   * ======================== */
  const handleConfirm = () => {
    onChange?.(selected);
    setIsOpen(false);
  };

  const handleRemove = (id: string | number) => {
    if (readOnly) return;
    const next = selected.filter((c) => c.id !== id);
    setSelected(next);
    onChange?.(next);
  };

  const handleSelectChange = (items: Contact[]) => {
    setSelected(multiple ? items : items.slice(-1));
  };

  /* ========================
   * Render helpers
   * ======================== */
  const renderUser = (item: Contact) => (
    <View className="flex-row items-center">
      <View className="w-8 h-8 rounded-full bg-gray-200 mr-2 items-center justify-center">
        <UserIcon size={16} color="gray" />
      </View>
      <View>
        <Text className="text-sm font-medium">{item.name}</Text>
        {item.email && (
          <View className="text-xs text-gray-400 flex-row items-center">
            <EnvelopeIcon className="w-3 h-3 mr-1" />
            <Text className="text-xs text-gray-400">{item.email}</Text>
          </View>
        )}
      </View>
    </View>
  );

  /* ========================
   * Render
   * ======================== */
  return (
    <View className="w-full">
      {/* ========================
       * Selected (Input-like)
       * ======================== */}
      <Pressable
        disabled={readOnly}
        onPress={() => !readOnly && setIsOpen(true)}
        className={`
          min-h-[36px] px-2 py-1 rounded-md border
          flex-row flex-wrap items-center gap-1
          ${readOnly ? "bg-gray-50 border-gray-200" : "border-gray-300"}
        `}
      >
        {selected.length === 0 ? (
          <Text className="text-gray-400 text-sm">
            {i18n.t("Select Contact")}
          </Text>
        ) : (
          selected.map((c) => (
            <View
              key={c.id}
              className="flex-row items-center bg-gray-100 rounded px-2 py-0.5"
            >
              <Text className="text-sm mr-1">{c.name}</Text>
              {!readOnly && (
                <Pressable onPress={() => handleRemove(c.id)}>
                  <Text className="text-red-400 text-xs hover:text-red-600">
                    ×
                  </Text>
                </Pressable>
              )}
            </View>
          ))
        )}
      </Pressable>

      {/* ========================
       * Modal
       * ======================== */}
      {!readOnly && (
        <Modal visible={isOpen} transparent animationType="fade">
          <View className="flex-1 justify-center items-center">
            <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
              <View className="absolute inset-0 bg-black/40" />
            </TouchableWithoutFeedback>

            <View className="bg-white rounded-lg w-full md:w-[860px] p-5">
              {/* Header */}
              <Text className="text-lg font-semibold mb-3">
                {i18n.t("Select Contact")}
              </Text>

              {/* Selector */}
              <UserSelector
                idName="id"
                dataSource={options}
                value={selected}
                multiple={multiple}
                loading={loading}
                onSearch={fetchContacts}
                onChange={handleSelectChange}
                renderItem={(item, selected, onToggle) => (
                  <Pressable
                    onPress={onToggle}
                    className="flex-row items-center px-2 py-1 rounded hover:bg-gray-100"
                  >
                    <View
                      className={`w-4 h-4 mr-2 rounded-full border items-center justify-center ${
                        selected ? "border-blue-500" : "border-gray-400"
                      }`}
                    >
                      {selected && (
                        <View className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      )}
                    </View>
                    {renderUser(item)}
                  </Pressable>
                )}
                renderSelectedItem={(item, onRemove) => (
                  <View className="flex-row justify-between items-center p-2">
                    {renderUser(item)}
                    <Pressable onPress={onRemove}>
                      <Text className="text-gray-400 text-lg">×</Text>
                    </Pressable>
                  </View>
                )}
              />

              {/* Footer */}
              <View className="flex-row justify-end gap-2 mt-4">
                <Button onPress={handleConfirm} disabled={loading}>
                  <Text className="text-white">{i18n.t("Save")}</Text>
                </Button>
                <Button variant="outline" onPress={() => setIsOpen(false)}>
                  <Text>{i18n.t("Cancel")}</Text>
                </Button>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

export { ContactInput };
