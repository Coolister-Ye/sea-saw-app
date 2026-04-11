import React from "react";
import type { CustomCellRendererProps } from "ag-grid-react";
import PipelineTypeTag from "@/components/sea-saw-page/pipeline/display/renderers/PipelineTypeTag";

function PipelineTypeCell(props: CustomCellRendererProps) {
  const value = props.value;
  const meta = props.context?.meta;

  if (!value) return null;

  return (
    <div className="flex h-full items-center">
      <PipelineTypeTag value={value} def={meta?.pipeline_type} />
    </div>
  );
}

export default PipelineTypeCell;
export { PipelineTypeCell };
