import React, { useState, useMemo } from "react";
import i18n from '@/locale/i18n';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { debounce } from "lodash";

interface UserSelectorProps {
  idName?: string;
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
  loading?: boolean; // 新增可控 loading
}

export default function UserSelector({
  idName = "key",
  dataSource,
  value,
  onChange,
  onSearch,
  multiple = true,
  returnKeyOnly = false,
  renderItem,
  renderSelectedItem,
  loading = false,
}: UserSelectorProps) {
  const [search, setSearch] = useState("");

  // 判断是否被选中
  const isSelected = (id: string | number) =>
    returnKeyOnly
      ? value.includes(id)
      : value.some((v: any) => v[idName] === id);

  // 防抖搜索
  const debouncedSearch = useMemo(
    () =>
      debounce((t: string) => {
        onSearch?.(t);
      }, 500),
    [onSearch]
  );

  const handleTextChange = (text: string) => {
    setSearch(text);
    debouncedSearch(text);
  };

  // 更新选中值
  const updateValue = (items: any[]) => {
    if (returnKeyOnly) {
      onChange(items.map((i) => i[idName]));
    } else {
      onChange(items);
    }
  };

  // 切换选中状态
  const toggleSelect = (item: any) => {
    let selectedItems: any[];
    if (returnKeyOnly) {
      const currentItems = dataSource.filter((d) => value.includes(d[idName]));
      const exists = value.includes(item[idName]);
      selectedItems = exists
        ? currentItems.filter((v) => v[idName] !== item[idName])
        : multiple
        ? [...currentItems, item]
        : [item];
    } else {
      const exists = value.some((v: any) => v[idName] === item[idName]);
      selectedItems = exists
        ? value.filter((v: any) => v[idName] !== item[idName])
        : multiple
        ? [...value, item]
        : [item];
    }
    updateValue(selectedItems);
  };

  // 渲染选择框
  const renderSelector = (selected: boolean) => {
    return multiple ? (
      <View
        className={`w-5 h-5 mr-2 border rounded items-center justify-center ${
          selected ? "bg-blue-500 border-blue-500" : "border-gray-400"
        }`}
      >
        {selected && <Text className="text-white text-xs">✓</Text>}
      </View>
    ) : (
      <View
        className={`w-5 h-5 mr-2 rounded-full border items-center justify-center ${
          selected ? "border-blue-500" : "border-gray-400"
        }`}
      >
        {selected && <View className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
      </View>
    );
  };

  // 默认列表项
  const defaultRenderItem = (
    item: any,
    selected: boolean,
    onToggle: () => void
  ) => (
    <Pressable
      onPress={onToggle}
      className="flex-row items-center p-2 rounded active:bg-gray-100"
    >
      {renderSelector(selected)}
      <Text className="text-base font-medium">
        {item.full_name || item[idName]}
      </Text>
    </Pressable>
  );

  // 默认已选项
  const defaultRenderSelectedItem = (item: any, onRemove: () => void) => (
    <View className="flex-row items-center justify-between p-2">
      <Text className="text-base font-medium">
        {item.full_name || item[idName]}
      </Text>
      <Pressable onPress={onRemove}>
        <Text className="text-gray-400 text-lg">×</Text>
      </Pressable>
    </View>
  );

  const selectedData = returnKeyOnly
    ? dataSource.filter((d) => value.includes(d[idName]))
    : value;

  return (
    <View className="flex-row h-[500px] border border-gray-200 rounded overflow-hidden">
      {/* 左侧选择列表 */}
      <View className="flex-1 border-r border-gray-200 p-2">
        <TextInput
          placeholder={i18n.t("search")}
          value={search}
          onChangeText={handleTextChange}
          className="border border-gray-300 rounded px-3 py-2 mb-2 placeholder:text-gray-400"
        />

        {loading && <ActivityIndicator className="mt-5" />}

        <FlatList
          data={dataSource}
          keyExtractor={(item) => String(item[idName])}
          renderItem={({ item }) => {
            const selected = isSelected(item[idName]);
            const onToggle = () => toggleSelect(item);
            return (
              renderItem?.(item, selected, onToggle) ||
              defaultRenderItem(item, selected, onToggle)
            );
          }}
        />
      </View>

      {/* 右侧已选列表 */}
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
          keyExtractor={(item) => String(item[idName])}
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
