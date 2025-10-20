import { useMemo } from "react";
import { View, Text, ScrollView } from "react-native";
import { Button } from "@/components/sea-saw-design/button";
import DisplayForm from "@/components/sea-saw-design/form/DisplayForm";
import Order from "./Order";
import { useLocale } from "@/context/Locale";
import ContactDisplay from "./ContactDisplay";
import OrderDisplay from "./OrderDisplay";

interface ContractDisplayProps {
  onClose?: () => void;
  def?: any;
  data?: Record<string, any>;
}

export default function ContractDisplay({
  onClose,
  def,
  data = {},
}: ContractDisplayProps) {
  const { i18n } = useLocale();

  /** 模块渲染配置 */
  const config = useMemo(
    () => ({
      orders: {
        render: (def: any, value: any) => (
          <View>
            {value &&
              value.map((item: any, index: number) => (
                <OrderDisplay def={def} key={index} value={item} />
              ))}
          </View>
        ),
      },
      contact: {
        render: (def: any, value: any) => (
          <ContactDisplay def={def} value={value} />
        ),
      },
    }),
    []
  );

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="flex flex-row justify-between items-center p-5 border-b border-gray-200 bg-white">
        <Text className="text-lg font-semibold">
          {i18n.t("Contract Details")}
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 p-4"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <DisplayForm
          table="contract"
          def={def}
          data={data}
          config={config}
          className="p-4 rounded"
        />
      </ScrollView>

      {/* Footer */}
      <View className="flex flex-row justify-end gap-3 p-5 border-t border-gray-200 bg-white">
        <Button
          variant="outline"
          className="w-fit h-fit py-1"
          onPress={onClose}
        >
          {i18n.t("Close")}
        </Button>
      </View>
    </View>
  );
}
