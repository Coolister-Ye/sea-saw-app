import React, { useMemo } from "react";
import { Popover, Tag } from "antd";
import { QueueListIcon } from "react-native-heroicons/outline";

import { Text } from "@/components/sea-saw-design/text";
import { View } from "@/components/sea-saw-design/view";
import { PopoverCard } from "@/components/sea-saw-page/base/popover";
import PipelineStatusTag, { STATUS_COLOR_MAP } from "./PipelineStatusTag";
import PipelineTypeTag from "./PipelineTypeTag";
import ActiveEntityTag from "./ActiveEntityTag";
import {
  PipelineTimeline,
  type PipelineTimestamps,
} from "./PipelineTimeline";

interface PipelineData {
  id?: number;
  pipeline_code?: string;
  status?: string;
  active_entity?: string;
  pipeline_type?: string;
  // Stage timestamps
  confirmed_at?: string | null;
  in_purchase_at?: string | null;
  purchase_completed_at?: string | null;
  in_production_at?: string | null;
  production_completed_at?: string | null;
  in_purchase_and_production_at?: string | null;
  purchase_and_production_completed_at?: string | null;
  in_outbound_at?: string | null;
  outbound_completed_at?: string | null;
  completed_at?: string | null;
  cancelled_at?: string | null;
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

    const timestamps: PipelineTimestamps = {
      confirmed_at: value.confirmed_at,
      in_purchase_at: value.in_purchase_at,
      purchase_completed_at: value.purchase_completed_at,
      in_production_at: value.in_production_at,
      production_completed_at: value.production_completed_at,
      in_purchase_and_production_at: value.in_purchase_and_production_at,
      purchase_and_production_completed_at: value.purchase_and_production_completed_at,
      in_outbound_at: value.in_outbound_at,
      outbound_completed_at: value.outbound_completed_at,
      completed_at: value.completed_at,
      cancelled_at: value.cancelled_at,
    };

    return (
      <View>
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
          paddingClass="px-3 pt-3 pb-2"
          iconBgClass="bg-purple-50"
          labelWidthClass="w-[80px] shrink-0"
        />
        <View className="h-[1px] bg-gray-100 mx-3 mb-2" />
        <View className="px-3 pb-3">
          <PipelineTimeline
            pipelineStatus={value.status}
            timestamps={timestamps}
          />
        </View>
      </View>
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
