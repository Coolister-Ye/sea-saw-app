// import { Table } from "@/components/sea/table/AntdTable";
import { Table } from "@/components/table/AntdTable";
import React from "react";

export default function CompanyScreen() {
  const colConfig = {
    pk: { width: 50 },
    owner: { hidden: true }, // Hide the owner column
    created_at: { hidden: true }, // Hide the created_at column
    updated_at: { hidden: true }, // Hide the updated_at column
    created_by: { hidden: true },
    updated_by: { hidden: true },
  };

  return <Table table="company" colConfig={colConfig} />;
}
