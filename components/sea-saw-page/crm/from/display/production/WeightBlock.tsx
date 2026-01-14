import React from "react";
import { View } from "react-native";
import i18n from "@/locale/i18n";
import { formatNumber } from "@/utils";
import SectionTitle from "./SectionTitle";
import WeightItem from "./WeightItem";
import { ProductionItem } from "./types";

interface WeightBlockProps {
  item: ProductionItem;
  label: (field: string, fallback?: string) => string;
}

export default function WeightBlock({ item, label }: WeightBlockProps) {
  if (
    !item.gross_weight &&
    !item.net_weight &&
    !item.total_gross_weight &&
    !item.total_net_weight
  ) {
    return null;
  }

  return (
    <View className="bg-white p-3 rounded border border-gray-200">
      <SectionTitle>{i18n.t("Weight Information")}</SectionTitle>

      <View className="flex-row gap-4 flex-wrap">
        {item.gross_weight && (
          <WeightItem
            title={label("gross_weight")}
            value={formatNumber(item.gross_weight)}
          />
        )}
        {item.net_weight && (
          <WeightItem
            title={label("net_weight")}
            value={formatNumber(item.net_weight)}
          />
        )}
        {item.total_gross_weight && (
          <WeightItem
            title={label("total_gross_weight")}
            value={formatNumber(item.total_gross_weight)}
          />
        )}
        {item.total_net_weight && (
          <WeightItem
            title={label("total_net_weight")}
            value={formatNumber(item.total_net_weight)}
          />
        )}
      </View>
    </View>
  );
}
