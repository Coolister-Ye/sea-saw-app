import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { ReactNode } from "react";

interface InfoFieldProps {
  label: string;
  value?: any;
  format?: (value: any) => string;
  prefix?: string;
  suffix?: string;
  blank_display?: string;
  children?: ReactNode;
}

/**
 * InfoField Component
 * Displays a label-value pair in a vertical layout
 * @param label - The field label
 * @param value - The raw value to display (ignored if children is provided)
 * @param format - Optional formatting function (defaults to returning blank_display for null/undefined)
 * @param prefix - Optional prefix to prepend before formatted value (e.g., "$", "€")
 * @param suffix - Optional suffix to append after formatted value (e.g., "kg", "%")
 * @param blank_display - String to display for blank/null/undefined values (default: "-")
 * @param children - Custom content to render instead of formatted value
 */
function InfoField({ label, value, format, prefix, suffix, blank_display = "-", children }: InfoFieldProps) {
  const formatValue = () => {
    // Use custom format function if provided
    if (format) {
      const formatted = format(value);
      // Don't add prefix/suffix if value is blank_display or empty
      if (formatted === blank_display || formatted === "") {
        return formatted;
      }
      const withPrefix = prefix ? `${prefix}${formatted}` : formatted;
      return suffix ? `${withPrefix} ${suffix}` : withPrefix;
    }

    // Default behavior: show blank_display for null/undefined/empty
    if (value === undefined || value === null || value === "") {
      return blank_display;
    }

    const displayValue = String(value);
    const withPrefix = prefix ? `${prefix}${displayValue}` : displayValue;
    return suffix ? `${withPrefix} ${suffix}` : withPrefix;
  };

  return (
    <View>
      <Text className="text-xs text-gray-500">{label}</Text>
      {children ? (
        <View className="mt-1">{children}</View>
      ) : (
        <Text className="text-sm text-gray-700">{formatValue()}</Text>
      )}
    </View>
  );
}

export default InfoField;
export { InfoField };
