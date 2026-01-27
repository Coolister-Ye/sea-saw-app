import { View, Text } from "react-native";

/**
 * Formats raw options into a structure compatible with selection components.
 *
 * @param rawOptions - Array of objects containing selectable options.
 * @param valueKey - The key used to extract the display value from each object.
 * @returns An array of formatted options with `value` and `label`.
 */
export const formatOptions = <T extends Record<string, any>>(
  rawOptions: T[],
  valueKey: keyof T
) => {
  return rawOptions.map((option) => ({
    value: JSON.stringify({ value: option[valueKey], pk: option.pk }),
    label: <LookupOption pk={option.pk} value={String(option[valueKey])} />,
  }));
};

/**
 * A UI component that displays an option with a rounded PK indicator.
 *
 * @param pk - The unique identifier for the option.
 * @param value - The display text for the option.
 * @returns A React Native View component.
 */
const LookupOption = ({
  pk,
  value,
}: {
  pk: string | number;
  value: string;
}) => {
  return (
    <View className="flex flex-row items-center space-x-3 p-2">
      {/* Circular PK indicator */}
      <View className="w-3 h-3 rounded-full bg-zinc-200 flex items-center justify-center shadow-md">
        <Text className="text-xs font-semibold text-green-800">{pk}</Text>
      </View>

      {/* Option label text */}
      <Text className="text-gray-800">{value}</Text>
    </View>
  );
};
