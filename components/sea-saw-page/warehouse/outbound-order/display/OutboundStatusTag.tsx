import { Tag } from "antd";
import { useStatusLabelMap } from "@/hooks/useStatusLabelMap";

/* ========================
 * Outbound Status Tag Renderer
 * ======================== */
interface OutboundStatusTagProps {
  def?: { choices?: Array<{ value: string; label: string }> };
  value: string;
  className?: string;
}

const STATUS_COLOR: Record<string, string> = {
  draft: "default",
  packed: "blue",
  shipped: "processing",
  custom_cleared: "cyan",
  arrived: "purple",
  completed: "success",
};

function OutboundStatusTag({ def, value, className }: OutboundStatusTagProps) {
  const statusLabelMap = useStatusLabelMap(def);

  return (
    <Tag color={STATUS_COLOR[value] ?? "default"} className={className}>
      {statusLabelMap[value] ?? value}
    </Tag>
  );
}

export { OutboundStatusTag };
export default OutboundStatusTag;
