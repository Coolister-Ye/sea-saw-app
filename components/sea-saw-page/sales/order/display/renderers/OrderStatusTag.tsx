import { useMemo } from "react";
import { Tag } from "antd";

/* ========================
 * Order Status Tag Renderer
 * ======================== */
interface OrderStatusTagProps {
  def?: any;
  value: string;
}

function OrderStatusTag({ def, value }: OrderStatusTagProps) {
  const statusColorMap: Record<string, string> = {
    draft: "default",
    order_confirmed: "blue",
    in_production: "processing",
    production_completed: "cyan",
    in_outbound: "geekblue",
    outbound_completed: "purple",
    completed: "success",
    cancelled: "error",
    issue_reported: "error",
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

export { OrderStatusTag };
export default OrderStatusTag;
