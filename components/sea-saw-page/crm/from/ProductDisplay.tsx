import React from "react";
import { View, Text } from "react-native";
import { useLocale } from "@/context/Locale";
import { FormDef } from "@/hooks/useFormDefs";
import DisplayForm from "@/components/sea-saw-design/form/DisplayForm";

interface Product {
  pk: number;
  product_name: string;
  size?: string | null;
  packaging?: string | null;
  total_price?: string | null;
  total_net_weight?: string | null;
}

interface ProductDisplayProps {
  def: FormDef;
  value?: Product[];
}

export default function ProductDisplay({ def, value }: ProductDisplayProps) {
  const { i18n } = useLocale();

  if (!value) {
    return (
      <View className="p-3 border border-dashed border-gray-300 rounded-lg bg-gray-50">
        <Text className="text-gray-400">
          {i18n.t("No product information")}
        </Text>
      </View>
    );
  }

  return (
    <View className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 mb-3">
      <DisplayForm def={def} data={value} />
    </View>
  );
}
