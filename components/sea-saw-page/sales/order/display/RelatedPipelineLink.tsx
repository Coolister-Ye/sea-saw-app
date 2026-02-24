import React from "react";
import { View } from "react-native";
import { Tag, Spin } from "antd";
import { EyeOutlined } from "@ant-design/icons";

const PIPELINE_STATUS_COLORS: Record<string, string> = {
  draft: "default",
  order_confirmed: "blue",
  in_purchase: "purple",
  purchase_completed: "cyan",
  in_production: "orange",
  production_completed: "lime",
  in_purchase_and_production: "orange",
  purchase_and_production_completed: "lime",
  in_outbound: "geekblue",
  outbound_completed: "purple",
  completed: "success",
  cancelled: "error",
  issue_reported: "warning",
};

interface RelatedPipelineLinkProps {
  value?: { pipeline_code?: string; status?: string } | null;
  loading?: boolean;
  onClick?: () => void;
}

export default function RelatedPipelineLink({
  value,
  loading = false,
  onClick,
}: RelatedPipelineLinkProps) {
  if (!value?.pipeline_code) return null;

  const statusColor = PIPELINE_STATUS_COLORS[value.status || ""] || "default";

  return (
    <Spin spinning={loading} size="small">
      <View
        className="inline-flex flex-row items-center gap-1.5 cursor-pointer group"
        // @ts-ignore - web onClick
        onClick={onClick}
      >
        <Tag
          color={statusColor}
          style={{ margin: 0 }}
          className="transition-all duration-200 group-hover:shadow-md group-hover:scale-105"
        >
          {value.pipeline_code}
        </Tag>
        <EyeOutlined
          className="text-gray-400 transition-all duration-200 group-hover:text-blue-500 group-hover:scale-110"
          style={{ fontSize: 14 }}
        />
      </View>
    </Spin>
  );
}
