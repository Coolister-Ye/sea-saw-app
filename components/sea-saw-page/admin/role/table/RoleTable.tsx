import React from "react";
import type { HeaderMetaProps } from "@/components/sea-saw-design/table/interface";
import Table from "@/components/sea-saw-design/table";
import { theme } from "@/components/sea-saw-design/table/theme";

interface RoleTableProps {
  tableRef?: React.Ref<any>;
  headerMeta?: HeaderMetaProps | Record<string, HeaderMetaProps>;
  queryParams?: Record<string, any>;
  columnOrder?: string[];
  [key: string]: any;
}

export default function RoleTable({
  tableRef,
  headerMeta,
  queryParams,
  columnOrder,
  ...tableProps
}: RoleTableProps) {
  return (
    <Table
      key={JSON.stringify(queryParams)}
      ref={tableRef}
      table="adminRole"
      headerMeta={headerMeta}
      theme={theme}
      context={{ meta: headerMeta }}
      rowSelection={{ mode: "singleRow" }}
      queryParams={queryParams}
      columnOrder={columnOrder}
      hideWriteOnly
      {...tableProps}
    />
  );
}
