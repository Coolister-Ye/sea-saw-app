import { Text } from "@/components/sea-saw-design/text";
import { View } from "@/components/sea-saw-design/view";
import { cn } from "@/lib/utils";
import { PopoverHeaderProps } from "./PopoverCard.types";

/**
 * PopoverHeader - Header component for popover card
 *
 * Displays an icon (optional) and title
 */
export function PopoverHeader({
  headerIcon,
  headerTitle,
  iconBgClass = "bg-blue-50",
  iconClass,
}: PopoverHeaderProps) {
  return (
    <View className="flex flex-row items-center gap-3">
      {headerIcon && (
        <View
          className={cn(
            "w-8 h-8 rounded-full items-center justify-center",
            iconBgClass,
            iconClass,
          )}
        >
          {headerIcon}
        </View>
      )}

      <View className="flex-1">
        {typeof headerTitle === "string" ? (
          <Text className="text-sm font-semibold text-gray-900">
            {headerTitle}
          </Text>
        ) : (
          headerTitle
        )}
      </View>
    </View>
  );
}
