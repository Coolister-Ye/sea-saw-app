import { CustomCellRendererProps } from "ag-grid-react";
import { Popover } from "antd";
import clsx from "clsx";
import { View, Text } from "react-native";

interface OrderMeta {
  orders?: {
    child?: {
      children?: Record<string, { label: string }>;
    };
  };
}

interface OrderValue {
  pk?: string;
  order_code?: string;
  stage?: string;
  [key: string]: any;
}

function OrderRender(props: CustomCellRendererProps) {
  const value: OrderValue[] = props.value ?? [];
  const meta: OrderMeta = props.context?.meta ?? {};

  const renderOrderBox = (order: OrderValue) => {
    const { stage } = order;
    return (
      <View
        key={order.pk || order.order_code} // 添加唯一 key
        className={clsx(
          "bg-gray-200 p-1 rounded",
          stage === "完成" && "bg-green-200"
        )}
      >
        <Text
          className={
            "text-blue-600 text-xs cursor-pointer hover:text-blue-800 truncate"
          }
        >
          {order.order_code}
        </Text>
      </View>
    );
  };

  return (
    <View className="h-full justify-center">
      <Popover title={false} trigger="hover">
        <View className="flex flex-row gap-2" style={{ cursor: "pointer" }}>
          {value.filter((v) => v.order_code).map((v) => renderOrderBox(v))}
        </View>
      </Popover>
    </View>
  );
}

export default OrderRender;
export { OrderRender };
