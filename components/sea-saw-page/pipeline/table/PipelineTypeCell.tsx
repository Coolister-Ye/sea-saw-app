import React from "react";
import type { CustomCellRendererProps } from "ag-grid-react";
import PipelineTypeTag from "@/components/sea-saw-page/pipeline/display/renderers/PipelineTypeTag";

function PipelineTypeCell(props: CustomCellRendererProps) {
  const value = props.value;
  const meta = props.context?.meta;

  if (!value) return null;

  return <PipelineTypeTag value={value} def={meta?.pipeline_type} />;
}

export default PipelineTypeCell;
export { PipelineTypeCell };
