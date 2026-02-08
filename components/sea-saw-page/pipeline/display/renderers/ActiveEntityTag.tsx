import { useMemo } from "react";
import { Tag, TagProps } from "antd";

interface ActiveEntityTagProps {
  def?: { choices?: Array<{ value: string; label: string }> };
  value: string;
  className?: string;
  style?: React.CSSProperties;
  tagProps?: Omit<TagProps, "color" | "children">;
}

// Unified active entity color mapping - shared across pipeline components
export const ACTIVE_ENTITY_COLOR_MAP: Record<string, string> = {
  none: "default",
  order: "blue",
  production: "orange",
  purchase: "purple",
  production_and_purchase: "volcano",
  outbound: "geekblue",
};

function ActiveEntityTag({
  def,
  value,
  className,
  style,
  tagProps,
}: ActiveEntityTagProps) {
  const entityLabelMap = useMemo(() => {
    if (!def?.choices) return {};
    return Object.fromEntries(
      def.choices.map(({ value, label }) => [value, label]),
    );
  }, [def?.choices]);

  return (
    <Tag
      color={ACTIVE_ENTITY_COLOR_MAP[value] ?? "default"}
      className={className}
      style={style}
      {...tagProps}
    >
      {entityLabelMap[value] ?? value}
    </Tag>
  );
}

export { ActiveEntityTag };
export default ActiveEntityTag;
