import React, { ReactNode } from "react";
import { View } from "react-native";

interface FieldGridProps {
  /**
   * Field components to display in a grid
   */
  children: ReactNode;

  /**
   * Number of columns (auto-responsive by default)
   */
  columns?: number;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Grid layout for Field components
 * Automatically wraps fields in a responsive grid
 *
 * @example
 * <FieldGrid>
 *   <Field label="Type" value={type} />
 *   <Field label="Date" value={date} />
 *   <Field label="Amount" value={amount} />
 * </FieldGrid>
 */
export default function FieldGrid({
  children,
  className = "",
}: FieldGridProps) {
  return (
    <View className={`flex-row flex-wrap gap-x-6 gap-y-3 ${className}`}>
      {children}
    </View>
  );
}
