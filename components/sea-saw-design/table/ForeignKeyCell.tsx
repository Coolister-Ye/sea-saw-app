import { View, Text } from "react-native";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { ForeignKeyCellProps } from "./interface";

function ForeignKeyCell({
  dataType,
  data,
  displayContent,
  usePopover = false,
}: ForeignKeyCellProps) {
  if (!data) return null;

  const getDisplayContent = (item: Record<string, any>) => {
    if (displayContent) return displayContent(item);
    const displayFields = dataType.display_fields?.length
      ? dataType.display_fields
      : ["pk"];
    return displayFields
      .map((key) => item[key])
      .filter(Boolean)
      .join(", ");
  };

  if (dataType.type === "field" && Array.isArray(data) && dataType.child) {
    return (
      <View className="flex flex-row items-center h-full">
        {data.map((d, index) =>
          d && dataType.child ? (
            <ForeignKeyCell
              key={index}
              dataType={dataType.child}
              data={d}
              displayContent={displayContent}
              usePopover={usePopover}
            />
          ) : null
        )}
      </View>
    );
  }

  if (
    dataType.type === "nested object" &&
    typeof data === "object" &&
    !Array.isArray(data)
  ) {
    const content = getDisplayContent(data);
    if (usePopover) {
      return (
        <Popover className="h-full justify-center">
          <PopoverTrigger asChild className="bg-green-100 px-2 py-1 mr-1 w-fit">
            <Text className="text-xs">{content}</Text>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-80 bg-white border-gray-100"
          >
            <Text className="font-medium native:text-xl mb-1">Details</Text>
            <View>
              {Object.entries(dataType.children ?? {}).map(([key, value]) => (
                <View key={key} className="flex flex-row items-center">
                  <Text className="text-sm/6">{value.label || key}</Text>
                  <View className="flex-1 border border-dashed border-gray-300 mx-3" />
                  <Text className="text-sm/6">{data[key]}</Text>
                </View>
              ))}
            </View>
          </PopoverContent>
        </Popover>
      );
    }
    return <Text>{content}</Text>;
  }

  return null;
}

export default ForeignKeyCell;
