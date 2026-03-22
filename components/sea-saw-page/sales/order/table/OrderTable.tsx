import React, { useMemo, forwardRef } from "react";
import type { CustomCellRendererProps } from "ag-grid-react";
import { AgGridReact } from "ag-grid-react";

import Table from "@/components/sea-saw-design/table";
import { theme } from "@/components/sea-saw-design/table/theme";

import AccountCell from "@/components/sea-saw-page/crm/account/table/AccountCell";
import ContactCell from "@/components/sea-saw-page/crm/contact/table/ContactCell";
import { BankAccountPopover } from "@/components/sea-saw-page/crm/bank-account/display";
import OrderItemsCell from "@/components/sea-saw-page/sales/order/table/OrderItemsCell";
import AttachmentsRender from "@/components/sea-saw-page/base/table/AttachmentsRender";
import OrderStatusCell from "@/components/sea-saw-page/sales/order/table/OrderStatusCell";
import PipelineCell from "@/components/sea-saw-page/pipeline/table/PipelineCell";

interface OrderTableProps {
  headerMeta: Record<string, any>;
  onRowClicked?: (e: any) => void;
  columnOrder?: string[];
  [key: string]: any;
}

const OrderTable = forwardRef<AgGridReact, OrderTableProps>(
  ({ headerMeta, onRowClicked, columnOrder, ...restProps }, ref) => {
    const colRenderers = useMemo(
      () => ({
        order_code: { width: 200 },
        account: { cellRenderer: AccountCell, width: 200 },
        contact: { cellRenderer: ContactCell },
        bank_account: {
          cellRenderer: (params: CustomCellRendererProps) => {
            const value = params.value ?? {};
            const def = params.context?.meta?.bank_account?.children;
            return <BankAccountPopover value={value} def={def} />;
          },
        },
        order_items: { cellRenderer: OrderItemsCell, width: 200 },
        attachments: { cellRenderer: AttachmentsRender },
        status: { cellRenderer: OrderStatusCell },
        related_pipeline: { cellRenderer: PipelineCell, width: 200 },
      }),
      [],
    );

    return (
      <Table
        ref={ref}
        table="order"
        headerMeta={headerMeta}
        theme={theme}
        colDefinitions={colRenderers}
        context={{ meta: headerMeta }}
        rowSelection={{ mode: "multiRow" }}
        hideWriteOnly={true}
        onRowClicked={onRowClicked}
        columnOrder={columnOrder}
        {...restProps}
      />
    );
  },
);

OrderTable.displayName = "OrderTable";

export default OrderTable;
