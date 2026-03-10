import { Tag } from "antd";
import { useStatusLabelMap } from "@/hooks/useStatusLabelMap";

interface OrderStatusTagProps {
  value: string;
  def?: { choices?: { value: string; label: string }[] };
  className?: string;
}

const STATUS_COLOR: Record<string, string> = {
  draft: "default",
  confirmed: "processing",
  cancelled: "error",
};

function OrderStatusTag({ value, def, className }: OrderStatusTagProps) {
  const statusLabelMap = useStatusLabelMap(def);

  return (
    <Tag color={STATUS_COLOR[value] ?? "default"} className={className}>
      {statusLabelMap[value] ?? value}
    </Tag>
  );
}

export { OrderStatusTag };
export default OrderStatusTag;
