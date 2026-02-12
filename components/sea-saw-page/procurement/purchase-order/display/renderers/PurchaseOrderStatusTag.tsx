import { Tag } from "antd";
import { useStatusLabelMap } from "@/hooks/useStatusLabelMap";

interface PurchaseOrderStatusTagProps {
  value: string;
  def?: { choices?: Array<{ value: string; label: string }> };
  className?: string;
}

const STATUS_COLOR: Record<string, string> = {
  draft: "default",
  ordered: "processing",
  in_transit: "warning",
  received: "purple",
  completed: "success",
  cancelled: "error",
};

/* ========================
 * Status Tag Renderer
 * ======================== */
function PurchaseOrderStatusTag({
  value,
  def,
  className,
}: PurchaseOrderStatusTagProps) {
  const statusLabelMap = useStatusLabelMap(def);

  return (
    <Tag color={STATUS_COLOR[value] ?? "default"} className={className}>
      {statusLabelMap[value] ?? value}
    </Tag>
  );
}

export { PurchaseOrderStatusTag };
export default PurchaseOrderStatusTag;
