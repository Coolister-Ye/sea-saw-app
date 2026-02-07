import React from "react";
import { View } from "react-native";
import { Text } from "@/components/sea-saw-design/text";

interface CardFieldProps {
  label: string;
  value?: string | null;
  mono?: boolean;
}

/**
 * Reusable field display component for card layouts
 * Shows a label and value in a vertical stack with consistent styling
 */
export default function CardField({ label, value, mono }: CardFieldProps) {
  return (
    <View>
      <Text className="text-xs text-slate-400 uppercase tracking-wider mb-1">
        {label}
      </Text>
      <Text className={`text-sm text-slate-600 ${mono ? "font-mono" : ""}`}>
        {value || "—"}
      </Text>
    </View>
  );
}
