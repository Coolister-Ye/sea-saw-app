import React, { useMemo } from "react";
import { View } from "react-native";
import { Popover, Tag } from "antd";
import { Text } from "@/components/sea-saw-design/text";

interface PipelineData {
  id?: number;
  pipeline_code?: string;
  status?: string;
  active_entity?: string;
  pipeline_type?: string;
}

interface FieldDef {
  label?: string;
  choices?: { value: string; label: string }[];
}

interface PipelinePopoverProps {
  value?: PipelineData | null;
  def?: {
    children?: {
      status?: FieldDef;
      active_entity?: FieldDef;
      pipeline_type?: FieldDef;
    };
  };
}

// Status color mapping for Ant Design Tag
const STATUS_TAG_COLORS: Record<string, string> = {
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

// Pipeline type colors
const PIPELINE_TYPE_COLORS: Record<string, string> = {
  production_flow: "cyan",
  purchase_flow: "purple",
  hybrid_flow: "magenta",
};

// Active entity colors
const ACTIVE_ENTITY_COLORS: Record<string, string> = {
  none: "default",
  order: "blue",
  production: "orange",
  purchase: "purple",
  production_and_purchase: "volcano",
  outbound: "geekblue",
};

export default function PipelinePopover({ value, def }: PipelinePopoverProps) {
  // Build choice label maps from def
  const choiceMaps = useMemo(() => {
    const buildMap = (choices?: { value: string; label: string }[]) =>
      choices
        ? Object.fromEntries(choices.map((c) => [c.value, c.label]))
        : {};

    return {
      status: buildMap(def?.children?.status?.choices),
      active_entity: buildMap(def?.children?.active_entity?.choices),
      pipeline_type: buildMap(def?.children?.pipeline_type?.choices),
    };
  }, [def]);

  // Field definitions with labels from backend
  const fields = useMemo(() => {
    const children = def?.children;
    return {
      status: {
        label: children?.status?.label ?? "Status",
        choices: choiceMaps.status,
        colors: STATUS_TAG_COLORS,
      },
      pipeline_type: {
        label: children?.pipeline_type?.label ?? "Type",
        choices: choiceMaps.pipeline_type,
        colors: PIPELINE_TYPE_COLORS,
      },
      active_entity: {
        label: children?.active_entity?.label ?? "Active Entity",
        choices: choiceMaps.active_entity,
        colors: ACTIVE_ENTITY_COLORS,
      },
    };
  }, [def, choiceMaps]);

  const content = useMemo(() => {
    if (!value) return null;

    const renderField = (
      fieldKey: keyof typeof fields,
      fieldValue?: string,
      skipValue?: string
    ) => {
      if (!fieldValue || fieldValue === skipValue) return null;

      const field = fields[fieldKey];
      const displayLabel = field.choices[fieldValue] || fieldValue;

      return (
        <View key={fieldKey} className="flex-row items-center gap-2">
          <Text className="text-xs text-gray-500 w-[80px] text-right">
            {field.label}
          </Text>
          <Tag color={field.colors[fieldValue] || "default"}>
            {displayLabel}
          </Tag>
        </View>
      );
    };

    return (
      <View className="p-3 w-[280px] space-y-3">
        {renderField("status", value.status)}
        {renderField("pipeline_type", value.pipeline_type)}
        {renderField("active_entity", value.active_entity, "none")}
      </View>
    );
  }, [value, fields]);

  if (!value || !value.pipeline_code) {
    return <Text className="text-gray-400">-</Text>;
  }

  const statusColor = STATUS_TAG_COLORS[value.status || ""] || "default";

  return (
    <Popover content={content} trigger="hover" mouseEnterDelay={0.15}>
      <Tag
        color={statusColor}
        style={{ cursor: "pointer", margin: 0 }}
        className="hover:opacity-80"
      >
        {value.pipeline_code}
      </Tag>
    </Popover>
  );
}

export { PipelinePopover };
