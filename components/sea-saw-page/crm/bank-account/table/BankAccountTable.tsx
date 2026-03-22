import React, { useMemo } from "react";
import type { CustomCellRendererProps } from "ag-grid-react";

import Table from "@/components/sea-saw-design/table";
import { theme } from "@/components/sea-saw-design/table/theme";
import { AccountPopover } from "@/components/sea-saw-page/crm/account/display";
import type { HeaderMetaProps } from "@/components/sea-saw-design/table/interface";

interface BankAccountTableProps {
  tableRef?: React.Ref<any>;
  headerMeta?: HeaderMetaProps | Record<string, HeaderMetaProps>;
  queryParams?: Record<string, any>;
  columnOrder?: string[];
  [key: string]: any;
}

export default function BankAccountTable({
  tableRef,
  headerMeta,
  queryParams,
  columnOrder,
  ...tableProps
}: BankAccountTableProps) {
  const colRenderers = useMemo(
    () => ({
      account: {
        cellRenderer: (params: CustomCellRendererProps) => {
          const value = params.value ?? {};
          const def = params.context?.meta?.account?.children;
          return <AccountPopover value={value} def={def} />;
        },
      },
    }),
    [],
  );

  return (
    <Table
      ref={tableRef}
      table="bankAccount"
      headerMeta={headerMeta}
      theme={theme}
      colDefinitions={colRenderers}
      context={{ meta: headerMeta }}
      rowSelection={{ mode: "singleRow" }}
      queryParams={queryParams}
      columnOrder={columnOrder}
      hideWriteOnly
      {...tableProps}
    />
  );
}
