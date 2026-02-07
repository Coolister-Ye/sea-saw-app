import React, { useMemo } from "react";
import type { CustomCellRendererProps } from "ag-grid-react";

import Table from "@/components/sea-saw-design/table";
import { theme } from "@/components/sea-saw-design/table/theme";
import { AccountPopover } from "@/components/sea-saw-page/crm/account/display";
import type { HeaderMetaProps } from "@/components/sea-saw-design/table/interface";

interface ContactTableProps {
  tableRef?: React.Ref<any>;
  headerMeta?: HeaderMetaProps | Record<string, HeaderMetaProps>;
  queryParams?: Record<string, any>;
  columnOrder?: string[];
  [key: string]: any;
}

export default function ContactTable({
  tableRef,
  headerMeta,
  queryParams,
  columnOrder,
  ...tableProps
}: ContactTableProps) {
  const colRenderers = useMemo(
    () => ({
      account: {
        cellRenderer: (params: CustomCellRendererProps) => {
          const value = params.value ?? {};
          return <AccountPopover value={value} />;
        },
      },
    }),
    [],
  );

  return (
    <Table
      ref={tableRef}
      table="contact"
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
