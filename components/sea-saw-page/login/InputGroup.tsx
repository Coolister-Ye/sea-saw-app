import { View } from "react-native";
import { Input, InputProps } from "@/components/sea-saw-design/input";
import { Text } from "@/components/sea-saw-design/text";
import { cn } from "@/components/sea-saw-design/utils";

type InputGroupProps = InputProps & {
  label: string;
  containerClassName?: string;
  isMandatory?: boolean;
  /** 支持 Formik 的 touched && errors 模式 */
  error?: string | false | null;
};

function InputGroup({
  label,
  containerClassName,
  isMandatory = false,
  error = null,
  status,
  ...props
}: InputGroupProps) {
  return (
    <View className={cn("flex w-full", containerClassName)}>
      <Text className="block text-sm font-medium leading-6 mb-2 text-slate-700 dark:text-slate-300">
        {label}
        {isMandatory && <Text className="text-red-500 px-1">*</Text>}
      </Text>
      <Input
        {...props}
        status={error ? "error" : status}
        variant="outlined"
        size="large"
      />
      <Text className="text-xs h-5 w-full text-left mt-1.5 text-red-500 dark:text-red-400">
        {error || null}
      </Text>
    </View>
  );
}

export default InputGroup;
export type { InputGroupProps };
export { InputGroup };
