import { useMemo } from "react";
import { StyleProp, ViewStyle } from "react-native";
import Tag from "@/components/sea-saw-design/tag/Tag";

interface PipelineTypeTagProps {
  def?: { choices?: Array<{ value: string; label: string }> };
  value: string;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

// Unified pipeline type color mapping - shared across pipeline components
export const PIPELINE_TYPE_COLOR_MAP: Record<string, string> = {
  production_flow: "geekblue",
  purchase_flow: "green",
  hybrid_flow: "gold",
};

function PipelineTypeTag({ def, value, className, style }: PipelineTypeTagProps) {
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
    >
      {typeLabelMap[value] ?? value}
    </Tag>
  );
}

export { PipelineTypeTag };
export default PipelineTypeTag;
