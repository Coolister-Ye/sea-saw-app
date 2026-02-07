import { Tag } from "antd";
import { useMemo } from "react";

/* ========================
 * Status Tag Renderer
 * ======================== */
function ProductionStatusTag({ value, def }: { value: string; def?: any }) {
  const statusColorMap: Record<string, string> = {
    draft: "default",
    planned: "blue",
    in_progress: "processing",
    paused: "warning",
    finished: "success",
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

export { ProductionStatusTag };
export default ProductionStatusTag;
