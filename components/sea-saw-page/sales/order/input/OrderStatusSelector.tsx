import React, { useMemo } from "react";
import { Select } from "antd";
import type { SelectProps } from "antd";
import OrderStatusTag from "@/components/sea-saw-page/sales/order/display/OrderStatusTag";

interface OrderStatusSelectorProps {
  def?: { choices?: { value: string; label: string }[] };
  value?: string;
  onChange?: (value: string) => void;
}

export default function OrderStatusSelector({
  def,
  value,
  onChange,
}: OrderStatusSelectorProps) {
  const options = useMemo(() => {
    if (!def?.choices) return [];
    return def.choices.map((choice) => ({
      value: choice.value,
      label: choice.label,
    }));
  }, [def?.choices]);

  const optionRender: SelectProps["optionRender"] = (option) => (
    <OrderStatusTag value={option.value as string} />
  );

  const labelRender: SelectProps["labelRender"] = (props) => (
    <OrderStatusTag value={props.value as string} />
  );

  return (
    <Select
      value={value}
      onChange={onChange}
      options={options}
      optionRender={optionRender}
      labelRender={labelRender}
      style={{ width: "100%" }}
      placeholder="Select status"
    />
  );
}
