import { InputNumber } from "antd";
import { useState } from "react";
import { View, ViewProps } from "react-native";

interface NumberRangeValue {
  min?: number;
  max?: number;
}

interface NumberRangeInputProps extends ViewProps {
  id?: string;
  value?: NumberRangeValue;
  onChange?: (value: NumberRangeValue) => void;
}

function NumberRangeInput(props: NumberRangeInputProps) {
  const { id, value = {}, onChange, className } = props;
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(0);

  const triggerChange = (changeValue: NumberRangeValue) => {
    onChange?.({ min, max, ...value, ...changeValue });
  };

  const onMinChange = (val: any) => {
    setMin(val);
    triggerChange({ min: val });
  };

  const onMaxChange = (val: any) => {
    setMax(val);
    triggerChange({ max: val });
  };

  return (
    <View className={`flex flex-row ${className}`}>
      <InputNumber value={value.min} onChange={onMinChange} placeholder=">=" />
      <InputNumber value={value.max} onChange={onMaxChange} placeholder="<=" />
    </View>
  );
}

export { NumberRangeInput };
