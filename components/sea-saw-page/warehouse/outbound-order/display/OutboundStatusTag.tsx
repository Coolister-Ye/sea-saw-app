import Tag from "@/components/sea-saw-design/tag";
import { useStatusLabelMap } from "@/hooks/useStatusLabelMap";

/* ========================
 * Outbound Status Tag Renderer
 * ======================== */
interface OutboundStatusTagProps {
  def?: { choices?: { value: string; label: string }[] };
  value: string;
  className?: string;
}

const STATUS_COLOR: Record<string, string> = {
  draft: "default",
  active: "processing",
  completed: "success",
  cancelled: "error",
  issue_reported: "warning",
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
