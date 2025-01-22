// import { Table } from "@/components/sea/table/AntdTable";
import { Table } from "@/components/table/AntdTable";
import React from "react";

export default function OrderScreen() {
  const colConfig = {
    pk: { width: 50 },
    owner: { hidden: true }, // Hide the owner column
    created_at: { hidden: true }, // Hide the created_at column
    updated_at: { hidden: true }, // Hide the updated_at column
    created_by: { hidden: true },
    updated_by: { hidden: true },
    "products.pk": { hidden: true },
  };

  const fixedCols = {
    right: ["products.progress_quantity"], // Fix the progress column on the right
    left: ["order_code"], // Fix the contract code column on the left
  };

  return (
    <Table
      table="order"
      fixedCols={fixedCols}
      colConfig={colConfig}
      actionConfig={{ allowAdd: false, allowDelete: false, allowCreate: false }}
      ordering="-created_at"
    />
  );
}
