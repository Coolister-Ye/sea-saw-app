import React from "react";
import { View } from "react-native";
import { Text } from "@/components/sea-saw-design/text";
import { cn } from "../utils";
import type { TimelineItem, TimelineItemStatus } from "./index";

const DOT_SIZE = 10;
const TIMESTAMP_HEIGHT = 16; // fixed height keeps all dot rows on the same horizontal axis

const DOT_FILL: Record<TimelineItemStatus, string> = {
  completed: "#52c41a",
  current: "#1677ff",
  pending: "transparent",
  error: "#ff4d4f",
  warning: "#faad14",
};

const DOT_BORDER: Record<TimelineItemStatus, string> = {
  completed: "#52c41a",
  current: "#1677ff",
  pending: "#d9d9d9",
  error: "#ff4d4f",
  warning: "#faad14",
};

interface HorizontalTimelineProps {
  items: TimelineItem[];
  className?: string;
}

/**
 * Flex horizontal timeline — steps share equal width across the container.
 *
 * Layout per step (column, no alignItems so children stretch to full width):
 *
 *   timestamp (fixed height, textAlign center)
 *   [half-line flex:1] — [dot] — [half-line flex:1]    ← always on the same axis
 *   label (textAlign center)
 *   sub-label (textAlign center, optional)
 */
export function HorizontalTimeline({
  items,
  className,
}: HorizontalTimelineProps) {
  return (
    <View className={cn("flex-row", className)}>
      {items.map((item, index) => {
        const isFirst = index === 0;
        const isLast = index === items.length - 1;
        const status = item.status ?? "pending";
        const prevStatus =
          index > 0 ? (items[index - 1].status ?? "pending") : null;

        const leftLineColor =
          prevStatus === "completed" ? "#52c41a" : "#d9d9d9";
        const rightLineColor = status === "completed" ? "#52c41a" : "#d9d9d9";

        const dotFill = item.color
          ? status === "pending"
            ? "transparent"
            : item.color
          : DOT_FILL[status];
        const dotBorder = item.color ?? DOT_BORDER[status];

        return (
          <View
            key={item.key ?? String(index)}
            style={{ flex: 1 }}
            // No alignItems — children stretch to full width by default (React Native default is "stretch")
          >
            {/* Label (+ description when present) — above the dot, fixed height */}
            <Text
              size="xs"
              weight={status === "current" ? "semibold" : "normal"}
              variant={status === "pending" ? "muted" : "default"}
              className="mb-1"
              numberOfLines={1}
              style={{
                textAlign: "center",
                height: TIMESTAMP_HEIGHT,
                lineHeight: TIMESTAMP_HEIGHT,
              }}
            >
              {item.description ?? item.label}
            </Text>

            {/* Dot row — stretches to full column width, lines connect seamlessly */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  flex: 1,
                  height: 2,
                  backgroundColor: isFirst ? "transparent" : leftLineColor,
                }}
              />
              <View
                style={{
                  width: DOT_SIZE,
                  height: DOT_SIZE,
                  borderRadius: DOT_SIZE / 2,
                  backgroundColor: dotFill,
                  borderWidth: 2,
                  borderColor: dotBorder,
                }}
              />
              <View
                style={{
                  flex: 1,
                  height: 2,
                  backgroundColor: isLast ? "transparent" : rightLineColor,
                }}
              />
            </View>

            {/* Timestamp — below the dot */}
            <Text
              size="xs"
              variant="muted"
              numberOfLines={1}
              style={{ textAlign: "center", marginTop: 5 }}
            >
              {item.timestamp ?? ""}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export default HorizontalTimeline;
