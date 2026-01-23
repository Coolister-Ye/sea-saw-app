import React, { useMemo } from "react";
import i18n from '@/locale/i18n';
import { View } from "react-native";
import { Tag } from "antd";
import { Text } from "@/components/ui/text";
import { getFieldLabelMap } from "@/utils";
import { formatNumberTrim } from "@/utils";
import EmptySlot from "../../../base/EmptySlot";
import InfoField from "../../../base/InfoField";
import InfoSection from "../../../base/InfoSection";
import ItemCard from "../../../base/ItemCard";

interface PurchaseItemsCardProps {
  def?: any;
  value?: any[] | null;
  onItemClick?: (index: number) => void;
}

export default function PurchaseItemsCard({
  def,
  value,
  onItemClick,
}: PurchaseItemsCardProps) {
  const fieldLabelMap = useMemo(
    () => getFieldLabelMap(def?.child?.children ?? {}),
    [def]
  );

  const getLabel = (field: string, fallback?: string) =>
    fieldLabelMap[field] ?? (fallback ? i18n.t?.(fallback) ?? fallback : field);

  const clickable = typeof onItemClick === "function";

  if (!value?.length) {
    return <EmptySlot message={i18n.t("No product information")} />;
  }

  return (
    <View className="gap-4 w-full">
      {value.map((item, index) => {
        const weightUnit = item.unit || "kg";

        return (
          <ItemCard
            key={item.id ?? index}
            clickable={clickable}
            onPress={clickable ? () => onItemClick?.(index) : undefined}
          >
            {/* ================= Header ================= */}
            <Text className="text-base font-semibold text-gray-900 mb-1">
              {item.product_name || getLabel("product_name", "Unnamed Product")}
            </Text>

            {item.specification && (
              <Text className="text-sm text-gray-600 mb-3">
                {getLabel("specification")}: {item.specification}
              </Text>
            )}

            {/* ================= Attributes ================= */}
            <View className="flex-row gap-2 flex-wrap mb-3">
              {item.size && (
                <Tag color="blue">
                  {getLabel("size")}: {item.size}
                </Tag>
              )}
              {item.unit && (
                <Tag color="cyan">
                  {getLabel("unit")}: {item.unit}
                </Tag>
              )}
              {item.glazing && (
                <Tag color="purple">
                  {getLabel("glazing")}:{" "}
                  {(Number(item.glazing) * 100).toFixed(0)}%
                </Tag>
              )}
            </View>

            {/* ================= Purchase Info ================= */}
            <InfoSection title={i18n.t("Purchase Information")}>
              <View className="flex-row gap-4 flex-wrap">
                <InfoField
                  label={getLabel("purchase_qty")}
                  value={item.purchase_qty}
                  format={formatNumberTrim}
                />
                <InfoField
                  label={getLabel("unit_price")}
                  value={item.unit_price}
                  format={formatNumberTrim}
                />
                <InfoField
                  label={getLabel("total_price")}
                  value={item.total_price}
                  format={formatNumberTrim}
                />
              </View>
            </InfoSection>

            {/* ================= Packaging ================= */}
            <InfoSection title={i18n.t("Packaging")}>
              <View className="flex-row gap-4 flex-wrap">
                <InfoField
                  label={getLabel("inner_packaging")}
                  value={item.inner_packaging}
                />
                <InfoField
                  label={getLabel("outter_packaging")}
                  value={item.outter_packaging}
                />
              </View>
            </InfoSection>

            {/* ================= Weight ================= */}
            <InfoSection title={i18n.t("Weight Information")}>
              <View className="flex-row gap-4 flex-wrap">
                <InfoField
                  label={getLabel("gross_weight")}
                  value={item.gross_weight}
                  format={formatNumberTrim}
                  suffix={weightUnit}
                />
                <InfoField
                  label={getLabel("net_weight")}
                  value={item.net_weight}
                  format={formatNumberTrim}
                  suffix={weightUnit}
                />
                <InfoField
                  label={getLabel("total_gross_weight")}
                  value={item.total_gross_weight}
                  format={formatNumberTrim}
                  suffix={weightUnit}
                />
                <InfoField
                  label={getLabel("total_net_weight")}
                  value={item.total_net_weight}
                  format={formatNumberTrim}
                  suffix={weightUnit}
                />
              </View>
            </InfoSection>
          </ItemCard>
        );
      })}
    </View>
  );
}
