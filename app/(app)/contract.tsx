import { Table } from "@/components/table/AntdTable";
import { EllipsisTooltip } from "@/components/table/EllipsisTooltip";
import { formatOptions } from "@/components/table/LookupOption";
import useDataService from "@/hooks/useDataService";
import { Progress, Tag } from "antd";
import React from "react";
import { Text, View } from "react-native";

function ProgressQuantityCell({ val, record }: { val: any; record: any }) {
  const { ["orders.products.quantity"]: quantity } = record;
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

type Stage = "进行中" | "已完成" | "已取消" | "延迟中" | "问题单";
function StageCell({ val }: { val: Stage }) {
  const colorMap = {
    进行中: "blue",
    已完成: "green",
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

export default function ContractScreen() {
  const { list } = useDataService();

  /**
   * Fetch contact options for the lookup field based on the search query
   * @param search - Search query string
   * @returns Array of formatted contact options
   */
  const searchContact = async (search: string) => {
    try {
      const { data } = await list({
        contentType: "contact",
        params: { search, page_size: 5 },
      });
      return formatOptions(data.results, "full_name"); // Format the API results into selectable options
    } catch (error) {
      console.error("Error loading lookup data: ", error);
      return [];
    }
  };

  // Column configuration for the table
  const colConfig = {
    pk: { width: 30 },
    contract_code: { width: 150 },
    contract_date: { width: 120 },
    stage: { width: 100, render: (text: any) => <StageCell val={text} /> },
    owner: { hidden: true }, // Hide the owner column
    created_at: { hidden: true }, // Hide the created_at column
    updated_at: { hidden: true }, // Hide the updated_at column
    "contact.pk": { hidden: true, width: 30 }, // Hide nested contact ID column
    "contact.full_name": {
      variant: "lookup",
      getOptions: searchContact,
    },
    "orders.pk": { hidden: true, width: 30 }, // Hide nested order ID column
    "orders.order_code": { width: 150 },
    "orders.stage": {
      width: 100,
      render: (text: any) => <OrderStageCell val={text} />,
    },
    "orders.destination_port": { width: 150 },
    "orders.deposit": { variant: "currency" },
    "orders.products.pk": { hidden: true, width: 30 }, // Hide nested product ID column
    "orders.balance": { variant: "currency" },
    "orders.products.glazing": { variant: "percentage" },
    "orders.products.price": { variant: "currency5", width: 120 },
    "orders.products.total_price": { variant: "currency5", width: 120 },
    "orders.products.progress_quantity": {
      width: 120,
      render: (text: any, record: any) => (
        <ProgressQuantityCell val={text} record={record} />
      ),
    },
  };

  const roundToDecimals = (num: number, decimals = 5) => {
    return typeof num === "number" && !isNaN(num)
      ? parseFloat(num.toFixed(decimals))
      : null;
  };

  const formula = {
    "orders.products.total_price": (inputs: Record<string, any>) => {
      let weight = parseFloat(inputs["orders.products.weight"]);
      let quantity = parseFloat(inputs["orders.products.quantity"]);
      let price = parseFloat(inputs["orders.products.price"]);

      // 如果有任何值无效，则返回 null
      if (isNaN(weight) || isNaN(quantity) || isNaN(price)) {
        return null;
      }

      return roundToDecimals(weight * quantity * price);
    },
    "orders.products.progress_weight": (inputs: Record<string, any>) => {
      let quantity = parseFloat(inputs["orders.products.progress_quantity"]);
      let weight = parseFloat(inputs["orders.products.weight"]);

      if (isNaN(quantity) || isNaN(weight)) {
        return null;
      }

      return roundToDecimals(quantity * weight, 2);
    },
    "orders.products.total_net_weight": (inputs: Record<string, any>) => {
      let quantity = parseFloat(inputs["orders.products.quantity"]);
      let net_weight = parseFloat(inputs["orders.products.net_weight"]);

      if (isNaN(quantity) || isNaN(net_weight)) {
        return null;
      }

      return roundToDecimals(quantity * net_weight, 2);
    },
  };

  return (
    <Table
      table="contract" // Table identifier
      colConfig={colConfig} // Pass column configuration
      formula={formula}
    />
  );
}
