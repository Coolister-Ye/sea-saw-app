import { View, Text } from "react-native";

import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import type { ForeignKeyCellProps, HeaderMetaProps } from "./interface";

/* ═══════════════════════════════════════════════════════════════════════════
   FOREIGN KEY CELL
   Displays nested object or field array data with optional popover details
   ═══════════════════════════════════════════════════════════════════════════ */

function ForeignKeyCell({
  dataType,
  data,
  displayContent,
  usePopover = false,
}: ForeignKeyCellProps) {
  if (!data) return null;

  // Handle array of nested objects (field type)
  if (dataType.type === "field" && Array.isArray(data) && dataType.child) {
    return (
      <View className="flex-row items-center h-full gap-1">
        {data.map((item, index) =>
          item && dataType.child ? (
            <ForeignKeyCell
              key={item.pk ?? item.id ?? index}
              dataType={dataType.child}
              data={item}
              displayContent={displayContent}
              usePopover={usePopover}
            />
          ) : null
        )}
      </View>
    );
  }

  // Handle single nested object
  if (
    dataType.type === "nested object" &&
    typeof data === "object" &&
    !Array.isArray(data)
  ) {
    const content = getDisplayContent(data, dataType, displayContent);

    if (usePopover) {
      return (
        <NestedObjectPopover
          content={content}
          data={data}
          dataType={dataType}
        />
      );
    }

    return (
      <Text className="text-sm truncate" numberOfLines={1}>
        {content}
      </Text>
    );
  }

  return null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   HELPER FUNCTIONS
   ═══════════════════════════════════════════════════════════════════════════ */

function getDisplayContent(
  data: Record<string, any>,
  dataType: HeaderMetaProps,
  customRenderer?: (data: Record<string, any>) => JSX.Element
): string {
  if (customRenderer) {
    return ""; // Custom renderer handles display
  }

  const displayFields = dataType.display_fields?.length
    ? dataType.display_fields
    : ["pk", "name", "id"];

  return displayFields
    .map((key) => {
      const val = data[key];
      if (val == null) return null;
      if (typeof val === "object") {
        return val.pk ?? val.name ?? val.id ?? JSON.stringify(val);
      }
      return String(val);
    })
    .filter(Boolean)
    .join(", ");
}

function formatFieldValue(value: any): string {
  if (value == null) return "-";
  if (typeof value === "object") {
    return value.pk ?? value.name ?? value.id ?? JSON.stringify(value);
  }
  return String(value);
}

/* ═══════════════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */

type NestedObjectPopoverProps = {
  content: string;
  data: Record<string, any>;
  dataType: HeaderMetaProps;
};

function NestedObjectPopover({
  content,
  data,
  dataType,
}: NestedObjectPopoverProps) {
  const children = dataType.children ?? {};
  const hasDetails = Object.keys(children).length > 0;

  return (
    <Popover className="h-full justify-center">
      <PopoverTrigger asChild className="bg-indigo-50 px-2 py-1 rounded mr-1">
        <Text className="text-xs text-indigo-700 font-medium">{content}</Text>
      </PopoverTrigger>

      {hasDetails && (
        <PopoverContent
          align="start"
          className="w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4"
        >
          <Text className="font-semibold text-base mb-3 text-gray-900">
            Details
          </Text>
          <View className="gap-2">
            {Object.entries(children).map(([key, meta]) => (
              <View key={key} className="flex-row items-center">
                <Text className="text-sm text-gray-600 min-w-[100px]">
                  {meta.label || key}
                </Text>
                <View className="flex-1 border-b border-dashed border-gray-200 mx-2" />
                <Text className="text-sm text-gray-900 font-medium">
                  {formatFieldValue(data[key])}
                </Text>
              </View>
            ))}
          </View>
        </PopoverContent>
      )}
    </Popover>
  );
}

export default ForeignKeyCell;
export { ForeignKeyCell };
