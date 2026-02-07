import React, { useMemo } from "react";
import { Tag } from "antd";
import type { CustomCellRendererProps } from "ag-grid-react";

function PipelineStatusCell(props: CustomCellRendererProps) {
  const value = props.value;
  const meta = props.context?.meta;
  const statusDef = meta?.status;

  const statusColorMap: Record<string, string> = {
    draft: "default",
    active: "blue",
    in_progress: "processing",
    on_hold: "warning",
    completed: "success",
    cancelled: "error",
    archived: "default",
  };

  // Build status label map from def.choices
  const statusLabelMap = useMemo(() => {
    if (!statusDef?.choices) return {};
    return Object.fromEntries(
      statusDef.choices.map((d: { value: any; label: any }) => [
        d.value,
        d.label,
      ]),
    );
  }, [statusDef?.choices]);

  if (!value) return null;

  return (
    <Tag color={statusColorMap[value] || "default"}>
      {statusLabelMap[value] || value}
    </Tag>
  );
}

export default PipelineStatusCell;
export { PipelineStatusCell };
