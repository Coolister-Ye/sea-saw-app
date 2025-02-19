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
      .map(({ first_name = "", last_name = "" }) =>
        `${first_name} ${last_name}`.trim()
      ) // Concatenate first and last names, trimming whitespace
      .filter(Boolean) // Remove empty or falsy names
      .map((fullName: string) => ({ value: fullName, label: fullName })); // Transform to {value, label} structure

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
    "orders.products.price": { variant: "currency" },
    "orders.products.total_price": { variant: "currency" },
  };

  const formula = {
    "orders.products.total_price": (inputs: Record<string, any>) => {
      let {
        "orders.products.weight": weight,
        "orders.products.quantity": quantity,
        "orders.products.price": price,
      } = inputs;

      // 提取 weight 数值
      weight = typeof weight === "string" ? parseFloat(weight) : weight;
      return weight * quantity * price;
    },
    "orders.products.progress_weight": (inputs: Record<string, any>) => {
      let {
        "orders.products.progress_quantity": quantity,
        "orders.products.weight": weight,
      } = inputs;
      weight = typeof weight === "string" ? parseFloat(weight) : weight;
      return quantity * weight;
    },
    "orders.products.total_net_weight": (inputs: Record<string, any>) => {
      let {
        "orders.products.quantity": quantity,
        "orders.products.net_weight": net_weight,
      } = inputs;
      return quantity * net_weight;
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
