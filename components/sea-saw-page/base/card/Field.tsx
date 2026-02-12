import React, { ReactNode } from "react";
import { View } from "react-native";
import { Text } from "@/components/sea-saw-design/text";

interface FieldProps {
  /**
   * Field label
   */
  label: string;

  /**
   * Field value - can be string or custom ReactNode
   */
  value?: string | ReactNode | null;

  /**
   * Use monospace font for value (useful for codes, numbers)
   */
  mono?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Field component for displaying label-value pairs
 *
 * @example
 * <Field label="Order Number" value="ORD-001" mono />
 * <Field label="Customer" value={<CustomerPopover />} />
 */
export default function Field({
  label,
  value,
  mono = false,
  className = "",
}: FieldProps) {
  const isCustomValue = React.isValidElement(value);

  return (
    <View className={className}>
      <Text className="text-xs text-slate-400 uppercase tracking-wider mb-1">
        {label}
      </Text>
      {isCustomValue ? (
        value
      ) : (
        <Text className={`text-sm text-slate-600 ${mono ? "font-mono" : ""}`}>
          {value || "—"}
        </Text>
      )}
    </View>
  );
}
