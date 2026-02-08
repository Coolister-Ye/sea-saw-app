import React, { useMemo } from "react";
import { Popover, Tag } from "antd";
import { QueueListIcon } from "react-native-heroicons/outline";

import { Text } from "@/components/sea-saw-design/text";
import { PopoverCard } from "@/components/sea-saw-page/base/popover";
import PipelineStatusTag, { STATUS_COLOR_MAP } from "./PipelineStatusTag";
import PipelineTypeTag from "./PipelineTypeTag";
import ActiveEntityTag from "./ActiveEntityTag";

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

export default function PipelinePopover({ value, def }: PipelinePopoverProps) {
  const content = useMemo(() => {
    if (!value) return null;

    return (
      <PopoverCard
        headerIcon={<QueueListIcon size={16} className="text-purple-600" />}
        headerTitle={value.pipeline_code || "Pipeline"}
        value={value}
        metaDef={def?.children}
        columnOrder={["status", "pipeline_type", "active_entity"]}
        colDef={{
          status: {
            render: (d, v) => (
              <PipelineStatusTag value={v} def={d} className="w-fit" />
            ),
          },
          pipeline_type: {
            render: (d, v) => (
              <PipelineTypeTag value={v} def={d} className="w-fit" />
            ),
          },
          active_entity: {
            render: (d, v) => (
              <ActiveEntityTag value={v} def={d} className="w-fit" />
            ),
          },
        }}
        widthClass="w-[280px]"
        iconBgClass="bg-purple-50"
        labelWidthClass="w-[80px] shrink-0"
      />
    );
  }, [value, def]);

  if (!value || !value.pipeline_code) {
    return <Text className="text-gray-400">-</Text>;
  }

  const statusColor = STATUS_COLOR_MAP[value.status || ""] || "default";

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
