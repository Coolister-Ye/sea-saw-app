import { Table } from "@/components/table/AntdTable";
import { EllipsisTooltip } from "@/components/table/EllipsisTooltip";
import { Progress, Tag } from "antd";
import React from "react";
import { View, Text } from "react-native";

function ProgressQuantityCell({ val, record }: { val: any; record: any }) {
  const { ["products.quantity"]: quantity } = record;
  const progress = (val / quantity) * 100;
  return (
    <View className="flex flex-row items-center justify-between">
      <EllipsisTooltip title={val}>
        <Text className="text-xs">{val}</Text>
      </EllipsisTooltip>
      <Progress type="circle" percent={progress} size={20} format={(precent) => `${precent?.toFixed(2)}%`}/>
    </View>
  );
}

type OrderStage =
  | "生产中"
  | "已完成生产"
  | "运输中"
  | "支付中"
  | "完成"
  | "已取消"
  | "延迟中"
  | "问题单";
function OrderStageCell({ val }: { val: OrderStage }) {
  const colorMap = {
    生产中: "blue",
    已完成生产: "green",
    运输中: "orange",
    支付中: "yellow",
    完成: "green",
    已取消: "#ff4d4f",
    延迟中: "orange",
    问题单: "red",
  };

  return (
    <EllipsisTooltip title={val}>
      {val ? <Tag color={colorMap[val] || ""}>{val}</Tag> : ""}
    </EllipsisTooltip>
  );
}

export default function OrderScreen() {
  const colConfig = {
    pk: { width: 30 },
    order_code: { width: 150 },
    destination_port: { width: 150 },
    owner: { hidden: true }, // Hide the owner column
    created_at: { hidden: true }, // Hide the created_at column
    updated_at: { hidden: true }, // Hide the updated_at column
    created_by: { hidden: true },
    updated_by: { hidden: true },
    stage: {
      width: 100,
      render: (text: any) => <OrderStageCell val={text} />,
    },
    "products.pk": { hidden: true, width: 30 },
    "products.price": { variant: "currency" },
    "products.total_price": { variant: "currency" },
    "products.progress_quantity": {
      width: 120,
      render: (text: any, record: any) => (
        <ProgressQuantityCell val={text} record={record} />
      ),
    },
  };

  const fixedCols = {
    left: ["order_code"], // Fix the contract code column on the left
  };

  const formula = {
    "products.progress_weight": (inputs: Record<string, any>) => {
      let quantity = parseFloat(inputs["products.progress_quantity"]);
      let weight = parseFloat(inputs["products.weight"]);
      if (isNaN(quantity) || isNaN(weight)) {
        return null;
      }
      return quantity * weight;
    },
  };

  return (
    <Table
      table="order"
      fixedCols={fixedCols}
      colConfig={colConfig}
      formula={formula}
      actionConfig={{ allowAdd: false, allowDelete: false, allowCreate: false }}
      ordering="-created_at"
    />
  );
}
