import { ReactNode } from "react";
import View from "@/components/themed/View";
import Text from "@/components/themed/Text";

/**
 * Reusable Section Header Component
 * Used for displaying section titles with icons in profile pages
 */
export interface SectionHeaderProps {
  icon: ReactNode;
  title: string;
}

export function SectionHeader({ icon, title }: SectionHeaderProps) {
  return (
    <View className="flex-row items-center mb-4">
      <View className="w-8 h-8 rounded-lg bg-blue-50 items-center justify-center mr-3">
        {icon}
      </View>
      <Text className="text-sm font-bold uppercase tracking-wide text-slate-600">
        {title}
      </Text>
    </View>
  );
}

/**
 * Reusable Info Row Component
 * Displays label-value pairs in a consistent format
 * Supports text, numbers, and custom ReactNode values
 * Empty values are displayed as "-"
 */
export interface InfoRowProps {
  label: string;
  value?: string | number | ReactNode;
  isLast?: boolean;
}

export function InfoRow({ label, value, isLast = false }: InfoRowProps) {
  const displayValue =
    typeof value === "string" || typeof value === "number"
      ? value || "-"
      : value || "-";

  return (
    <View
      className={`flex-row justify-between items-center py-3 ${
        !isLast ? "border-b border-slate-100" : ""
      }`}
    >
      <Text className="text-sm font-medium text-slate-500">{label}</Text>
      {typeof displayValue === "string" || typeof displayValue === "number" ? (
        <Text className="text-sm font-semibold text-slate-700">
          {displayValue}
        </Text>
      ) : (
        displayValue
      )}
    </View>
  );
}
