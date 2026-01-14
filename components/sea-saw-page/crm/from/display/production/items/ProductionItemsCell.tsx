import React from "react";
import { View } from "react-native";
import { Tag, Popover } from "antd";
import { Text } from "@/components/ui/text";

interface ProductionItem {
  id?: number;
  product_name?: string;
  specification?: string;
  size?: string;
  planned_qty?: string | number;
  produced_qty?: string | number;
  unit?: string;
}

interface ProductionItemsCellProps {
  value?: ProductionItem[] | null;
}

export default function ProductionItemsCell({
  value,
}: ProductionItemsCellProps) {
  if (!value || !Array.isArray(value) || value.length === 0) {
    return <Text className="text-gray-400">-</Text>;
  }

  const totalItems = value.length;
  const firstItem = value[0];

  /* ========================
   * Popover content
   * ======================== */
  const content = (
    <View className="p-2 max-w-md">
      <View className="space-y-2">
        {value.map((item, index) => (
          <View
            key={item.id || index}
            className="pb-2 border-b border-gray-100 last:border-b-0"
          >
            <Text className="font-semibold text-sm text-gray-900 mb-1">
              {item.product_name || "Unnamed Product"}
            </Text>

            {item.specification && (
              <Text className="text-xs text-gray-600 mb-1">
                {item.specification}
              </Text>
            )}

            <View className="flex-row gap-2 flex-wrap">
              {item.size && (
                <Tag color="blue" className="text-xs">
                  Size: {item.size}
                </Tag>
              )}
              {item.planned_qty && (
                <Tag color="orange" className="text-xs">
                  Planned: {item.planned_qty} {item.unit || ""}
                </Tag>
              )}
              {item.produced_qty && (
                <Tag color="green" className="text-xs">
                  Produced: {item.produced_qty} {item.unit || ""}
                </Tag>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  /* ========================
   * Display summary
   * ======================== */
  return (
    <Popover content={content} trigger="hover" placement="right">
      <View className="cursor-pointer flex-1 h-full justify-center">
        <Text className="text-sm text-blue-600 hover:text-blue-700">
          {firstItem.product_name || "Product"}
          {totalItems > 1 && (
            <Text className="text-xs text-gray-500 ml-1">
              +{totalItems - 1} more
            </Text>
          )}
        </Text>
      </View>
    </Popover>
  );
}
