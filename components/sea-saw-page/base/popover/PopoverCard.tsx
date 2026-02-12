import { useMemo } from "react";
import { Text } from "@/components/sea-saw-design/text";
import { View } from "@/components/sea-saw-design/view";
import { cn } from "@/lib/utils";
import { PopoverCardProps } from "./PopoverCard.types";
import { PopoverHeader } from "./PopoverHeader";
import { PopoverInfoRow } from "./PopoverInfoRow";

// Re-export types for backward compatibility
export type {
  FieldMetaDef,
  ColumnDef,
  PopoverCardProps,
  PopoverHeaderProps,
  PopoverInfoRowProps,
} from "./PopoverCard.types";

/**
 * PopoverCard - A reusable popover content wrapper component
 *
 * Displays a card with header (icon + title) and a list of fields
 * based on metadata definitions and custom render functions.
 *
 * @example
 * ```tsx
 * <Popover
 *   content={
 *     <PopoverCard
 *       headerIcon={<UserIcon size={16} />}
 *       headerTitle="User Details"
 *       value={userData}
 *       metaDef={userMetaDef}
 *       columnOrder={['name', 'email', 'phone']}
 *       colDef={{
 *         email: { render: (v) => <a href={`mailto:${v}`}>{v}</a> }
 *       }}
 *     />
 *   }
 * >
 *   <Button>Hover me</Button>
 * </Popover>
 * ```
 */
function PopoverCard({
  headerIcon,
  headerTitle,
  value,
  metaDef,
  columnOrder,
  colDef,
  widthClass = "w-[240px]",
  paddingClass = "p-3",
  showDivider = true,
  iconBgClass = "bg-blue-50",
  iconClass,
  labelWidthClass = "min-w-[60px]",
}: PopoverCardProps) {
  // Memoize filtered and ordered fields for performance
  const orderedFields = useMemo(() => {
    // If metaDef is provided, use it
    if (metaDef) {
      const entries = Object.entries(metaDef);

      // If columnOrder is not provided, show all fields
      if (!columnOrder || columnOrder.length === 0) {
        return entries;
      }

      // Filter and sort by columnOrder
      return entries
        .filter(([fieldKey]) => columnOrder.includes(fieldKey))
        .sort(([keyA], [keyB]) => {
          const indexA = columnOrder.indexOf(keyA);
          const indexB = columnOrder.indexOf(keyB);
          return indexA - indexB;
        });
    }

    // When metaDef is not provided, derive fields from columnOrder or value
    if (columnOrder && columnOrder.length > 0) {
      return columnOrder.map((key) => [key, { label: key }] as [string, any]);
    }

    // Fallback: use value keys
    if (value) {
      return Object.keys(value)
        .filter((key) => key !== "id" && key !== "pk")
        .map((key) => [key, { label: key }] as [string, any]);
    }

    return [];
  }, [metaDef, columnOrder, value]);

  return (
    <View className={cn(paddingClass, widthClass, "space-y-3")}>
      {/* Header */}
      <PopoverHeader
        headerIcon={headerIcon}
        headerTitle={headerTitle}
        iconBgClass={iconBgClass}
        iconClass={iconClass}
      />

      {/* Divider */}
      {showDivider && <View className="h-[1px] bg-gray-100" />}

      {/* Info Fields */}
      <View className="space-y-1.5">
        {orderedFields.length === 0 ? (
          <Text className="text-xs text-gray-400">No data available</Text>
        ) : (
          orderedFields.map(([fieldKey, fieldDef]) => {
            const label = fieldDef.label || fieldKey;
            const fieldValue = value[fieldKey];
            const customRender = colDef?.[fieldKey]?.render;
            const render = customRender
              ? customRender(fieldDef, fieldValue)
              : fieldValue;
            const icon = colDef?.[fieldKey]?.icon;

            // Default render: label-value pair
            return (
              <PopoverInfoRow
                key={fieldKey}
                fieldKey={fieldKey}
                label={label}
                fieldValue={render}
                icon={icon}
                labelWidthClass={labelWidthClass}
              />
            );
          })
        )}
      </View>
    </View>
  );
}

export default PopoverCard;
export { PopoverCard };
