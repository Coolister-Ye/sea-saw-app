import React, { useMemo } from "react";
import { Select, Space } from "antd";
import type { SelectProps } from "antd";
import ProductionStatusTag from "@/components/sea-saw-page/crm/from/display/production/renderers/ProductionStatusTag";

interface ProductionOrderStatusSelectorProps {
  def?: any;
  value?: string;
  onChange?: (value: string) => void;
}

export default function ProductionOrderStatusSelector({
  def,
  value,
  onChange,
}: ProductionOrderStatusSelectorProps) {
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
      <ProductionStatusTag def={def} value={option.value} />
    </Space>
  );

  /* ========================
   * Custom Label Renderer for Selected Value (Single Select)
   * ======================== */
  const labelRender: SelectProps["labelRender"] = (props) => {
    const { value: labelValue } = props;
    return <ProductionStatusTag def={def} value={labelValue as string} />;
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
