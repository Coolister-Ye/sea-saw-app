import { Tag } from "antd";
import { useStatusLabelMap } from "@/hooks/useStatusLabelMap";

interface PaymentTypeTagProps {
  value: string;
  def?: { choices?: Array<{ value: string; label: string }> };
  className?: string;
}

const PAYMENT_TYPE_COLOR: Record<string, string> = {
  deposit: "blue",
  progress: "cyan",
  final: "green",
  refund: "orange",
};

function PaymentTypeTag({ value, def, className }: PaymentTypeTagProps) {
  const statusLabelMap = useStatusLabelMap(def);

  return (
    <Tag color={PAYMENT_TYPE_COLOR[value] ?? "default"} className={className}>
      {statusLabelMap[value] ?? value}
    </Tag>
  );
}

export { PaymentTypeTag };
export default PaymentTypeTag;
