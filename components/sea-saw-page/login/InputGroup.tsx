import clsx from "clsx";
import { View } from "react-native";
import { SelectListProps } from "../SelectList";
import TextInput from "@/components/themed/TextInput";
import Text from "@/components/themed/Text";
import exp from "constants";

type InputGroupProps = Omit<SelectListProps, "variant"> & {
  variant?: "text-input" | "select-list" | "date-picker";
  label: string;
  containerClassName?: string;
  isMandatory?: boolean;
  error?: any;
};

function InputGroup({
  variant = "text-input",
  label,
  containerClassName,
  isMandatory = false,
  error = null,
  ...props
}: InputGroupProps) {
  const _className = clsx("flex w-full", containerClassName);

  return (
    <View>
      <View className={_className}>
        {/* Render the label with an asterisk if it's mandatory */}
        <Text
          className="block text-sm font-medium leading-6 mb-2"
          variant="primary"
        >
          {label}
          {isMandatory && <Text className="text-red-500 px-1">*</Text>}
        </Text>
        <TextInput {...props} />
      </View>

      <Text variant="error" className="text-xs h-5 w-full text-right pr-2 mt-1">
        {error}
      </Text>
    </View>
  );
}

export default InputGroup;
export type { InputGroupProps };
export { InputGroup };
