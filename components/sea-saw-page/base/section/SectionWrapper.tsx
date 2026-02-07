import React from "react";
import { View } from "react-native";

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Section外层容器，提供统一的间距
 */
export default function SectionWrapper({
  children,
  className = "mb-8",
}: SectionWrapperProps) {
  return <View className={className}>{children}</View>;
}
