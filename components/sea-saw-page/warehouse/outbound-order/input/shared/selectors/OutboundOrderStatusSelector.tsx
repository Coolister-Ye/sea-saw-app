import React, { useMemo } from "react";
import { Select, Space } from "antd";
import type { SelectProps } from "antd";
import OutboundStatusTag from "../../../display/renderers/OutboundStatusTag";

interface OutboundOrderStatusSelectorProps {
  def: any;
  value?: string;
  onChange?: (value: string) => void;
}

export default function OutboundOrderStatusSelector({
  def,
  value,
  onChange,
}: OutboundOrderStatusSelectorProps) {
  const options = useMemo(() => {
    if (!def?.choices) return [];
    return def.choices.map((choice: { value: string; label: string }) => ({
      value: choice.value,
      label: choice.label,
    }));
  }, [def?.choices]);

  const optionRender = (option: any) => (
    <Space>
      <OutboundStatusTag def={def} value={option.value} />
    </Space>
  );

  const labelRender: SelectProps["labelRender"] = (props) => {
    const { value: labelValue } = props;
    return <OutboundStatusTag def={def} value={labelValue as string} />;
  };

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
