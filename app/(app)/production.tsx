// import { Table } from "@/components/sea/table/AntdTable";
import { Table } from "@/components/table/AntdTable";
import React from "react";

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
    "products.pk": { hidden: true, width: 30 },
    "products.price": { variant: "currency" },
    "products.total_price": { variant: "currency" },
  };

  const fixedCols = {
    left: ["order_code"], // Fix the contract code column on the left
  };

  const formula = {
    "products.progress_weight": (inputs: Record<string, any>) => {
      let {
        "products.progress_quantity": quantity,
        "products.weight": weight,
      } = inputs;
      weight = typeof weight === "string" ? parseFloat(weight) : weight;
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
