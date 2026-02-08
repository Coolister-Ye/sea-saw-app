import { useMemo } from "react";
import { Tag, TagProps } from "antd";

interface PipelineTypeTagProps {
  def?: { choices?: Array<{ value: string; label: string }> };
  value: string;
  className?: string;
  style?: React.CSSProperties;
  tagProps?: Omit<TagProps, "color" | "children">;
}

// Unified pipeline type color mapping - shared across pipeline components
export const PIPELINE_TYPE_COLOR_MAP: Record<string, string> = {
  production_flow: "cyan",
  purchase_flow: "purple",
  hybrid_flow: "magenta",
};

function PipelineTypeTag({
  def,
  value,
  className,
  style,
  tagProps,
}: PipelineTypeTagProps) {
  const typeLabelMap = useMemo(() => {
    if (!def?.choices) return {};
    return Object.fromEntries(
      def.choices.map(({ value, label }) => [value, label])
    );
  }, [def?.choices]);

  return (
    <Tag
      color={PIPELINE_TYPE_COLOR_MAP[value] ?? "default"}
      className={className}
      style={style}
      {...tagProps}
    >
      {typeLabelMap[value] ?? value}
    </Tag>
  );
}

export { PipelineTypeTag };
export default PipelineTypeTag;
