import React, { useState, useEffect, useCallback, useMemo } from "react";
import i18n from "@/locale/i18n";
import { View, Pressable, Modal, TouchableWithoutFeedback } from "react-native";
import UserSelector from "@/components/sea-saw-design/transfer/UserTransfer";
import { UserIcon } from "react-native-heroicons/outline";
import { EnvelopeIcon } from "@heroicons/react/20/solid";
import useDataService from "@/hooks/useDataService";
import { FormDef } from "@/hooks/useFormDefs";
import { Text } from "@/components/sea-saw-design/text";
import { Button } from "@/components/sea-saw-design/button";

interface Contact {
  pk: string | number;
  full_name: string;
  email?: string;
}

interface ContactInputProps {
  def?: FormDef;
  value?: Contact[] | Contact;
  onChange?: (v: Contact[]) => void;
  multiple?: boolean;
}

export default function ContactInput({
  value,
  onChange,
  multiple = false,
}: ContactInputProps) {
  const { getViewSet } = useDataService();
  const contactViewSet = useMemo(() => getViewSet("contact"), [getViewSet]);
  const [isOpen, setIsOpen] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const entityType = "contact";

  // 初始化 value
  useEffect(() => {
    if (!value) return setSelectedContacts([]);
    setSelectedContacts(Array.isArray(value) ? value : [value]);
  }, [value]);

  // 加载联系人
  const fetchData = useCallback(
    async (keyword?: string) => {
      setLoading(true);
      try {
        const response = await contactViewSet.list({
          params: { page: 1, page_size: 20, search: keyword || "" },
        });
        const results: Contact[] = response.data.results.map((item: any) => ({
          pk: item.pk ?? item.id,
          full_name: item.full_name,
          email: item.email,
        }));
        setContacts(results);
      } finally {
        setLoading(false);
      }
    },
    [contactViewSet],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (keyword: string) => fetchData(keyword);

  const handleRemove = (pk: string | number) => {
    const newSelected = selectedContacts.filter((c) => c.pk !== pk);
    setSelectedContacts(newSelected);
    onChange?.(newSelected);
  };

  const handleConfirm = () => {
    onChange?.(selectedContacts);
    setIsOpen(false);
  };

  const handleSelectChange = (items: Contact[]) => {
    setSelectedContacts(multiple ? items : items.slice(-1));
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
      {/* 已选联系人 */}
      <Pressable
        className="border border-gray-300 rounded-md px-1.5 p-1 flex-row flex-wrap items-center"
        onPress={() => setIsOpen(true)}
      >
        {selectedContacts.length === 0 ? (
          <Text className="text-gray-400">{i18n.t("Select Contact")}</Text>
        ) : (
          selectedContacts.map((c) => (
            <View
              key={c.pk}
              className="flex-row items-center bg-gray-100 px-2 rounded mr-2"
            >
              <Text className="mr-1 text-sm">{c.full_name}</Text>
              <Pressable onPress={() => handleRemove(c.pk)}>
                <Text className="text-red-500 font-bold">×</Text>
              </Pressable>
            </View>
          ))
        )}
      </Pressable>

      {/* 弹窗选择器 */}
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
              idName="pk"
              dataSource={contacts}
              value={selectedContacts}
              multiple={multiple}
              onChange={handleSelectChange}
              onSearch={handleSearch}
              loading={loading} // 新增 loading
              renderItem={(item, selected, onToggle) => (
                <Pressable
                  onPress={onToggle}
                  className="flex-row items-center py-1 px-2 rounded-lg active:bg-gray-100"
                >
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

            <View className="flex-row mt-4 space-x-1 justify-end">
              <Button
                className="w-fit h-fit py-1"
                onPress={handleConfirm}
                disabled={loading}
              >
                <Text className="text-white">{i18n.t("Save")}</Text>
              </Button>
              <Button
                variant="outline"
                className="w-fit h-fit py-1 bg-white"
                onPress={() => setIsOpen(false)}
              >
                <Text>{i18n.t("Cancel")}</Text>
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export { ContactInput };
