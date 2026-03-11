import React from "react";
import { Text } from "@/components/sea-saw-design/text";
import { PopoverInfoRowProps } from "./PopoverCard.types";

/**
 * PopoverInfoRow - Displays a single field row in popover card
 *
 * Renders two grid cells (label + value) — must be a direct child of a
 * `grid grid-cols-[auto_1fr]` container so all labels share the same
 * column width (determined by the longest label).
 */
export function PopoverInfoRow({
  fieldKey,
  label,
  fieldValue,
  icon,
}: PopoverInfoRowProps) {
  return (
    <React.Fragment key={fieldKey}>
      <Text className="text-xs text-gray-500 whitespace-nowrap">
        {icon} {label}:
      </Text>
      <Text className="text-xs text-gray-900 flex-wrap">
        {fieldValue ?? "-"}
      </Text>
    </React.Fragment>
  );
}
