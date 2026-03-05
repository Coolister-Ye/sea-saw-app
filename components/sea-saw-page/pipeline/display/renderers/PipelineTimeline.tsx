import React from "react";
import { View } from "react-native";
import {
  Timeline,
  HorizontalTimeline,
  type TimelineItem,
  type TimelineItemStatus,
} from "@/components/sea-saw-design/timeline";
import { Text } from "@/components/sea-saw-design/text";

// ---------------------------------------------------------------------------
// Timestamps — mirrors the backend Pipeline model's per-stage fields
// ---------------------------------------------------------------------------

export interface PipelineTimestamps {
  created_at?: string | null;
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

function formatTimestamp(value?: string | null): string | undefined {
  if (!value) return undefined;
  try {
    const d = new Date(value);
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const da = String(d.getDate()).padStart(2, "0");
    return `${y}-${mo}-${da}`;
  } catch {
    return value;
  }
}

// ---------------------------------------------------------------------------
// Stage definitions
// ---------------------------------------------------------------------------

interface PipelineStage {
  statuses: string[];
  label: string;
  subLabel?: (status: string) => string | undefined;
  /**
   * Resolves the timestamp to display for this stage.
   * Receives the *current* pipeline status and the full timestamps object.
   * For completed stages we scan all candidate fields and return the first
   * non-null value, since only the relevant one will ever be set.
   */
  getTimestamp?: (
    currentStatus: string,
    ts: PipelineTimestamps
  ) => string | null | undefined;
}

const PIPELINE_STAGES: PipelineStage[] = [
  {
    statuses: ["draft"],
    label: "草稿",
    getTimestamp: (_s, ts) => ts.created_at,
  },
  {
    statuses: ["order_confirmed"],
    label: "订单确认",
    getTimestamp: (_s, ts) => ts.confirmed_at,
  },
  {
    statuses: ["in_purchase", "in_production", "in_purchase_and_production"],
    label: "采购 / 生产中",
    subLabel: (status) => {
      if (status === "in_purchase") return "采购中";
      if (status === "in_production") return "生产中";
      if (status === "in_purchase_and_production") return "采购和生产中";
      return undefined;
    },
    // Return whichever of the three fields is set
    getTimestamp: (_s, ts) =>
      ts.in_purchase_at ??
      ts.in_production_at ??
      ts.in_purchase_and_production_at,
  },
  {
    statuses: [
      "purchase_completed",
      "production_completed",
      "purchase_and_production_completed",
    ],
    label: "采购 / 生产完成",
    subLabel: (status) => {
      if (status === "purchase_completed") return "采购完成";
      if (status === "production_completed") return "生产完成";
      if (status === "purchase_and_production_completed")
        return "采购和生产完成";
      return undefined;
    },
    getTimestamp: (_s, ts) =>
      ts.purchase_completed_at ??
      ts.production_completed_at ??
      ts.purchase_and_production_completed_at,
  },
  {
    statuses: ["in_outbound"],
    label: "出库中",
    getTimestamp: (_s, ts) => ts.in_outbound_at,
  },
  {
    statuses: ["outbound_completed"],
    label: "出库完成",
    getTimestamp: (_s, ts) => ts.outbound_completed_at,
  },
  {
    statuses: ["completed"],
    label: "已完成",
    getTimestamp: (_s, ts) => ts.completed_at,
  },
];

// Special terminal states outside the normal linear flow
const SPECIAL_STATUSES: Record<
  string,
  {
    label: string;
    status: TimelineItemStatus;
    color: string;
    getTimestamp?: (ts: PipelineTimestamps) => string | null | undefined;
  }
> = {
  cancelled: {
    label: "已取消",
    status: "error",
    color: "#ff4d4f",
    getTimestamp: (ts) => ts.cancelled_at,
  },
  issue_reported: {
    label: "问题上报",
    status: "warning",
    color: "#faad14",
  },
};

function getStageIndex(pipelineStatus: string): number {
  return PIPELINE_STAGES.findIndex((stage) =>
    stage.statuses.includes(pipelineStatus)
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface PipelineTimelineProps {
  pipelineCode?: string | null;
  pipelineStatus?: string | null;
  /** Milestone timestamps fetched from the backend */
  timestamps?: PipelineTimestamps;
  /** Show skeleton placeholders while timestamps are loading */
  loading?: boolean;
}

/**
 * Renders the pipeline progress as a vertical timeline.
 *
 * - Past stages   → green filled dot, with timestamp if available
 * - Current stage → blue filled dot, bold label, with timestamp if available
 * - Future stages → gray outline dot, muted label
 * - cancelled / issue_reported → single error/warning item
 */
export function PipelineTimeline({
  pipelineCode,
  pipelineStatus,
  timestamps,
  loading,
}: PipelineTimelineProps) {
  if (!pipelineStatus) {
    return (
      <View className="px-1 py-2">
        <Text size="sm" variant="muted">
          无流程
        </Text>
      </View>
    );
  }

  // Special terminal states
  if (pipelineStatus in SPECIAL_STATUSES) {
    const special = SPECIAL_STATUSES[pipelineStatus];
    const ts = timestamps && special.getTimestamp
      ? formatTimestamp(special.getTimestamp(timestamps))
      : undefined;
    const items: TimelineItem[] = [
      {
        key: pipelineStatus,
        label: special.label,
        status: special.status,
        color: special.color,
        timestamp: ts,
      },
    ];
    return (
      <View>
        {pipelineCode && (
          <Text size="xs" variant="muted" className="mb-2">
            {pipelineCode}
          </Text>
        )}
        <Timeline items={items} loading={loading} />
      </View>
    );
  }

  const currentStageIndex = getStageIndex(pipelineStatus);

  const items: TimelineItem[] = PIPELINE_STAGES.map((stage, index) => {
    let itemStatus: TimelineItemStatus;
    let description: string | undefined;
    let timestamp: string | undefined;

    if (index < currentStageIndex) {
      itemStatus = "completed";
      if (timestamps && stage.getTimestamp) {
        timestamp = formatTimestamp(
          stage.getTimestamp(pipelineStatus, timestamps)
        );
      }
    } else if (index === currentStageIndex) {
      itemStatus = "current";
      description = stage.subLabel?.(pipelineStatus);
      if (timestamps && stage.getTimestamp) {
        timestamp = formatTimestamp(
          stage.getTimestamp(pipelineStatus, timestamps)
        );
      }
    } else {
      itemStatus = "pending";
    }

    return {
      key: stage.statuses[0],
      label: stage.label,
      status: itemStatus,
      description,
      timestamp,
    };
  });

  return (
    <View>
      {pipelineCode && (
        <Text size="xs" variant="muted" className="mb-2">
          {pipelineCode}
        </Text>
      )}
      <Timeline items={items} loading={loading} />
    </View>
  );
}

export default PipelineTimeline;

/**
 * Horizontal variant — same stage logic, rendered left-to-right.
 * Suitable for embedding inside a Card.Section as a progress strip.
 */
export function PipelineHorizontalTimeline({
  pipelineStatus,
  timestamps,
}: Pick<PipelineTimelineProps, "pipelineStatus" | "timestamps">) {
  if (!pipelineStatus) return null;

  // Special terminal states: single item
  if (pipelineStatus in SPECIAL_STATUSES) {
    const special = SPECIAL_STATUSES[pipelineStatus];
    const ts =
      timestamps && special.getTimestamp
        ? formatTimestamp(special.getTimestamp(timestamps))
        : undefined;
    return (
      <HorizontalTimeline
        items={[
          {
            key: pipelineStatus,
            label: special.label,
            status: special.status,
            color: special.color,
            timestamp: ts,
          },
        ]}
      />
    );
  }

  const currentStageIndex = getStageIndex(pipelineStatus);

  const items: TimelineItem[] = PIPELINE_STAGES.map((stage, index) => {
    let itemStatus: TimelineItemStatus;
    let description: string | undefined;
    let timestamp: string | undefined;

    if (index < currentStageIndex) {
      itemStatus = "completed";
      if (timestamps && stage.getTimestamp) {
        timestamp = formatTimestamp(stage.getTimestamp(pipelineStatus, timestamps));
      }
    } else if (index === currentStageIndex) {
      itemStatus = "current";
      description = stage.subLabel?.(pipelineStatus);
      if (timestamps && stage.getTimestamp) {
        timestamp = formatTimestamp(stage.getTimestamp(pipelineStatus, timestamps));
      }
    } else {
      itemStatus = "pending";
    }

    return { key: stage.statuses[0], label: stage.label, status: itemStatus, description, timestamp };
  });

  return <HorizontalTimeline items={items} />;
}
