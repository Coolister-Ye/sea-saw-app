import React, { useMemo } from "react";
import { Select } from "antd";
import type { SelectProps } from "antd";
import i18n from "@/locale/i18n";
import PurchaseOrderStatusTag from "@/components/sea-saw-page/procurement/purchase-order/display/renderers/PurchaseOrderStatusTag";

interface PurchaseOrderStatusSelectorProps {
  def?: { choices?: { value: string; label: string }[] };
  value?: string;
  onChange?: (value: string) => void;
}

export default function PurchaseOrderStatusSelector({
  def,
  value,
  onChange,
}: PurchaseOrderStatusSelectorProps) {
  const options = useMemo(() => {
    if (!def?.choices) return [];
    return def.choices.map((choice) => ({
      value: choice.value,
      label: choice.label,
    }));
  }, [def?.choices]);

  const optionRender: SelectProps["optionRender"] = (option) => (
    <PurchaseOrderStatusTag value={option.value as string} def={def} />
  );

  const labelRender: SelectProps["labelRender"] = (props) => (
    <PurchaseOrderStatusTag value={props.value as string} def={def} />
  );

  return (
    <Select
      value={value}
      onChange={onChange}
      options={options}
      optionRender={optionRender}
      labelRender={labelRender}
      style={{ width: "100%" }}
      placeholder={i18n.t("Select status")}
    />
  );
}
