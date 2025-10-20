import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { useLocale } from "@/context/Locale";
import ProductDisplay from "./ProductDisplay";
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

interface Order {
  pk: number;
  order_code: string;
  destination_port?: string | null;
  shippment_term?: string | null;
  etd?: string | null;
  deliver_date?: string | null;
  total_amount?: string | null;
  stage?: string | null;
  products?: Product[];
}

interface OrderDisplayProps {
  def: FormDef;
  value?: Order[];
}

export default function OrderDisplay({ def, value }: OrderDisplayProps) {
  const { i18n } = useLocale();
  console.log("OrderDisplay", value);

  const config = useMemo(
    () => ({
      products: {
        render: (def: any, value: any) => (
          <View>
            {value &&
              value.map((item: any, index: number) => (
                <ProductDisplay def={def} key={index} value={item} />
              ))}
          </View>
        ),
      },
    }),
    []
  );

  if (!value) {
    return (
      <View className="p-3 border border-dashed border-gray-300 rounded-lg bg-gray-50">
        <Text className="text-gray-400">{i18n.t("No order information")}</Text>
      </View>
    );
  }

  return (
    <View className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 mb-4">
      {/* 订单基本信息 */}
      <DisplayForm def={def} data={value} config={config} />
    </View>
  );
}
