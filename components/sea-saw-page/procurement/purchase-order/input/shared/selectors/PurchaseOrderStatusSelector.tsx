import React from "react";
import { Select } from "antd";
import { FormDef } from "@/hooks/useFormDefs";

interface PurchaseOrderStatusSelectorProps {
  def: FormDef;
  value?: string;
  onChange?: (value: string) => void;
}

export default function PurchaseOrderStatusSelector({
  def,
  value,
  onChange,
}: PurchaseOrderStatusSelectorProps) {
  const options = def.choices?.map((choice: any) => ({
    label: choice.display_name,
    value: choice.value,
  })) || [];

  return (
    <Select
      value={value}
      onChange={onChange}
      options={options}
      placeholder={def.help_text || `Select ${def.label}`}
      style={{ width: "100%" }}
    />
  );
}
