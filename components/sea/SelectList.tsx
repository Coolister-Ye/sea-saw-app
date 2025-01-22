import { Pressable, ScrollView, View } from "react-native";
import Dropdown, { DropdownProps } from "./Dropdown";
import Text from "../themed/Text";
import { useState } from "react";
import { CheckIcon } from "@heroicons/react/20/solid";

export type SelectListProps = DropdownProps & {
  options?: any[];
  selected?: any;
  onSelected?: React.Dispatch<any>;
};

export default function SelectList({
  options,
  selected,
  onSelected,
  ...rest
}: SelectListProps) {
  return (
    <Dropdown {...rest} value={selected.value}>
      <ScrollView>
        {options && options.map((option) => (
          <Pressable
            key={option.id}
            onPress={() => {onSelected && onSelected(option)}}
            className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 hover:bg-indigo-600"
          >
            <Text className="block truncate font-normal group-hover:font-semibold group-hover:text-white">
              {option.value}
            </Text>
            <View className="absolute inset-y-0 right-0 flex items-center justify-center pr-4 text-indigo-600 group-hover:text-white">
              {option.id === selected.id && (
                <CheckIcon aria-hidden="true" className="h-5 w-5" />
              )}
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </Dropdown>
  );
}
