import React, { useMemo, forwardRef } from "react";
import type { CustomCellRendererProps } from "ag-grid-react";
import { AgGridReact } from "ag-grid-react";

import Table from "@/components/sea-saw-design/table";
import { theme } from "@/components/sea-saw-design/table/theme";

import AccountCell from "@/components/sea-saw-page/crm/account/table/AccountCell";
import ContactCell from "@/components/sea-saw-page/crm/contact/table/ContactCell";
import { BankAccountPopover } from "@/components/sea-saw-page/crm/bank-account/display";
import AttachmentsRender from "@/components/sea-saw-page/base/table/AttachmentsRender";
import PipelineCell from "@/components/sea-saw-page/pipeline/table/PipelineCell";
import OrderPopover from "@/components/sea-saw-page/sales/order/display/OrderPopover";
import PurchaseOrderStatusCell from "./PurchaseOrderStatusCell";
import PurchaseOrderItemsCell from "./PurchaseOrderItemsCell";

interface PurchaseOrderTableProps {
  headerMeta: Record<string, any>;
  onRowClicked?: (e: any) => void;
  columnOrder?: string[];
  [key: string]: any;
}

const PurchaseOrderTable = forwardRef<AgGridReact, PurchaseOrderTableProps>(
  ({ headerMeta, onRowClicked, columnOrder, ...restProps }, ref) => {
    const colRenderers = useMemo(
      () => ({
        purchase_code: { width: 200 },
        supplier: { cellRenderer: AccountCell, width: 200 },
        contact: { cellRenderer: ContactCell },
        bank_account: {
          cellRenderer: (params: CustomCellRendererProps) => {
            const value = params.value ?? {};
            const def = params.context?.meta?.bank_account?.children;
            return <BankAccountPopover value={value} def={def} />;
          },
        },
        purchase_items: { cellRenderer: PurchaseOrderItemsCell, width: 200 },
        attachments: { cellRenderer: AttachmentsRender },
        status: { cellRenderer: PurchaseOrderStatusCell },
        related_pipeline: { cellRenderer: PipelineCell, width: 200 },
        related_order: {
          cellRenderer: (params: CustomCellRendererProps) => {
            const value = params.value ?? null;
            const def = params.context?.meta?.related_order?.children;
            return <OrderPopover value={value} def={def} />;
          },
          width: 180,
        },
      }),
      [],
    );

    return (
      <Table
        ref={ref}
        table="purchaseOrder"
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

PurchaseOrderTable.displayName = "PurchaseOrderTable";

export default PurchaseOrderTable;
