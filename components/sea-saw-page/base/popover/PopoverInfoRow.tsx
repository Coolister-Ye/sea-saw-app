import { Text } from "@/components/sea-saw-design/text";
import { View } from "@/components/sea-saw-design/view";
import { cn } from "@/lib/utils";
import { PopoverInfoRowProps } from "./PopoverCard.types";

/**
 * PopoverInfoRow - Displays a single field row in popover card
 *
 * Shows a label-value pair with optional icon
 */
export function PopoverInfoRow({
  fieldKey,
  label,
  fieldValue,
  icon,
  labelWidthClass = "min-w-[60px]",
}: PopoverInfoRowProps) {
  return (
    <View key={fieldKey} className="flex flex-row gap-2 items-center">
      <Text className={cn("text-xs text-gray-500", labelWidthClass)}>
        {icon} {label}:
      </Text>
      <Text className="text-xs text-gray-900 flex-1 truncate">
        {fieldValue ?? "-"}
      </Text>
    </View>
  );
}
