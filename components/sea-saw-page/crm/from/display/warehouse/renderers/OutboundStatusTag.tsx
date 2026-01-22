import { useMemo } from "react";
import { Tag } from "antd";

/* ========================
 * Outbound Status Tag Renderer
 * ======================== */
interface OutboundStatusTagProps {
  def?: any;
  value: string;
}

function OutboundStatusTag({ def, value }: OutboundStatusTagProps) {
  const statusColorMap: Record<string, string> = {
    draft: "default",
    packed: "blue",
    shipped: "processing",
    custom_cleared: "cyan",
    arrived: "purple",
    completed: "success",
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

export { OutboundStatusTag };
export default OutboundStatusTag;
