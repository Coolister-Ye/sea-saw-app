import { ReactNode, useState } from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  Text,
  FlatList,
  Pressable,
} from "react-native";
import clsx from "clsx";
import { ChevronDownIcon } from "react-native-heroicons/mini";

type OptionType = { value: string; label: string | ReactNode };

type SelectProps = {
  options: OptionType[];
  onChange?: (value: string) => void;
  defaultValue?: OptionType;
  placeholder?: string;
  className?: string;
  variant?: "outlined" | "filled" | "borderless" | "underlined";
};

const Select = ({
  options,
  onChange,
  defaultValue,
  placeholder = "Press to select",
  className,
  variant = "outlined",
}: SelectProps) => {
  const [selectedVal, setSelectedVal] = useState<OptionType | undefined>(
    defaultValue
  );
  const [modalVisible, setModalVisible] = useState(false);

  const handleValueChange = (option: OptionType) => {
    setSelectedVal(option);
    setModalVisible(false);
    onChange?.(option.value);
  };

  const variantStyles = clsx(
    "p-3 rounded-md flex flex-row items-center",
    {
      "border-blue-300": modalVisible,
      "border border-gray-300": variant === "outlined",
      "bg-gray-100": variant === "filled",
      "border-b border-gray-300": variant === "underlined",
      "border-none": variant === "borderless",
    },
    className
  );

  return (
    <View>
      <Pressable
        onPress={() => setModalVisible(true)}
        className={variantStyles}
      >
        <Text className="text-base text-gray-800">
          {selectedVal ? selectedVal.label : placeholder}
        </Text>
        <ChevronDownIcon color="#d1d5db" />
      </Pressable>

      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View className="bg-white rounded-lg py-3 max-h-60">
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  className="p-4 border-b border-gray-200"
                  onPress={() => handleValueChange(item)}
                >
                  {typeof item.label === "string" ? (
                    <Text className="text-base">{item.label}</Text>
                  ) : (
                    item.label
                  )}
                </Pressable>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default Select;
