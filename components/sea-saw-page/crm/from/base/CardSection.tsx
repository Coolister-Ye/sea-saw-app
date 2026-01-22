import React from "react";
import { View } from "react-native";

interface CardSectionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Card section wrapper component
 * Provides consistent padding and border styling for sections within a card
 */
export default function CardSection({
  children,
  className = "",
}: CardSectionProps) {
  return (
    <View className={`px-4 py-3 border-t border-slate-100 ${className}`}>
      {children}
    </View>
  );
}
