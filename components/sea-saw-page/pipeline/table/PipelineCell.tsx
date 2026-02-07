import React from "react";
import type { CustomCellRendererProps } from "ag-grid-react";
import PipelinePopover from "@/components/sea-saw-page/pipeline/display/renderers/PipelinePopover";

function PipelineCell(props: CustomCellRendererProps) {
  const value = props.value ?? {};
  const meta: any = props.context?.meta ?? {};
  const def = meta.related_pipeline;

  return <PipelinePopover value={value} def={def} />;
}

export default PipelineCell;
export { PipelineCell };
