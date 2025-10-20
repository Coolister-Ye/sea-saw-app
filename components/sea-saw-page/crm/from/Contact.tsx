import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import UserSelector from "@/components/sea-saw-design/transfer/UserTransfer";
import { UserIcon } from "react-native-heroicons/outline";
import { EnvelopeIcon } from "@heroicons/react/20/solid";
import { useLocale } from "@/context/Locale";
import { Button } from "@/components/sea-saw-design/button";
import useDataService from "@/hooks/useDataService";
import { FormDef } from "@/hooks/useFormDefs";

interface Contact {
  key: string | number;
  full_name: string;
  email?: string;
}

interface ContactInputProps {
  def: FormDef;
  value?: Contact[];
  onChange?: (v: Contact[]) => void;
}

function ContactInput({ value = [], onChange }: ContactInputProps) {
  const { i18n } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContacts, setSeletedContacts] = useState<any[]>(value);
  const [loading, setLoading] = useState(false);
  const { list } = useDataService();
  const entityType = "contact";

  const fetchData = useCallback(
    async (keyword?: string) => {
      setLoading(true);
      try {
        const response = await list({
          contentType: entityType,
          params: { page: 1, page_size: 20, search: keyword || "" },
        });

        const results: any[] = response.data.results.map((item: any) => ({
          key: item.id || item.pk,
          ...item,
        }));
        setContacts(results);
      } finally {
        setLoading(false);
      }
    },
    [entityType, list]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (keyword: string) => {
    console.log(keyword);
    fetchData(keyword);
  };

  const handleRemove = (key: string | number) => {
    const newSelected = selectedContacts.filter((c) => c.key !== key);
    setSeletedContacts(newSelected);
    onChange?.(newSelected);
  };

  const handleConfirm = () => {
    onChange?.(selectedContacts);
    setIsOpen(false);
  };

  const renderUser = (item: Contact) => (
    <View className="flex-row items-center">
      <View className="h-full aspect-square bg-gray-200 rounded-full mr-2 items-center justify-center overflow-hidden">
        <UserIcon color="gray" className="w-full h-full p-2" />
      </View>
      <View>
        <Text className="text-base">{item.full_name}</Text>
        {item.email && (
          <Text className="text-gray-400 flex flex-row items-center text-xs">
            <EnvelopeIcon className="w-4 h-4 mr-1" />
            {item.email}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <View className="flex-1">
      {/* 已选联系人作为输入框 */}
      <Pressable
        className="border border-gray-300 rounded-md px-1.5 py-1.5 flex-row flex-wrap items-center"
        onPress={() => setIsOpen(true)}
      >
        {value.length === 0 ? (
          <Text className="text-gray-400">{i18n.t("Select Contact")}</Text>
        ) : (
          value.map((c) => (
            <View
              key={c.key}
              className="flex-row items-center bg-gray-100 px-2 py-1 rounded-full mr-2"
            >
              <Text className="mr-2">{c.full_name}</Text>
              <Pressable onPress={() => handleRemove(c.key)}>
                <Text className="text-red-500 font-bold">×</Text>
              </Pressable>
            </View>
          ))
        )}
      </Pressable>

      {/* 弹窗 */}
      <Modal visible={isOpen} transparent animationType="fade">
        <View className="flex flex-1 justify-center items-center">
          <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
            <View className="absolute inset-0 bg-black/50" />
          </TouchableWithoutFeedback>

          <View className="bg-white rounded-lg shadow-xl w-full md:w-[850px] p-5">
            <Text className="text-lg font-bold mb-2">
              {i18n.t("Select Contact")}
            </Text>

            <UserSelector
              dataSource={contacts}
              value={selectedContacts}
              multiple={false}
              onChange={setSeletedContacts}
              onSearch={handleSearch}
              renderItem={(item, selected, onToggle) => (
                <Pressable
                  onPress={onToggle}
                  className="flex-row items-center py-1 px-2 rounded-lg active:bg-gray-100"
                >
                  {/* radio */}
                  <View
                    className={`w-5 h-5 mr-2 rounded-full border items-center justify-center ${
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
                <View className="flex-row items-center justify-between p-2">
                  {renderUser(item)}
                  <Pressable onPress={onRemove}>
                    <Text className="text-gray-400 text-lg">×</Text>
                  </Pressable>
                </View>
              )}
            />

            <View className="flex-row mt-4 space-x-2 justify-end">
              <Button variant={"outline"} onPress={() => setIsOpen(false)}>
                <Text>{i18n.t("Cancel")}</Text>
              </Button>
              <Button onPress={handleConfirm}>
                <Text className="text-white font-bold">
                  {i18n.t("Confirm")}
                </Text>
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export { ContactInput };
export default ContactInput;
