import React, { ReactNode } from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/text";

interface BadgeStyle {
  badge: string;
  badgeText: string;
}

interface CardHeaderProps {
  /**
   * Primary identifier (e.g., code, ID)
   */
  code?: string | null;

  /**
   * Status or type value
   */
  statusValue?: string | null;

  /**
   * Display label for the status/type
   */
  statusLabel?: string | null;

  /**
   * Style configuration for the badge
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
 * // Simple header with code and status
 * <CardHeader
 *   code="ORD-2024-001"
 *   statusValue="completed"
 *   statusLabel="Completed"
 *   badgeStyle={completedStyle}
 * />
 *
 * @example
 * // Header with right content (e.g., amount)
 * <CardHeader
 *   code="PAY-001"
 *   statusValue="order_payment"
 *   statusLabel="Order Payment"
 *   badgeStyle={paymentStyle}
 *   rightContent={
 *     <View className="items-end">
 *       <Text className="text-2xl font-bold">$1,234.56</Text>
 *       <Text className="text-sm text-slate-500">USD</Text>
 *     </View>
 *   }
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
  return (
    <View className={`p-4 pb-3 ${className}`}>
      <View className="flex-row justify-between items-start">
        {/* Left side: Code and Status Badge */}
        <View className="flex-1 pr-4">
          <Text className="text-xs font-mono text-slate-400 tracking-wider mb-1">
            {code || "—"}
          </Text>
          {statusValue && statusLabel && badgeStyle && (
            <View
              className={`self-start px-2.5 py-1 rounded-full border ${badgeStyle.badge}`}
            >
              <Text className={`text-xs font-medium ${badgeStyle.badgeText}`}>
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
