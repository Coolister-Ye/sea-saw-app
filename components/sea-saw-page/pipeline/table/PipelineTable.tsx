import React, { useMemo, forwardRef } from "react";
import { AgGridReact } from "ag-grid-react";

import Table from "@/components/sea-saw-design/table";
import { theme } from "@/components/sea-saw-design/table/theme";

import AccountCell from "@/components/sea-saw-page/crm/account/table/AccountCell";
import ContactCell from "@/components/sea-saw-page/crm/contact/table/ContactCell";
import OrdersRender from "@/components/sea-saw-page/sales/order/table/OrdersRender";
import ProductionOrderRender from "@/components/sea-saw-page/production/production-order/table/ProductionOrderRender";
import PurchaseOrderRender from "@/components/sea-saw-page/procurement/purchase-order/table/PurchaseOrderRender";
import OutboundOrdersRender from "@/components/sea-saw-page/warehouse/outbound-order/table/OutboundOrdersRender";
import PaymentsRender from "@/components/sea-saw-page/finance/payment/table/PaymentsRender";
import PipelineStatusCell from "@/components/sea-saw-page/pipeline/table/PipelineStatusCell";
import PipelineTypeCell from "@/components/sea-saw-page/pipeline/table/PipelineTypeCell";

interface PipelineTableProps {
  headerMeta: Record<string, any>;
  onRowClicked?: (e: any) => void;
  columnOrder?: string[];
  [key: string]: any;
}

const PipelineTable = forwardRef<AgGridReact, PipelineTableProps>(
  ({ headerMeta, onRowClicked, columnOrder, ...restProps }, ref) => {
    const colRenderers = useMemo(
      () => ({
        active_entity: { hide: true },
        pipeline_code: { width: 200 },
        account: { cellRenderer: AccountCell },
        contact: { cellRenderer: ContactCell },
        pipeline_type: { cellRenderer: PipelineTypeCell },
        status: { cellRenderer: PipelineStatusCell },
        order: { cellRenderer: OrdersRender, width: 200 },
        purchase_orders: { cellRenderer: PurchaseOrderRender, width: 200 },
        production_orders: { cellRenderer: ProductionOrderRender, width: 200 },
        outbound_orders: { cellRenderer: OutboundOrdersRender, width: 200 },
        payments: { cellRenderer: PaymentsRender, width: 200 },
      }),
      [],
    );

    return (
      <Table
        ref={ref}
        table="pipeline"
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

PipelineTable.displayName = "PipelineTable";

export default PipelineTable;
