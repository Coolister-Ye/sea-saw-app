import React, { useMemo } from "react";
import i18n from '@/locale/i18n';
import { View, Text, Pressable } from "react-native";
import ProductDisplay from "./ProductDisplay";
import DisplayForm from "@/components/sea-saw-design/form/DisplayForm";
import EmptySlot from "./base/EmptySlot";
import { useFormDefs } from "@/hooks/useFormDefs";

interface Product {
  pk: number;
  product_name: string;
}

interface Order {
  pk: number;
  order_code: string;
  stage: string;
  products?: Product[];
}

interface OrderDisplayProps {
  def: any;
  value?: Order;
  onEdit?: (data: Order) => void;
  onDelete?: (data: Order) => void;
}

export default function OrderDisplay({
  def,
  value,
  onEdit,
  onDelete,
}: OrderDisplayProps) {
  const formDefs = useFormDefs({ def });

  /** 拆分成基础字段 & 产品字段 */
  const { baseDef, prodDef } = useMemo(() => {
    if (!formDefs) return { baseDef: [], prodDef: undefined };

    const base = formDefs.filter((item: any) => item.field !== "products");
    const prod = formDefs.find((item: any) => item.field === "products");

    return { baseDef: base, prodDef: prod };
  }, [formDefs]);

  /** 空记录 */
  if (!value) {
    return <EmptySlot message={i18n.t("No order information")} />;
  }

  const { order_code, stage, products = [] } = value;

  return (
    <View className="space-y-4">
      <View className="p-4 bg-white rounded-lg border border-gray-100">
        {/* Header */}
        <View className="mb-3 border-b border-gray-200 pb-2 flex-row justify-between items-center">
          <View className="flex-row items-center space-x-2">
            <Text className="text-md font-semibold text-gray-800">
              {i18n.t("order")} #{order_code}
            </Text>

            {stage && (
              <Text className="text-xs text-gray-500">
                {i18n.t("Stage")}: {stage}
              </Text>
            )}
          </View>

          {/* 按钮区（仅当存在回调时显示） */}
          {(onEdit || onDelete) && (
            <View className="flex-row space-x-3 pr-3">
              {onEdit && (
                <Pressable onPress={() => onEdit(value)}>
                  <Text className="text-xs text-blue-600">
                    {i18n.t("Edit")}
                  </Text>
                </Pressable>
              )}

              {onDelete && (
                <Pressable onPress={() => onDelete(value)}>
                  <Text className="text-xs text-red-600">
                    {i18n.t("Delete")}
                  </Text>
                </Pressable>
              )}
            </View>
          )}
        </View>

        {/* 基础信息展示 */}
        <DisplayForm def={baseDef} data={value} />

        {/* 产品列表 */}
        {products.length > 0 ? (
          <View className="mt-4 p-4 bg-white rounded-lg border border-gray-100">
            <ProductDisplay
              def={prodDef}
              value={products}
              agGridReactProps={{
                suppressContextMenu: true,
                autoSizeStrategy: { type: "fitCellContents" },
              }}
            />
          </View>
        ) : (
          <EmptySlot message={i18n.t("No product information")} />
        )}
      </View>
    </View>
  );
}
