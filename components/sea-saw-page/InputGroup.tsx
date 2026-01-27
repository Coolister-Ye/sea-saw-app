import clsx from "clsx";
import { Text } from "@/components/sea-saw-design/text";
import { TextInput, View } from "react-native";
import SelectList, { SelectListProps } from "./SelectList";
import DatePickerInput from "./DatePickerInput";

export type InputGroupProps = Omit<SelectListProps, "variant"> & {
  variant?: "text-input" | "select-list" | "date-picker";
  label: string;
  containerClassName?: string;
  isMandatory?: boolean;
  error?: any;
};

export default function InputGroup({
  variant = "text-input",
  label,
  containerClassName,
  isMandatory = false,
  error,
  ...props
}: InputGroupProps) {
  const _className = clsx(
    "flex flex-row items-center w-full",
    containerClassName,
  );

  let variantContent;
  switch (variant) {
    case "text-input":
      variantContent = <TextInput {...props} />;
      break;
    case "select-list":
      variantContent = <SelectList {...props} />;
      break;
    case "date-picker":
      variantContent = <DatePickerInput {...props} />;
      break;
    default:
      variantContent = null;
  }

  return (
    <View>
      <View className={_className}>
        <Text className="text-sm font-medium mr-3 w-1/4 text-right">
          {label}
        </Text>
        <View className="flex-1 relative justify-center">
          {isMandatory && (
            <View className="absolute left-0 bg-error w-1 h-full rounded-l-md"></View>
          )}
          {variantContent}
        </View>
      </View>
      <Text
        variant="error"
        className="text-xs h-5 w-full text-right pr-2 drop-shadow-md"
      >
        {error}
      </Text>
    </View>
  );
}
