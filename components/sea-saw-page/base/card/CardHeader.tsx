import React, { ReactNode } from "react";
import { View } from "react-native";
import { Text } from "@/components/sea-saw-design/text";

interface BadgeStyle {
  badge: string;
  badgeText: string;
}

interface CardHeaderProps {
  /**
   * Primary identifier (e.g., code, ID).
   */
  code?: string | null;

  /**
   * Status display. Accepts a string (rendered as badge with statusLabel + badgeStyle)
   * or a ReactNode (rendered directly) for custom status components.
   */
  statusValue?: ReactNode;

  /**
   * Display label for the status/type. Only used when statusValue is a string.
   */
  statusLabel?: string | null;

  /**
   * Style configuration for the badge. Only used when statusValue is a string.
   */
  badgeStyle?: BadgeStyle;

  /**
   * Optional right-side content (e.g., amount, tracking number)
   */
  rightContent?: ReactNode;

  /**
   * Additional CSS classes for the container
   */
  className?: string;
}

/**
 * Reusable card header component
 * Displays a code/identifier on the left, optional status badge, and optional right content
 *
 * @example
 * // Simple header with code and string status badge
 * <CardHeader
 *   code="ORD-2024-001"
 *   statusValue="completed"
 *   statusLabel="Completed"
 *   badgeStyle={completedStyle}
 * />
 *
 * @example
 * // Header with custom ReactNode status component
 * <CardHeader
 *   code="PIP-2024-001"
 *   statusValue={<PipelineStatusTag def={statusDef} value={status} />}
 * />
 */
export default function CardHeader({
  code,
  statusValue,
  statusLabel,
  badgeStyle,
  rightContent,
  className = "",
}: CardHeaderProps) {
  const isCustomStatus = React.isValidElement(statusValue);

  return (
    <View className={`p-4 pb-3 ${className}`}>
      <View className="flex-row justify-between items-start">
        {/* Left side */}
        <View className="flex-1 pr-4">
          <Text className="text-xs font-mono text-slate-400 tracking-wider mb-1">
            {code || "—"}
          </Text>
          {isCustomStatus
            ? statusValue
            : statusValue &&
              statusLabel &&
              badgeStyle && (
                <View
                  className={`self-start px-2.5 py-1 rounded-full border ${badgeStyle.badge}`}
                >
                  <Text
                    className={`text-xs font-medium ${badgeStyle.badgeText}`}
                  >
                    {statusLabel}
                  </Text>
                </View>
              )}
        </View>

        {/* Right side: Optional content */}
        {rightContent && <View>{rightContent}</View>}
      </View>
    </View>
  );
}
