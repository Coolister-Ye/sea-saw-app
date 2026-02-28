import React from "react";
import { View } from "react-native";
import { Text } from "@/components/sea-saw-design/text";
import { cn } from "../utils";

export type TimelineItemStatus =
  | "completed"
  | "current"
  | "pending"
  | "error"
  | "warning";

export interface TimelineItem {
  key?: string;
  label: string;
  description?: string;
  timestamp?: string;
  status?: TimelineItemStatus;
  /** Override the dot color */
  color?: string;
  /** Fully custom dot node */
  dot?: React.ReactNode;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
  /**
   * When true, renders a subtle pulsing placeholder bar below the label
   * of each item that is missing a timestamp. Useful while timestamps are
   * being fetched from the server.
   */
  loading?: boolean;
}

const DOT_FILL_COLOR: Record<TimelineItemStatus, string> = {
  completed: "#52c41a",
  current: "#1677ff",
  pending: "transparent",
  error: "#ff4d4f",
  warning: "#faad14",
};

const DOT_BORDER_COLOR: Record<TimelineItemStatus, string> = {
  completed: "#52c41a",
  current: "#1677ff",
  pending: "#d9d9d9",
  error: "#ff4d4f",
  warning: "#faad14",
};

const LINE_COLOR: Record<TimelineItemStatus, string> = {
  completed: "#d9d9d9",
  current: "#f0f0f0",
  pending: "#f0f0f0",
  error: "#f0f0f0",
  warning: "#f0f0f0",
};

function TimelineDot({
  status,
  color,
  dot,
}: {
  status: TimelineItemStatus;
  color?: string;
  dot?: React.ReactNode;
}) {
  if (dot) {
    return (
      <View
        style={{
          width: 10,
          height: 10,
          marginTop: 5,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {dot}
      </View>
    );
  }

  const fillColor = color
    ? status === "pending"
      ? "transparent"
      : color
    : DOT_FILL_COLOR[status];
  const borderColor = color ?? DOT_BORDER_COLOR[status];

  return (
    <View
      style={{
        width: 10,
        height: 10,
        borderRadius: 5,
        marginTop: 5,
        backgroundColor: fillColor,
        borderWidth: 2,
        borderColor: borderColor,
      }}
    />
  );
}

/**
 * Timeline component following Ant Design's Timeline design pattern.
 * Renders a vertical sequence of events with colored dots and connecting lines.
 *
 * Status semantics:
 * - completed: green filled dot — past events
 * - current:   blue filled dot  — active / in-progress event
 * - pending:   gray outline dot — future events
 * - error:     red filled dot   — failed / cancelled
 * - warning:   orange filled dot — issue / warning state
 */
export function Timeline({ items, className, loading }: TimelineProps) {
  return (
    <View className={cn("py-1", className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const status = item.status ?? "pending";
        const lineColor = LINE_COLOR[status];

        return (
          <View
            key={item.key ?? String(index)}
            style={{ flexDirection: "row" }}
          >
            {/* Left column: dot + vertical connecting line */}
            <View
              style={{
                alignItems: "center",
                width: 20,
                marginRight: 10,
              }}
            >
              <TimelineDot status={status} color={item.color} dot={item.dot} />
              {!isLast && (
                <View
                  style={{
                    flex: 1,
                    width: 2,
                    backgroundColor: lineColor,
                    marginTop: 4,
                    minHeight: 14,
                  }}
                />
              )}
            </View>

            {/* Right column: label + optional description / timestamp */}
            <View
              style={{
                flex: 1,
                paddingBottom: isLast ? 0 : 14,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 6,
                }}
              >
                <Text
                  size="sm"
                  weight={status === "current" ? "semibold" : "normal"}
                  variant={status === "pending" ? "muted" : "default"}
                >
                  {item.label}
                </Text>
                {item.timestamp ? (
                  <Text size="xs" variant="muted">
                    {item.timestamp}
                  </Text>
                ) : loading && status !== "pending" ? (
                  /* Skeleton placeholder while timestamps are being loaded */
                  <View
                    style={{
                      width: 96,
                      height: 10,
                      borderRadius: 4,
                      backgroundColor: "#f0f0f0",
                    }}
                  />
                ) : null}
              </View>
              {item.description && (
                <Text size="xs" variant="secondary" className="mt-0.5">
                  {item.description}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

export default Timeline;
