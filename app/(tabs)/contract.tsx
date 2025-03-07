import { Table } from "@/components/table/AntdTable";
import useDataService from "@/hooks/useDataService";
import React from "react";

export default function ContractScreen() {
  const { list } = useDataService();

  /**
   * Helper function to format contact data into selectable options
   * @param contacts - Array of contact objects
   * @returns Array of formatted contact options
   */
  const formatContactOptions = (contacts: any[]) =>
    contacts
      .map(({ full_name }) => full_name?.trim()) // 确保 `full_name` 不是 `null` 或 `undefined`
      .filter(Boolean) // 过滤掉 `null`、`undefined`、空字符串 `""`
      .map((fullName) => ({ value: fullName, label: fullName }));
  

  /**
   * Fetch contact options for the lookup field based on the search query
   * @param search - Search query string
   * @returns Array of formatted contact options
   */
  const searchContact = async (search: string) => {
    try {
      const { data } = await list("contact", { search, page_size: 5 });
      return formatContactOptions(data.results); // Format the API results into selectable options
    } catch (error) {
      console.error("Error loading lookup data: ", error);
      return []; // Return empty array on error
    }
  };

  // Column configuration for the table
  const colConfig = {
    pk: { width: 30 },
    contract_code: { width: 150 },
    contract_date: { width: 120 },
    stage: { width: 100 },
    owner: { hidden: true }, // Hide the owner column
    created_at: { hidden: true }, // Hide the created_at column
    updated_at: { hidden: true }, // Hide the updated_at column
    "contact.full_name": {
      variant: "lookup",
      getOptions: searchContact,
    },
    "orders.pk": { hidden: true, width: 30 }, // Hide nested order ID column
    "orders.order_code": { width: 150 },
    "orders.destination_port": { width: 150 },
    "orders.deposit": { variant: "currency" },
    "orders.products.pk": { hidden: true, width: 30 }, // Hide nested product ID column
    "orders.balance": { variant: "currency" },
    "orders.products.glazing": { variant: "percentage" },
    "orders.products.price": { variant: "currency5", width: 120 },
    "orders.products.total_price": { variant: "currency5", width: 120 },
  };

  const roundToDecimals = (num: number, decimals = 5) => {
    return typeof num === "number" && !isNaN(num) ? parseFloat(num.toFixed(decimals)) : null;
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
