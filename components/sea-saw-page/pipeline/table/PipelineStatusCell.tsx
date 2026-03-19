import React from "react";
import type { CustomCellRendererProps } from "ag-grid-react";
import PipelineStatusTag from "@/components/sea-saw-page/pipeline/display/renderers/PipelineStatusTag";

function PipelineStatusCell(props: CustomCellRendererProps) {
  const value = props.value;
  const meta = props.context?.meta;

  if (!value) return null;

  return <PipelineStatusTag value={value} def={meta?.status} />;
}

export default PipelineStatusCell;
export { PipelineStatusCell };
