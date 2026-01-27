import React from "react";
import { Text } from "@/components/sea-saw-design/text";

interface SectionTitleProps {
  children: React.ReactNode;
}

export default function SectionTitle({ children }: SectionTitleProps) {
  return (
    <Text className="text-xs font-semibold text-gray-700 mb-2">{children}</Text>
  );
}
