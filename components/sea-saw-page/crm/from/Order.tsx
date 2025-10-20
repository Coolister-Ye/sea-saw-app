import { View, Text } from "react-native";
import { useLocale } from "@/context/Locale";
import InputForm from "@/components/sea-saw-design/form/InputForm";
import { FormDef } from "@/hooks/useFormDefs";
import Product from "./Product";
import ModalForm from "./ModalForm";

/** 工具函数：构建 field -> label 映射 */
const buildFieldLabelMap = (
  children?: Record<string, any>
): Record<string, string> => {
  if (!children) return {};
  return Object.entries(children).reduce<Record<string, string>>(
    (acc, [field, meta]) => ({
      ...acc,
      [field]: meta?.label || field,
    }),
    {}
  );
};

function Order({
  def,
  value,
  onChange,
}: {
  def: FormDef;
  value?: any[];
  onChange?: (v: any[]) => void;
}) {
  const { i18n } = useLocale();

  // 订单字段映射
  const orderFieldLabelMap = buildFieldLabelMap(def.child?.children);

  // 产品字段映射
  const productFieldLabelMap = buildFieldLabelMap(
    def.child?.children?.products?.child?.children
  );

  /** 渲染产品详情 */
  const renderProducts = (products: any[]) => (
    <View className="flex flex-row flex-wrap">
      {products.map((prod, idx) => (
        <View key={idx} className="w-1/3 p-2">
          <View className="bg-gray-50 border border-gray-300 rounded p-2">
            <Text className="font-semibold text-gray-700 mb-1">
              {i18n.t("Product")} {idx + 1}
            </Text>
            {Object.entries(prod).map(([pField, pVal]) => (
              <Text key={pField} className="text-gray-600">
                {productFieldLabelMap[pField] || pField}: {String(pVal)}
              </Text>
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  /** 渲染每条订单 */
  const renderItem = (item: any) => (
    <View className="p-3 bg-white rounded-lg my-2">
      {Object.entries(item).map(([field, val]) => (
        <View key={field} className="mb-2">
          {field === "products" ? (
            <>
              <Text className="font-semibold text-gray-800 mb-2">
                {orderFieldLabelMap[field] || field}:
              </Text>
              {Array.isArray(val) ? (
                renderProducts(val)
              ) : (
                <Text className="text-gray-600 ml-4">
                  {JSON.stringify(val, null, 2)}
                </Text>
              )}
            </>
          ) : (
            <Text className="text-gray-800">
              <Text className="font-semibold">
                {orderFieldLabelMap[field] || field}:
              </Text>{" "}
              {String(val)}
            </Text>
          )}
        </View>
      ))}
    </View>
  );

  return (
    <ModalForm
      entityName="order"
      def={def}
      value={value}
      onChange={onChange}
      renderItem={renderItem}
      renderForm={(form, def) => (
        <InputForm
          table="order"
          def={def}
          form={form}
          config={{
            products: {
              render: (
                def: FormDef,
                val: any[],
                onChange: (v: any[]) => void
              ) => <Product def={def} value={val} onChange={onChange} />,
            },
          }}
        />
      )}
    />
  );
}

export default Order;
