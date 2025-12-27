import React, { useMemo } from "react";
import type { CustomCellRendererProps } from "ag-grid-react";
import clsx from "clsx";

type Choice = {
  value: string;
  label: string;
};

const statusClassMap: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  order_confirmed: "bg-blue-100 text-blue-700",
  in_production: "bg-yellow-100 text-yellow-800",
  production_completed: "bg-emerald-100 text-emerald-700",
  in_outbound: "bg-indigo-100 text-indigo-700",
  outbound_completed: "bg-green-100 text-green-700",
  completed: "bg-green-600 text-white",
  cancelled: "bg-red-100 text-red-700",
  issue_reported: "bg-orange-100 text-orange-700",
};

function OrderStatusRender(props: CustomCellRendererProps) {
  const statusValue = props.value as string | null;

  const statusDef = props.context?.meta?.status;
  const choices: Choice[] = statusDef?.choices ?? [];

  // value -> label 映射（只在 choices 变化时计算）
  const valueToLabel = useMemo(() => {
    return Object.fromEntries(choices.map((c) => [c.value, c.label])) as Record<
      string,
      string
    >;
  }, [choices]);

  if (!statusValue) {
    return <span className="text-muted-foreground">—</span>;
  }

  const label = valueToLabel[statusValue] ?? statusValue;

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium",
        statusClassMap[statusValue] ?? "bg-gray-100 text-gray-700"
      )}
    >
      {label}
    </span>
  );
}

export default OrderStatusRender;
export { OrderStatusRender };
