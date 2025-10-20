import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useLocale } from "@/context/Locale";
import { debounce } from "lodash";

interface UserSelectorProps {
  dataSource: any[];
  value: any[];
  onChange: (items: any[]) => void;
  onSearch?: (keyword: string) => void;
  multiple?: boolean;
  returnKeyOnly?: boolean;
  renderItem?: (
    item: any,
    selected: boolean,
    onToggle: () => void
  ) => React.ReactElement | null;
  renderSelectedItem?: (
    item: any,
    onRemove: () => void
  ) => React.ReactElement | null;
}

export default function UserSelector({
  dataSource,
  value,
  onChange,
  onSearch,
  multiple = true,
  returnKeyOnly = false,
  renderItem,
  renderSelectedItem,
}: UserSelectorProps) {
  const { i18n } = useLocale();
  const [search, setSearch] = useState("");
  const [isLoading, setLoading] = useState(false);

  const isSelected = (key: string | number) =>
    returnKeyOnly ? value.includes(key) : value.some((v: any) => v.key === key);

  const debouncedSearch = useMemo(
    () =>
      debounce(async (t: string) => {
        if (onSearch) {
          setLoading(true);
          await onSearch(t);
          setLoading(false);
        }
      }, 500),
    [onSearch]
  );

  const handleTextChange = (text: string) => {
    setSearch(text);
    setLoading(true);
    debouncedSearch(text);
    setLoading(false);
  };

  const updateValue = (items: any[]) => {
    if (returnKeyOnly) {
      onChange(items.map((i) => i.key));
    } else {
      onChange(items);
    }
  };

  const toggleSelect = (item: any) => {
    let selectedItems: any[];
    if (returnKeyOnly) {
      const currentItems = dataSource.filter((d) => value.includes(d.key));
      const exists = value.includes(item.key);
      selectedItems = exists
        ? currentItems.filter((v) => v.key !== item.key)
        : multiple
        ? [...currentItems, item]
        : [item];
    } else {
      const exists = value.some((v: any) => v.key === item.key);
      selectedItems = exists
        ? value.filter((v: any) => v.key !== item.key)
        : multiple
        ? [...value, item]
        : [item];
    }
    updateValue(selectedItems);
  };

  const renderSelector = (selected: boolean): React.ReactElement => {
    if (multiple) {
      return (
        <View
          className={`w-5 h-5 mr-2 border rounded-md items-center justify-center ${
            selected ? "bg-blue-500 border-blue-500" : "border-gray-400"
          }`}
        >
          {selected && <Text className="text-white text-xs">✓</Text>}
        </View>
      );
    } else {
      return (
        <View
          className={`w-5 h-5 mr-2 rounded-full border items-center justify-center ${
            selected ? "border-blue-500" : "border-gray-400"
          }`}
        >
          {selected && (
            <View className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          )}
        </View>
      );
    }
  };

  const defaultRenderItem = (
    item: any,
    selected: boolean,
    onToggle: () => void
  ): React.ReactElement => (
    <Pressable
      onPress={onToggle}
      className="flex-row items-center p-2 rounded-lg active:bg-gray-100"
    >
      {renderSelector(selected)}
      <Text className="text-base font-medium">
        {item.full_name || item.key}
      </Text>
    </Pressable>
  );

  const defaultRenderSelectedItem = (
    item: any,
    onRemove: () => void
  ): React.ReactElement => (
    <View className="flex-row items-center justify-between p-2">
      <Text className="text-base font-medium">
        {item.full_name || item.key}
      </Text>
      <Pressable onPress={onRemove}>
        <Text className="text-gray-400 text-lg">×</Text>
      </Pressable>
    </View>
  );

  const selectedData = returnKeyOnly
    ? dataSource.filter((d) => value.includes(d.key))
    : value;

  return (
    <View className="flex-row h-[500px] border border-gray-200 rounded-xl overflow-hidden">
      {/* 左边选择列表 */}
      <View className="flex-1 border-r border-gray-200 p-2">
        <TextInput
          placeholder={i18n.t("search")}
          value={search}
          onChangeText={setSearch}
          onEndEditing={(e) => handleTextChange(e.nativeEvent.text)}
          className="border border-gray-300 rounded-lg px-3 py-2 mb-2"
        />

        {/* Loading spinner */}
        {isLoading && (
          <View className="flex-row justify-center my-2">
            <ActivityIndicator size="small" color="#1890ff" />
          </View>
        )}

        <FlatList
          data={dataSource}
          keyExtractor={(item) => String(item.key)}
          renderItem={({ item }) => {
            const selected = isSelected(item.key);
            const onToggle = () => toggleSelect(item);
            return (
              renderItem?.(item, selected, onToggle) ||
              defaultRenderItem(item, selected, onToggle)
            );
          }}
        />
      </View>

      {/* 右边已选列表 */}
      <View className="flex-1 p-2">
        <View className="flex-row justify-between items-center mb-2">
          <Text>
            {i18n.t("selected")}: {selectedData.length}
          </Text>
          <Pressable onPress={() => updateValue([])}>
            <Text className="text-blue-500">{i18n.t("clear")}</Text>
          </Pressable>
        </View>
        <FlatList
          data={selectedData}
          keyExtractor={(item) => String(item.key)}
          renderItem={({ item }) => {
            const onRemove = () => toggleSelect(item);
            return (
              renderSelectedItem?.(item, onRemove) ||
              defaultRenderSelectedItem(item, onRemove)
            );
          }}
        />
      </View>
    </View>
  );
}
