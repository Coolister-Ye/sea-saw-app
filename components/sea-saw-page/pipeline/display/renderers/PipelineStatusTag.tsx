import { useMemo } from "react";
import { Tag } from "antd";

interface PipelineStatusTagProps {
  def?: { choices?: Array<{ value: string; label: string }> };
  value: string;
}

const STATUS_COLOR_MAP: Record<string, string> = {
  draft: "default",
  order_confirmed: "blue",
  in_purchase: "processing",
  purchase_completed: "cyan",
  in_production: "processing",
  production_completed: "cyan",
  in_purchase_and_production: "processing",
  purchase_and_production_completed: "cyan",
  in_outbound: "orange",
  outbound_completed: "lime",
  completed: "success",
  cancelled: "error",
  issue_reported: "warning",
};

function PipelineStatusTag({ def, value }: PipelineStatusTagProps) {
  const statusLabelMap = useMemo(() => {
    if (!def?.choices) return {};
    return Object.fromEntries(
      def.choices.map(({ value, label }) => [value, label])
    );
  }, [def?.choices]);

  return (
    <Tag color={STATUS_COLOR_MAP[value] ?? "default"}>
      {statusLabelMap[value] ?? value}
    </Tag>
  );
}

export { PipelineStatusTag };
export default PipelineStatusTag;
