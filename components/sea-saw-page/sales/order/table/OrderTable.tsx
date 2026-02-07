import React, { useMemo, forwardRef } from "react";
import { AgGridReact } from "ag-grid-react";

import Table from "@/components/sea-saw-design/table";
import { theme } from "@/components/sea-saw-design/table/theme";

import AccountCell from "@/components/sea-saw-page/crm/account/table/AccountCell";
import ContactCell from "@/components/sea-saw-page/crm/contact/table/ContactCell";
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
        account: { cellRenderer: AccountCell },
        contact: { cellRenderer: ContactCell },
        order_items: { cellRenderer: OrderItemsCell },
        attachments: { cellRenderer: AttachmentsRender },
        status: { cellRenderer: OrderStatusCell },
        related_pipeline: { cellRenderer: PipelineCell },
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
        rowSelection={{ mode: "singleRow" }}
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
