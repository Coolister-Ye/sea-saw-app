import { useMemo } from "react";
import { Tag, TagProps } from "antd";

interface PipelineStatusTagProps {
  def?: { choices?: Array<{ value: string; label: string }> };
  value: string;
  className?: string;
  style?: React.CSSProperties;
  tagProps?: Omit<TagProps, "color" | "children">;
}

// Unified status color mapping - shared across pipeline components
export const STATUS_COLOR_MAP: Record<string, string> = {
  draft: "default",
  order_confirmed: "blue",
  in_purchase: "purple",
  purchase_completed: "cyan",
  in_production: "orange",
  production_completed: "lime",
  in_purchase_and_production: "orange",
  purchase_and_production_completed: "lime",
  in_outbound: "geekblue",
  outbound_completed: "purple",
  completed: "success",
  cancelled: "error",
  issue_reported: "warning",
};

function PipelineStatusTag({
  def,
  value,
  className,
  style,
  tagProps,
}: PipelineStatusTagProps) {
  const statusLabelMap = useMemo(() => {
    if (!def?.choices) return {};
    return Object.fromEntries(
      def.choices.map(({ value, label }) => [value, label])
    );
  }, [def?.choices]);

  return (
    <Tag
      color={STATUS_COLOR_MAP[value] ?? "default"}
      className={className}
      style={style}
      {...tagProps}
    >
      {statusLabelMap[value] ?? value}
    </Tag>
  );
}

export { PipelineStatusTag };
export default PipelineStatusTag;
