import { InputNumber, Space } from "antd";
import { useState } from "react";
import type { CSSProperties } from "react";

interface NumberRangeValue {
  min?: number;
  max?: number;
}

interface NumberRangeInputProps {
  id?: string;
  value?: NumberRangeValue;
  onChange?: (value: NumberRangeValue) => void;
  className?: string;
  style?: CSSProperties;
}

function NumberRangeInput(props: NumberRangeInputProps) {
  const { id, value = {}, onChange, className, style } = props;
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
    <Space.Compact block className={className} style={style}>
      <InputNumber
        style={{ width: "50%" }}
        value={value.min}
        onChange={onMinChange}
        placeholder=">="
      />
      <InputNumber
        style={{ width: "50%" }}
        value={value.max}
        onChange={onMaxChange}
        placeholder="<="
      />
    </Space.Compact>
  );
}

export { NumberRangeInput };
