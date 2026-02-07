import { useMemo } from "react";
import { Tag } from "antd";

/* ========================
 * Pipeline Status Tag Renderer
 * ======================== */
interface PipelineStatusTagProps {
  def?: any;
  value: string;
}

function PipelineStatusTag({ def, value }: PipelineStatusTagProps) {
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
    if (!def?.choices) return {};
    return Object.fromEntries(
      def.choices.map((d: { value: any; label: any }) => [d.value, d.label])
    );
  }, [def?.choices]);

  return (
    <Tag color={statusColorMap[value] || "default"}>
      {statusLabelMap[value] || value}
    </Tag>
  );
}

export { PipelineStatusTag };
export default PipelineStatusTag;
