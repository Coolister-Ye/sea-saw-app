import { Select as AntdSelect } from "antd";
import { Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useState } from "react";

type SelectProps = {
  onChange?: (value: any) => void;
  options: { label: string; value: string }[];
} & React.ComponentProps<typeof AntdSelect>;

export default function Select(props: SelectProps) {
  const [selectedVal, setSelectedVal] = useState();
  const handleValueChange = (value: any) => {
    setSelectedVal(value);
    props.onChange?.(value);
  };

  if (Platform.OS === "web") {
    return <AntdSelect {...props} />;
  }

  return (
    <Picker
      selectedValue={selectedVal}
      onValueChange={(value, _) => handleValueChange(value)}
    >
      {props.options.map((option) => (
        <Picker.Item
          key={option.value}
          label={option.label}
          value={option.value}
        />
      ))}
    </Picker>
  );
}
