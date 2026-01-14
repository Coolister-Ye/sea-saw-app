import React, { useMemo } from "react";
import { Select, Space } from "antd";
import type { SelectProps } from "antd";
import OrderStatusTag from "@/components/sea-saw-page/crm/from/display/order/renderers/OrderStatusTag";

interface OrderStatusSelectorProps {
  def?: any;
  value?: string;
  onChange?: (value: string) => void;
}

export default function OrderStatusSelector({
  def,
  value,
  onChange,
}: OrderStatusSelectorProps) {
  /* ========================
   * Build Options from Definition
   * ======================== */
  const options = useMemo(() => {
    if (!def?.choices) return [];
    return def.choices.map((choice: { value: string; label: string }) => ({
      value: choice.value,
      label: choice.label,
    }));
  }, [def?.choices]);

  /* ========================
   * Custom Option Renderer
   * ======================== */
  const optionRender = (option: any) => (
    <Space>
      <OrderStatusTag def={def} value={option.value} />
    </Space>
  );

  /* ========================
   * Custom Label Renderer for Selected Value (Single Select)
   * ======================== */
  const labelRender: SelectProps["labelRender"] = (props) => {
    const { value: labelValue } = props;
    return <OrderStatusTag def={def} value={labelValue as string} />;
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
