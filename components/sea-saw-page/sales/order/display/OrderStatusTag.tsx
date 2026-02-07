import { Tag } from "antd";
import i18n from "@/locale/i18n";

interface OrderStatusTagProps {
  value: string;
}

const STATUS_COLOR: Record<string, string> = {
  draft: "default",
  active: "processing",
  completed: "success",
  cancelled: "error",
  issue_reported: "warning",
};

function OrderStatusTag({ value }: OrderStatusTagProps) {
  return (
    <Tag color={STATUS_COLOR[value] ?? "default"}>{i18n.t(value) || value}</Tag>
  );
}

export { OrderStatusTag };
export default OrderStatusTag;
